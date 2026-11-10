import React from 'react';
import { useApp } from '../context/AppContext';
import { generateFinancialInsights } from '../utils/insights';
import { formatCurrency } from '../utils/calculations';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Repeat,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  BarChart2,
} from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const {
    currentMonth,
    transactions,
    categories,
    savingsGoals,
    getCurrentBudget,
    userProfile,
    setActivePage,
  } = useApp();

  const currentBudget = getCurrentBudget(currentMonth);

  const {
    insights,
    topSpendingCategory,
    lowestSpendingCategory,
    monthOverMonthChange,
    recurringExpenses,
    savingsSummary,
  } = generateFinancialInsights(
    transactions,
    categories,
    currentMonth,
    currentBudget,
    savingsGoals,
    userProfile.currency.symbol
  );

  const [yearStr, monthStr] = currentMonth.split('-');
  const monthName = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'danger':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      default:
        return <Lightbulb className="w-5 h-5 text-indigo-500 shrink-0" />;
    }
  };

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'danger':
        return 'border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20';
      case 'warning':
        return 'border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20';
      case 'success':
        return 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20';
      default:
        return 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Financial Insights for {monthName}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Algorithmic analysis of your recorded income, expenses, and savings habits
          </p>
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top Spending Category */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Highest Spending Category
          </span>
          {topSpendingCategory ? (
            <div className="mt-2">
              <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                {topSpendingCategory.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatCurrency(topSpendingCategory.amount, userProfile.currency.symbol)} (
                {topSpendingCategory.percentage}% of expenses)
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-2">No expenses recorded yet</p>
          )}
        </div>

        {/* Lowest Spending Category */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Lowest Spending Category
          </span>
          {lowestSpendingCategory ? (
            <div className="mt-2">
              <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                {lowestSpendingCategory.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatCurrency(lowestSpendingCategory.amount, userProfile.currency.symbol)} (
                {lowestSpendingCategory.percentage}% of expenses)
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-2">No secondary expenses</p>
          )}
        </div>

        {/* Month-over-Month Change */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Month vs Previous Month
          </span>
          {monthOverMonthChange ? (
            <div className="mt-2">
              <div className="flex items-center gap-1.5">
                {monthOverMonthChange.isIncrease ? (
                  <TrendingUp className="w-4 h-4 text-rose-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-emerald-500" />
                )}
                <span
                  className={`text-lg font-bold ${
                    monthOverMonthChange.isIncrease ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {monthOverMonthChange.isIncrease ? '+' : '-'}
                  {monthOverMonthChange.percentageDiff}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {monthOverMonthChange.isIncrease ? 'Spent more' : 'Spent less'} by{' '}
                {formatCurrency(Math.abs(monthOverMonthChange.amountDiff), userProfile.currency.symbol)}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-2">Log transactions in past month to compare</p>
          )}
        </div>

        {/* Savings Goal Trajectory */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Overall Savings Progress
          </span>
          <div className="mt-2">
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {savingsSummary.percentage}%
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatCurrency(savingsSummary.totalSaved, userProfile.currency.symbol)} of{' '}
              {formatCurrency(savingsSummary.totalTarget, userProfile.currency.symbol)} target
            </p>
          </div>
        </div>
      </div>

      {/* Actionable Student Recommendations */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Practical Student Recommendations
          </h3>
        </div>

        {insights.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              Not enough spending data yet to generate custom recommendations.
            </p>
            <p className="mt-1">
              Log a few transactions in food, travel, or books to unlock personalized financial advice.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${getInsightStyle(item.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(item.type)}
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.message}
                    </p>
                    {item.recommendation && (
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-1">
                        Tip: {item.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Identified Recurring Expenses Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-indigo-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Detected Recurring & Fixed Expenses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Regular monthly commitments like hostel rent, mobile recharges, and streaming subscriptions
              </p>
            </div>
          </div>
        </div>

        {recurringExpenses.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">
            No recurring expense patterns detected yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recurringExpenses.map((rec, i) => (
              <div key={i} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{rec.title}</p>
                  <p className="text-xs text-slate-400">
                    Category: {rec.categoryName} • Recorded {rec.occurrences} time(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    ~{formatCurrency(rec.averageAmount, userProfile.currency.symbol)} / month
                  </p>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                    Fixed student cost
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
