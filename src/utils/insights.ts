import { Transaction, Category, SavingsGoal, MonthlyBudget } from '../types';
import {
  filterTransactionsByMonth,
  getTotalExpenses,
  getTotalIncome,
  getCategoryBreakdown,
  formatCurrency,
} from './calculations';

export interface FinancialInsight {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  category?: string;
  metric?: string;
  recommendation?: string;
}

export interface RecurringExpenseItem {
  title: string;
  categoryName: string;
  averageAmount: number;
  occurrences: number;
}

export function generateFinancialInsights(
  allTransactions: Transaction[],
  categories: Category[],
  currentMonth: string, // YYYY-MM
  budget: MonthlyBudget,
  savingsGoals: SavingsGoal[],
  currencySymbol: string = '₹'
): {
  insights: FinancialInsight[];
  topSpendingCategory: { name: string; amount: number; percentage: number } | null;
  lowestSpendingCategory: { name: string; amount: number; percentage: number } | null;
  monthOverMonthChange: { amountDiff: number; percentageDiff: number; isIncrease: boolean } | null;
  recurringExpenses: RecurringExpenseItem[];
  savingsSummary: { totalSaved: number; totalTarget: number; percentage: number };
} {
  const currentMonthTx = filterTransactionsByMonth(allTransactions, currentMonth);
  const currentExpenses = getTotalExpenses(currentMonthTx);
  const currentIncome = getTotalIncome(currentMonthTx);

  // Previous month calculation
  const [currYearStr, currMonthStr] = currentMonth.split('-');
  const currYear = parseInt(currYearStr, 10);
  const currMonthNum = parseInt(currMonthStr, 10);
  const prevDate = new Date(currYear, currMonthNum - 2, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthTx = filterTransactionsByMonth(allTransactions, prevMonthStr);
  const prevExpenses = getTotalExpenses(prevMonthTx);

  // Month-over-month calculation
  let monthOverMonthChange = null;
  if (prevMonthTx.length > 0 && prevExpenses > 0) {
    const diff = currentExpenses - prevExpenses;
    const pct = Math.round((diff / prevExpenses) * 100);
    monthOverMonthChange = {
      amountDiff: diff,
      percentageDiff: Math.abs(pct),
      isIncrease: diff > 0,
    };
  }

  // Category breakdown
  const breakdowns = getCategoryBreakdown(currentMonthTx, categories, budget.categoryBudgets);
  const activeSpendCategories = breakdowns.filter(b => b.spent > 0).sort((a, b) => b.spent - a.spent);

  const topSpendingCategory = activeSpendCategories.length > 0
    ? {
        name: activeSpendCategories[0].categoryName,
        amount: activeSpendCategories[0].spent,
        percentage: activeSpendCategories[0].percentageOfTotalExpense,
      }
    : null;

  const lowestSpendingCategory = activeSpendCategories.length > 1
    ? {
        name: activeSpendCategories[activeSpendCategories.length - 1].categoryName,
        amount: activeSpendCategories[activeSpendCategories.length - 1].spent,
        percentage: activeSpendCategories[activeSpendCategories.length - 1].percentageOfTotalExpense,
      }
    : null;

  // Recurring expenses detection (e.g. transactions with same title or in Subscriptions/Mobile/Accommodation)
  const titleCounts = new Map<string, { total: number; count: number; categoryId: string }>();
  allTransactions.filter(t => t.type === 'expense').forEach(t => {
    const key = t.title.trim().toLowerCase();
    const existing = titleCounts.get(key) || { total: 0, count: 0, categoryId: t.categoryId };
    titleCounts.set(key, {
      total: existing.total + Number(t.amount),
      count: existing.count + 1,
      categoryId: t.categoryId,
    });
  });

  const recurringExpenses: RecurringExpenseItem[] = [];
  titleCounts.forEach((data, titleKey) => {
    const cat = categories.find(c => c.id === data.categoryId);
    const isSubscriptionType = cat?.id === 'cat-subscriptions' || cat?.id === 'cat-mobile' || cat?.id === 'cat-accom';
    if (data.count >= 2 || isSubscriptionType) {
      // Find original casing
      const orig = allTransactions.find(t => t.title.trim().toLowerCase() === titleKey);
      recurringExpenses.push({
        title: orig ? orig.title : titleKey,
        categoryName: cat?.name || 'General',
        averageAmount: Math.round(data.total / data.count),
        occurrences: data.count,
      });
    }
  });

  // Savings progress summary
  const totalSaved = savingsGoals.reduce((acc, g) => acc + g.currentSavedAmount, 0);
  const totalTarget = savingsGoals.reduce((acc, g) => acc + g.targetAmount, 0);
  const savingsPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const savingsSummary = { totalSaved, totalTarget, percentage: savingsPct };

  // Generate actionable Insights List
  const insights: FinancialInsight[] = [];

  // Insight 1: Budget Alert over 100% or 80%
  breakdowns.forEach(item => {
    if (item.limit > 0 && item.percentageUsed >= 100) {
      insights.push({
        id: `overspend-${item.categoryId}`,
        type: 'danger',
        title: `Over Budget in ${item.categoryName}`,
        message: `You have spent ${item.percentageUsed}% (${formatCurrency(item.spent, currencySymbol)}) of your ${formatCurrency(item.limit, currencySymbol)} budget for ${item.categoryName}.`,
        category: item.categoryName,
        recommendation: `Pause non-essential purchases in ${item.categoryName} for the rest of this month to avoid tapping into your savings.`,
      });
    } else if (item.limit > 0 && item.percentageUsed >= 80) {
      insights.push({
        id: `warning-${item.categoryId}`,
        type: 'warning',
        title: `Nearing Limit: ${item.categoryName}`,
        message: `You have spent ${item.percentageUsed}% of your ${item.categoryName} budget. Remaining: ${formatCurrency(item.remaining, currencySymbol)}.`,
        category: item.categoryName,
        recommendation: item.categoryName.includes('Food')
          ? 'Consider planning hostel meals and watching small daily canteen snacks.'
          : `Plan your remaining spend carefully as you have only ${formatCurrency(item.remaining, currencySymbol)} left.`,
      });
    } else if (item.limit > 0 && item.remaining > 0 && item.percentageUsed > 0 && item.percentageUsed < 60) {
      insights.push({
        id: `healthy-${item.categoryId}`,
        type: 'success',
        title: `Healthy Budget in ${item.categoryName}`,
        message: `You have ${formatCurrency(item.remaining, currencySymbol)} remaining in your ${item.categoryName} budget (${item.percentageUsed}% used).`,
        category: item.categoryName,
        recommendation: 'You are on track! Surplus budget at month-end can be directed to your savings goals.',
      });
    }
  });

  // Insight 2: Month over Month spend change
  if (monthOverMonthChange) {
    if (monthOverMonthChange.isIncrease && monthOverMonthChange.percentageDiff > 10) {
      insights.push({
        id: 'mom-increase',
        type: 'warning',
        title: 'Monthly Spending Increased',
        message: `Your total spending is ${monthOverMonthChange.percentageDiff}% higher (${formatCurrency(monthOverMonthChange.amountDiff, currencySymbol)}) than last month at this time.`,
        recommendation: 'Review your recent transactions to check if there were one-time fees like book purchases or semester fees.',
      });
    } else if (!monthOverMonthChange.isIncrease && monthOverMonthChange.percentageDiff > 5) {
      insights.push({
        id: 'mom-decrease',
        type: 'success',
        title: 'Spending Under Control',
        message: `Great discipline! You have spent ${monthOverMonthChange.percentageDiff}% less (${formatCurrency(monthOverMonthChange.amountDiff, currencySymbol)}) compared to last month.`,
        recommendation: 'Keep maintaining this steady spending rate to boost your emergency reserve.',
      });
    }
  }

  // Insight 3: Income vs Expense ratio
  if (currentIncome > 0) {
    const expenseRatio = Math.round((currentExpenses / currentIncome) * 100);
    if (expenseRatio > 90) {
      insights.push({
        id: 'high-burn-rate',
        type: 'danger',
        title: 'High Burn Rate',
        message: `You have spent ${expenseRatio}% of this month's recorded income (${formatCurrency(currentExpenses, currencySymbol)} of ${formatCurrency(currentIncome, currencySymbol)}).`,
        recommendation: 'Consider cutting back on entertainment and eating out to avoid running out of funds before next month.',
      });
    } else if (expenseRatio <= 65) {
      insights.push({
        id: 'great-savings-rate',
        type: 'success',
        title: 'High Savings Potential',
        message: `You have used only ${expenseRatio}% of this month's income. You have ${formatCurrency(currentIncome - currentExpenses, currencySymbol)} retained.`,
        recommendation: 'Allocate part of this surplus towards your savings goals like your laptop or course funds!',
      });
    }
  }

  // Insight 4: Savings goal milestone
  savingsGoals.forEach(goal => {
    const pct = Math.round((goal.currentSavedAmount / goal.targetAmount) * 100);
    if (pct >= 100) {
      insights.push({
        id: `goal-completed-${goal.id}`,
        type: 'success',
        title: `Goal Achieved: ${goal.name}`,
        message: `Congratulations! You have reached 100% of your ${formatCurrency(goal.targetAmount, currencySymbol)} target for "${goal.name}".`,
        recommendation: 'You can now execute your purchase or archive this goal and set a new one.',
      });
    } else if (pct >= 75) {
      insights.push({
        id: `goal-near-${goal.id}`,
        type: 'info',
        title: `Near Target: ${goal.name}`,
        message: `You are at ${pct}% of your target for "${goal.name}". Only ${formatCurrency(goal.targetAmount - goal.currentSavedAmount, currencySymbol)} remaining.`,
        recommendation: 'Just a little more effort to cross the finish line!',
      });
    }
  });

  return {
    insights,
    topSpendingCategory,
    lowestSpendingCategory,
    monthOverMonthChange,
    recurringExpenses: recurringExpenses.slice(0, 5),
    savingsSummary,
  };
}
