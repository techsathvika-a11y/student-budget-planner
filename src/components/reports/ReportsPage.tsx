import React, { useMemo } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatMonthYear } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  Download,
  Printer,
  PiggyBank,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const {
    transactions,
    savingsGoals,
    selectedMonth,
    monthlyIncome,
    monthlyExpenses,
    monthlySaved,
    settings,
    exportCSV,
    categoryBudgetsStatus,
  } = useBudget();

  // Multi-month summary trends
  const monthlyTrendData = useMemo(() => {
    const monthMap = new Map<string, { income: number; expenses: number }>();

    transactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        const m = tx.date.substring(0, 7);
        if (!monthMap.has(m)) {
          monthMap.set(m, { income: 0, expenses: 0 });
        }
        const data = monthMap.get(m)!;
        if (tx.type === 'income') {
          data.income += tx.amount;
        } else {
          data.expenses += tx.amount;
        }
      }
    });

    return Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([m, val]) => {
        const [year, month] = m.split('-').map(Number);
        const name = new Date(year, month - 1).toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        });
        return {
          month: name,
          rawMonth: m,
          Income: val.income,
          Expenses: val.expenses,
          Savings: Math.max(val.income - val.expenses, 0),
        };
      });
  }, [transactions]);

  // All-time totals
  const allTimeTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((tx) => {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    });
    return {
      income,
      expense,
      net: income - expense,
      txCount: transactions.length,
    };
  }, [transactions]);

  // Category breakdown table for selected month
  const categoryBreakdown = useMemo(() => {
    return categoryBudgetsStatus
      .map((c) => {
        const percent = monthlyExpenses > 0 ? (c.spent / monthlyExpenses) * 100 : 0;
        return {
          ...c,
          percentOfTotal: percent,
        };
      })
      .sort((a, b) => b.spent - a.spent);
  }, [categoryBudgetsStatus, monthlyExpenses]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Financial Reports & Export
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Generate printable audit statements and export CSV transaction records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Transactions (CSV)</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block">
            Selected Month Income
          </span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            +{formatCurrency(monthlyIncome, settings.currency)}
          </p>
          <span className="text-[11px] text-slate-400">{formatMonthYear(selectedMonth)}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block">
            Selected Month Expenses
          </span>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            -{formatCurrency(monthlyExpenses, settings.currency)}
          </p>
          <span className="text-[11px] text-slate-400">{formatMonthYear(selectedMonth)}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block">
            All-Time Net Savings
          </span>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {formatCurrency(allTimeTotals.net, settings.currency)}
          </p>
          <span className="text-[11px] text-slate-400">Total recorded cumulative balance</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block">
            Total Record Entries
          </span>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {allTimeTotals.txCount} Transactions
          </p>
          <span className="text-[11px] text-slate-400">Logged in persistent storage</span>
        </div>
      </div>

      {/* Multi-Month Trends Chart */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Longitudinal Spending & Savings Trend
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monthly overview of earnings, expenditure, and savings reserves
            </p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${val / 1000}k`} />
              <Tooltip formatter={(value: any) => [formatCurrency(Number(value), settings.currency)]} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" />
              <Area type="monotone" dataKey="Expenses" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Spending Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Category Expense Ledger ({formatMonthYear(selectedMonth)})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detailed expense allocation by category with percentage distribution
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Spent Amount</th>
                <th className="py-2.5 px-3">Budget Limit</th>
                <th className="py-2.5 px-3">% of Total Expenses</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categoryBreakdown.map((c) => (
                <tr key={c.categoryId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${c.color}15`, color: c.color }}
                    >
                      <CategoryIcon name={c.icon} className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {c.categoryName}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(c.spent, settings.currency)}
                  </td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                    {c.limit > 0 ? formatCurrency(c.limit, settings.currency) : '—'}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: c.color,
                            width: `${Math.min(c.percentOfTotal, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {Math.round(c.percentOfTotal)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'danger'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : c.status === 'warning'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {c.status === 'danger' ? 'Exceeded' : c.status === 'warning' ? 'Near Limit' : 'Safe'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Savings Goals Audit Summary */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <PiggyBank className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Savings Portfolio & Monthly Surplus Summary
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block">
              Saved in {formatMonthYear(selectedMonth)}
            </span>
            <p className="text-lg font-black text-indigo-900 dark:text-indigo-200 mt-1">
              {formatCurrency(monthlySaved, settings.currency)}
            </p>
          </div>
          {savingsGoals.slice(0, 3).map((g) => (
            <div key={g.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                {g.name}
              </span>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">
                {formatCurrency(g.currentSaved, settings.currency)} / {formatCurrency(g.targetAmount, settings.currency)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
