import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  getTotalIncome,
  getTotalExpenses,
  getCategoryBreakdown,
  formatCurrency,
  formatDate,
} from '../utils/calculations';
import { exportTransactionsToCsv } from '../utils/csvExport';
import { CategoryIcon } from '../components/common/CategoryIcon';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  CreditCard,
  PieChart as PieChartIcon,
  TrendingUp,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { transactions, categories, savingsGoals, userProfile, currentMonth, getCurrentBudget } =
    useApp();

  const [dateRange, setDateRange] = useState<'this_month' | 'last_3_months' | 'all_time' | 'custom'>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Filter transactions according to selected date range
  const filteredTransactions = useMemo(() => {
    const now = new Date();

    return transactions.filter(t => {
      const txDate = new Date(t.date);

      if (dateRange === 'this_month') {
        return t.date.startsWith(currentMonth);
      }
      if (dateRange === 'last_3_months') {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        return txDate >= threeMonthsAgo;
      }
      if (dateRange === 'custom') {
        if (customStart && t.date < customStart) return false;
        if (customEnd && t.date > customEnd) return false;
        return true;
      }
      return true; // all_time
    });
  }, [transactions, dateRange, currentMonth, customStart, customEnd]);

  const totalIncome = getTotalIncome(filteredTransactions);
  const totalExpenses = getTotalExpenses(filteredTransactions);
  const netSaved = totalIncome - totalExpenses;

  // Category breakdown for filtered transactions
  const currentBudget = getCurrentBudget(currentMonth);
  const categoryBreakdown = getCategoryBreakdown(
    filteredTransactions,
    categories,
    currentBudget.categoryBudgets
  );
  const activeSpendBreakdown = categoryBreakdown.filter(c => c.spent > 0);

  // Payment method breakdown
  const paymentMethodCounts = useMemo(() => {
    const counts = new Map<string, number>();
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        counts.set(t.paymentMethod, (counts.get(t.paymentMethod) || 0) + t.amount);
      });

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];
    const result: { name: string; value: number; color: string }[] = [];
    let idx = 0;
    counts.forEach((value, name) => {
      result.push({ name, value, color: colors[idx % colors.length] });
      idx++;
    });
    return result;
  }, [filteredTransactions]);

  const handleExportCsv = () => {
    exportTransactionsToCsv(
      filteredTransactions,
      categories,
      userProfile.currency.code,
      `student-financial-report-${dateRange}`
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Range Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Financial Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate summarized expense breakdowns and export spreadsheets
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Range filter selector */}
          <div className="inline-flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-semibold shadow-sm">
            <button
              onClick={() => setDateRange('this_month')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRange === 'this_month'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateRange('last_3_months')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRange === 'last_3_months'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Last 3 Months
            </button>
            <button
              onClick={() => setDateRange('all_time')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRange === 'all_time'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateRange('custom')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRange === 'custom'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            disabled={filteredTransactions.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Custom Range Picker */}
      {dateRange === 'custom' && (
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
          <span className="text-slate-500 font-medium">Custom Range:</span>
          <input
            type="date"
            value={customStart}
            onChange={e => setCustomStart(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={e => setCustomEnd(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      )}

      {/* 3 Overview Metric Cards for Selected Report Period */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Period Total Income
          </span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalIncome, userProfile.currency.symbol)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {filteredTransactions.filter(t => t.type === 'income').length} income records
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Period Total Expenses
          </span>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalExpenses, userProfile.currency.symbol)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {filteredTransactions.filter(t => t.type === 'expense').length} expense records
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Period Net Savings
          </span>
          <p
            className={`text-2xl font-bold mt-1 ${
              netSaved >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(netSaved, userProfile.currency.symbol)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {netSaved >= 0 ? 'Surplus retained' : 'Deficit / overspend'}
          </p>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Spending Table / Bars */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Category Expense Report
            </h3>
            <span className="text-xs text-slate-400">{activeSpendBreakdown.length} active</span>
          </div>

          {activeSpendBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              No expenses recorded for this timeframe.
            </p>
          ) : (
            <div className="space-y-3">
              {activeSpendBreakdown.map(cat => (
                <div key={cat.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {cat.categoryName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(cat.spent, userProfile.currency.symbol)}
                      </span>
                      <span className="text-slate-400 ml-1.5">
                        ({cat.percentageOfTotalExpense}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: cat.color,
                        width: `${cat.percentageOfTotalExpense}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Payment Methods Used
                </h3>
                <p className="text-xs text-slate-500">UPI, Cash, and Card breakdown</p>
              </div>
              <CreditCard className="w-4 h-4 text-slate-400" />
            </div>

            {paymentMethodCounts.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">
                No payment data available in selected period.
              </p>
            ) : (
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodCounts}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {paymentMethodCounts.map((entry, index) => (
                        <Cell key={`cell-pm-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [
                        formatCurrency(Number(val || 0), userProfile.currency.symbol),
                        '',
                      ]}
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {paymentMethodCounts.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 text-xs">
              {paymentMethodCounts.map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Records Included in Report */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Exportable Transactions ({filteredTransactions.length})
            </h3>
            <p className="text-xs text-slate-500">
              Matches your active date range filters
            </p>
          </div>
          <button
            onClick={handleExportCsv}
            disabled={filteredTransactions.length === 0}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {filteredTransactions.slice(0, 15).map(tx => {
            const cat = categories.find(c => c.id === tx.categoryId);
            return (
              <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-slate-400 whitespace-nowrap">{formatDate(tx.date)}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {tx.title}
                  </span>
                  <span className="text-slate-400 hidden sm:inline">• {cat?.name}</span>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span
                    className={`font-bold ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount, userProfile.currency.symbol)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
