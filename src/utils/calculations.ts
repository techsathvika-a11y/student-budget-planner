import { Transaction, Category, SavingsGoal } from '../types';

/**
 * Filter transactions by month string (format: 'YYYY-MM')
 */
export function filterTransactionsByMonth(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter(t => t.date.startsWith(month));
}

/**
 * Total Income within a given set of transactions (e.g., for a specific month or custom range)
 */
export function getTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

/**
 * Total Expenses within a given set of transactions
 */
export function getTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

/**
 * Cumulative Net Balance (All recorded income minus all recorded expenses)
 */
export function getCumulativeNetBalance(allTransactions: Transaction[]): number {
  const income = getTotalIncome(allTransactions);
  const expenses = getTotalExpenses(allTransactions);
  return income - expenses;
}

/**
 * Total money currently allocated in savings goals
 */
export function getTotalMoneySaved(savingsGoals: SavingsGoal[]): number {
  return savingsGoals.reduce((sum, goal) => sum + Number(goal.currentSavedAmount || 0), 0);
}

/**
 * Available Balance = Cumulative Net Balance minus Money allocated to Savings Goals.
 * Prevents double-counting and ensures the student knows what is truly free to spend.
 */
export function getAvailableBalance(
  allTransactions: Transaction[],
  savingsGoals: SavingsGoal[]
): number {
  const net = getCumulativeNetBalance(allTransactions);
  const saved = getTotalMoneySaved(savingsGoals);
  return net - saved;
}

/**
 * Get spending for a specific category within given transactions
 */
export function getCategorySpending(transactions: Transaction[], categoryId: string): number {
  return transactions
    .filter(t => t.type === 'expense' && t.categoryId === categoryId)
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

/**
 * Calculate budget usage percentage safely
 */
export function getBudgetUsagePercentage(spent: number, limit: number): number {
  if (!limit || limit <= 0) return 0;
  return Math.round((spent / limit) * 100);
}

/**
 * Calculate savings goal progress percentage (capped at 100 for standard progress displays)
 */
export function getSavingsGoalProgress(saved: number, target: number): number {
  if (!target || target <= 0) return 0;
  const pct = Math.round((saved / target) * 100);
  return Math.min(100, Math.max(0, pct));
}

/**
 * Format currency with symbol and Indian number system (or standard locale)
 */
export function formatCurrency(
  amount: number,
  currencySymbol: string = '₹',
  showDecimals: boolean = false
): string {
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absAmount);

  const sign = amount < 0 ? '-' : '';
  return `${sign}${currencySymbol}${formatted}`;
}

/**
 * Format date nicely (e.g., '14 Oct 2026')
 */
export function formatDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Get category spending breakdown with percentages
 */
export interface CategorySpendingBreakdown {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  spent: number;
  limit: number;
  remaining: number;
  percentageUsed: number;
  percentageOfTotalExpense: number;
}

export function getCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  categoryBudgets: Record<string, number>
): CategorySpendingBreakdown[] {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const totalExpense = getTotalExpenses(expenseTransactions);

  const expenseCategories = categories.filter(c => c.type === 'expense');

  return expenseCategories.map(cat => {
    const spent = getCategorySpending(expenseTransactions, cat.id);
    const limit = categoryBudgets[cat.id] ?? cat.budgetLimit ?? 0;
    const remaining = Math.max(0, limit - spent);
    const percentageUsed = getBudgetUsagePercentage(spent, limit);
    const percentageOfTotalExpense = totalExpense > 0 ? Math.round((spent / totalExpense) * 100) : 0;

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      color: cat.color,
      icon: cat.icon,
      spent,
      limit,
      remaining,
      percentageUsed,
      percentageOfTotalExpense,
    };
  });
}
