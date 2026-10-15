import React, { useMemo } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatMonthYear, getPreviousMonth } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  CheckCircle2,
  Calendar,
  ShoppingBag,
  Flame,
  ArrowRight,
  Target,
} from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const {
    transactions,
    categoryBudgetsStatus,
    monthlyExpenses,
    totalMonthlyBudget,
    selectedMonth,
    settings,
    savingsGoals,
    setActiveTab,
  } = useBudget();

  // Transparent calculations for selected month and previous month
  const prevMonthStr = getPreviousMonth(selectedMonth);

  const prevMonthTransactions = useMemo(
    () => transactions.filter((tx) => tx.date && tx.date.startsWith(prevMonthStr)),
    [transactions, prevMonthStr]
  );

  const prevMonthExpenses = useMemo(
    () =>
      prevMonthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    [prevMonthTransactions]
  );

  // Highest spending category in selected month
  const highestCategory = useMemo(() => {
    const sorted = [...categoryBudgetsStatus].sort((a, b) => b.spent - a.spent);
    return sorted[0] && sorted[0].spent > 0 ? sorted[0] : null;
  }, [categoryBudgetsStatus]);

  // Month-over-Month change calculation
  const momChange = useMemo(() => {
    if (prevMonthExpenses === 0) return { diff: 0, percent: 0, direction: 'flat' };
    const diff = monthlyExpenses - prevMonthExpenses;
    const percent = Math.round((diff / prevMonthExpenses) * 100);
    return {
      diff,
      percent: Math.abs(percent),
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
    };
  }, [monthlyExpenses, prevMonthExpenses]);

  // Safe daily allowance calculation for current month
  const dailyAllowance = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === year && today.getMonth() + 1 === month;
    const currentDay = isCurrentMonth ? today.getDate() : 1;
    const daysRemaining = Math.max(daysInMonth - currentDay + 1, 1);

    const remainingBudget = totalMonthlyBudget - monthlyExpenses;
    const daily = remainingBudget > 0 ? remainingBudget / daysRemaining : 0;

    return {
      daily,
      daysRemaining,
      remainingBudget,
    };
  }, [selectedMonth, totalMonthlyBudget, monthlyExpenses]);

  // Discretionary spending analysis (e.g. Entertainment + Shopping vs Essentials)
  const discretionaryCategories = ['entertainment', 'shopping'];
  const discretionarySpent = useMemo(() => {
    return categoryBudgetsStatus
      .filter((c) => discretionaryCategories.includes(c.categoryId))
      .reduce((sum, c) => sum + c.spent, 0);
  }, [categoryBudgetsStatus]);

  const discretionaryPercent =
    monthlyExpenses > 0 ? Math.round((discretionarySpent / monthlyExpenses) * 100) : 0;

  // Potential areas to cut back (categories near or exceeding budget)
  const overspentOrWarning = useMemo(
    () => categoryBudgetsStatus.filter((c) => c.status === 'danger' || c.status === 'warning'),
    [categoryBudgetsStatus]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Financial Insights & Analysis
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
            Real Data Calculations
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Honest, transparent mathematical breakdown of your spending habits in{' '}
          {formatMonthYear(selectedMonth)}
        </p>
      </div>

      {/* Key Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Top Spending Category */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Top Expense Category
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          {highestCategory ? (
            <div>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `${highestCategory.color}15`,
                    color: highestCategory.color,
                  }}
                >
                  <CategoryIcon name={highestCategory.icon} className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
                  {highestCategory.categoryName}
                </h3>
              </div>

              <div className="mt-3">
                <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {formatCurrency(highestCategory.spent, settings.currency)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Represents{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {monthlyExpenses > 0
                      ? Math.round((highestCategory.spent / monthlyExpenses) * 100)
                      : 0}
                    %
                  </strong>{' '}
                  of your total monthly expenses.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4">No spending recorded this month.</p>
          )}
        </div>

        {/* Month-over-Month Trend */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Vs. Previous Month
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                momChange.direction === 'down'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600'
              }`}
            >
              {momChange.direction === 'down' ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-black ${
                  momChange.direction === 'down'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {momChange.direction === 'down' ? '-' : '+'}
                {momChange.percent}%
              </span>
              <span className="text-xs text-slate-400">
                ({formatMonthYear(prevMonthStr)}: {formatCurrency(prevMonthExpenses, settings.currency)})
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {momChange.direction === 'down' ? (
                <span>
                  Great job! You spent{' '}
                  <strong className="text-emerald-600">
                    {formatCurrency(Math.abs(momChange.diff), settings.currency)} less
                  </strong>{' '}
                  compared to last month.
                </span>
              ) : momChange.direction === 'up' ? (
                <span>
                  Spending increased by{' '}
                  <strong className="text-rose-600">
                    {formatCurrency(momChange.diff, settings.currency)}
                  </strong>{' '}
                  this month. Check where surges happened.
                </span>
              ) : (
                <span>Spending is on par with last month.</span>
              )}
            </p>
          </div>
        </div>

        {/* Daily Safe Spending Pace */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Daily Safe Budget Pace
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {formatCurrency(dailyAllowance.daily, settings.currency)}
              <span className="text-xs font-semibold text-slate-400 ml-1">/ day</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              With{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {formatCurrency(Math.max(dailyAllowance.remainingBudget, 0), settings.currency)}
              </strong>{' '}
              remaining for {dailyAllowance.daysRemaining} days in this cycle, this is your recommended daily spend ceiling.
            </p>
          </div>
        </div>
      </div>

      {/* Discretionary vs Essential Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
            <ShoppingBag className="w-4 h-4 text-orange-500" />
            Discretionary Spending Review
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Entertainment and Shopping expenditures vs Essential Living
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Non-essential spending portion
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(discretionarySpent, settings.currency)} ({discretionaryPercent}%)
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  discretionaryPercent > 35 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(discretionaryPercent, 100)}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              {discretionaryPercent > 30 ? (
                <span>
                  💡 Discretionary spending takes up <strong>{discretionaryPercent}%</strong> of your monthly outflows. Trimming online shopping or movies can channel an extra{' '}
                  <strong>{formatCurrency(discretionarySpent * 0.3, settings.currency)}</strong> toward your savings goals.
                </span>
              ) : (
                <span>
                  ✅ Excellent discipline! Your discretionary spending is well controlled under 30% of your expenses.
                </span>
              )}
            </p>
          </div>

          {/* Potential areas to cut */}
          <div className="mt-5 space-y-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Categories Requiring Attention
            </h3>
            {overspentOrWarning.length > 0 ? (
              <div className="space-y-2">
                {overspentOrWarning.map((c) => (
                  <div
                    key={c.categoryId}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CategoryIcon name={c.icon} className="w-4 h-4 text-slate-500" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {c.categoryName}
                      </span>
                    </div>
                    <span
                      className={`font-bold ${
                        c.status === 'danger' ? 'text-rose-600' : 'text-amber-600'
                      }`}
                    >
                      {c.status === 'danger' ? 'Exceeded Budget' : 'Near Limit (>80%)'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 p-2">
                <CheckCircle2 className="w-4 h-4" /> All categories are safely within their limits this month!
              </p>
            )}
          </div>
        </div>

        {/* Actionable Student Budgeting Tips based on Data */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Student Money-Saving Recommendations
            </h2>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
              <p className="font-bold text-indigo-900 dark:text-indigo-200 mb-0.5">
                1. Leverage Student Discounts on Subscriptions
              </p>
              <p className="text-indigo-800/80 dark:text-indigo-300">
                Spotify, YouTube, Apple Music, and Prime offer 50% discount plans with your college email (e.g. ₹59/month instead of ₹119/month).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
              <p className="font-bold text-emerald-900 dark:text-emerald-200 mb-0.5">
                2. Optimize Daily Canteen & Mess Spending
              </p>
              <p className="text-emerald-800/80 dark:text-emerald-300">
                Purchasing monthly meal tokens or grocery bulk supplies reduces daily friction and micro-transactions that add up unexpectedly.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
              <p className="font-bold text-amber-900 dark:text-amber-200 mb-0.5">
                3. Concession Transit Passes
              </p>
              <p className="text-amber-800/80 dark:text-amber-300">
                Apply for a student metro or city bus concession pass. It typically cuts daily commute travel expenditure by 40% to 60%.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Goals Progress Insight */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Progress Toward Savings Goals
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('goals')}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
          >
            Manage Goals <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {savingsGoals.map((g) => {
            const pct = Math.min(Math.round((g.currentSaved / g.targetAmount) * 100), 100);
            return (
              <div key={g.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{g.name}</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden my-2">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{formatCurrency(g.currentSaved, settings.currency)}</span>
                  <span>{formatCurrency(g.targetAmount, settings.currency)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
