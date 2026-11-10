import React from 'react';
import { useApp } from '../context/AppContext';
import {
  filterTransactionsByMonth,
  getTotalIncome,
  getTotalExpenses,
  getAvailableBalance,
  getTotalMoneySaved,
  getCategoryBreakdown,
  formatCurrency,
  formatDate,
} from '../utils/calculations';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart as PieChartIcon,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Receipt,
  CheckCircle2,
  Calendar,
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
  Legend,
} from 'recharts';
import { CategoryIcon } from '../components/common/CategoryIcon';

export const DashboardPage: React.FC = () => {
  const {
    currentMonth,
    transactions,
    categories,
    savingsGoals,
    userProfile,
    getCurrentBudget,
    setActivePage,
    setIsQuickAddOpen,
    setEditingTransaction,
    deleteTransaction,
  } = useApp();

  const currentBudget = getCurrentBudget(currentMonth);
  const currentMonthTx = filterTransactionsByMonth(transactions, currentMonth);

  // Financial figures
  const totalIncome = getTotalIncome(currentMonthTx);
  const totalExpenses = getTotalExpenses(currentMonthTx);
  const totalSaved = getTotalMoneySaved(savingsGoals);
  const availableBalance = getAvailableBalance(transactions, savingsGoals);

  const totalMonthlyBudget = currentBudget.totalBudget || userProfile.defaultMonthlyBudget || 10000;
  const budgetUsagePct = totalMonthlyBudget > 0 ? Math.round((totalExpenses / totalMonthlyBudget) * 100) : 0;
  const budgetRemaining = Math.max(0, totalMonthlyBudget - totalExpenses);

  // Category breakdown for charts and progress
  const categoryBreakdown = getCategoryBreakdown(currentMonthTx, categories, currentBudget.categoryBudgets);
  const spentBreakdown = categoryBreakdown.filter(c => c.spent > 0);

  // Budget warnings (over 80% or 100%)
  const budgetAlerts = categoryBreakdown.filter(
    c => c.limit > 0 && c.percentageUsed >= (userProfile.warningThreshold || 80)
  );

  // Recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Monthly Income vs Expense comparison (Current Month vs previous 2 months)
  const [currYearStr, currMonthStr] = currentMonth.split('-');
  const currYear = parseInt(currYearStr, 10);
  const currMonth = parseInt(currMonthStr, 10);

  const monthlyComparisonData = [];
  for (let i = 2; i >= 0; i--) {
    const d = new Date(currYear, currMonth - 1 - i, 1);
    const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const mLabel = d.toLocaleDateString('en-US', { month: 'short' });
    const mTx = filterTransactionsByMonth(transactions, mStr);
    monthlyComparisonData.push({
      month: mLabel,
      Income: getTotalIncome(mTx),
      Expense: getTotalExpenses(mTx),
    });
  }

  // Category color mapper for pie chart
  const pieData = spentBreakdown.map(item => ({
    name: item.categoryName,
    value: item.spent,
    color: item.color,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Active Budget Alerts Notification Banner */}
      {budgetAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {budgetAlerts.length} Budget Alert{budgetAlerts.length > 1 ? 's' : ''} for{' '}
                {new Date(currYear, currMonth - 1).toLocaleDateString('en-US', { month: 'long' })}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {budgetAlerts.map(a => `${a.categoryName} (${a.percentageUsed}%)`).join(', ')} have
                reached warning levels.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivePage('budgets')}
            className="shrink-0 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 rounded-xl transition-colors flex items-center gap-1"
          >
            <span>Fix Budgets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 5 Primary Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Available Balance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-indigo-400 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Available Balance
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-2xl font-bold tracking-tight ${
              availableBalance >= 0
                ? 'text-slate-900 dark:text-white'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(availableBalance, userProfile.currency.symbol)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Free to spend (excl. savings)
          </p>
        </div>

        {/* Total Income */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly Income
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalIncome, userProfile.currency.symbol)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Allowances, grants & gigs
          </p>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-400 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly Expenses
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
            {formatCurrency(totalExpenses, userProfile.currency.symbol)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Food, travel & essentials
          </p>
        </div>

        {/* Money Saved */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-violet-400 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Money Saved
            </span>
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-violet-600 dark:text-violet-400">
            {formatCurrency(totalSaved, userProfile.currency.symbol)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            In active savings goals
          </p>
        </div>

        {/* Monthly Budget Usage */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Budget Usage
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <PieChartIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p
              className={`text-2xl font-bold tracking-tight ${
                budgetUsagePct > 100
                  ? 'text-rose-600 dark:text-rose-400'
                  : budgetUsagePct >= 80
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {budgetUsagePct}%
            </p>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {formatCurrency(budgetRemaining, userProfile.currency.symbol)} left
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUsagePct > 100
                  ? 'bg-rose-500'
                  : budgetUsagePct >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budgetUsagePct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart (2 cols on lg) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Income vs Expense Trends
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparing money inflows and outflows
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">Expense</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={val => `${userProfile.currency.symbol}${val >= 1000 ? `${val / 1000}k` : val}`}
                />
                <Tooltip
                  formatter={(value: any) => [
                    formatCurrency(Number(value || 0), userProfile.currency.symbol),
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
                <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Pie / Donut Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Spending by Category
              </h3>
              <span className="text-xs text-slate-500 font-medium">This Month</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Where your student money goes
            </p>

            {pieData.length === 0 ? (
              <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs">
                No expenses recorded for this month yet.
              </div>
            ) : (
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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

          {pieData.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 text-xs">
              {pieData.slice(0, 4).map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-400 truncate max-w-[100px]">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Two Column Grid: Budget Progress & Savings Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Budget Progress */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Category Budget Trackers
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Keep tabs on your key student spending limits
              </p>
            </div>
            <button
              onClick={() => setActivePage('budgets')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Manage Limits</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {categoryBreakdown.slice(0, 5).map(cat => (
              <div key={cat.categoryId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-1.5 rounded-lg text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={13} className="text-white" />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {cat.categoryName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(cat.spent, userProfile.currency.symbol)}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 ml-1">
                      / {formatCurrency(cat.limit, userProfile.currency.symbol)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      cat.percentageUsed > 100
                        ? 'bg-rose-500'
                        : cat.percentageUsed >= 80
                        ? 'bg-amber-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, cat.percentageUsed)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Savings Goals Snapshot */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Savings Goals
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Milestones you are saving toward
              </p>
            </div>
            <button
              onClick={() => setActivePage('goals')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {savingsGoals.slice(0, 3).map(goal => {
              const pct = Math.round((goal.currentSavedAmount / goal.targetAmount) * 100);
              const remaining = Math.max(0, goal.targetAmount - goal.currentSavedAmount);
              return (
                <div
                  key={goal.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="p-1.5 rounded-lg text-white"
                        style={{ backgroundColor: goal.color || '#6366f1' }}
                      >
                        <CategoryIcon name={goal.icon || 'PiggyBank'} size={14} className="text-white" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[160px] sm:max-w-xs">
                        {goal.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {pct}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      Saved {formatCurrency(goal.currentSavedAmount, userProfile.currency.symbol)} of{' '}
                      {formatCurrency(goal.targetAmount, userProfile.currency.symbol)}
                    </span>
                    <span>{remaining === 0 ? 'Goal Achieved! 🎉' : `${formatCurrency(remaining, userProfile.currency.symbol)} left`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions List with Quick Actions */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest financial activity recorded
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </button>
            <button
              onClick={() => setActivePage('transactions')}
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1.5"
            >
              View All
            </button>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            No transactions found. Click "Add Transaction" to log your first record!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map(tx => {
              const cat = categories.find(c => c.id === tx.categoryId);
              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="p-2.5 rounded-xl shrink-0 text-white shadow-sm"
                      style={{ backgroundColor: cat?.color || '#64748b' }}
                    >
                      <CategoryIcon name={cat?.icon || 'CircleDot'} size={16} />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {tx.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{cat?.name || 'General'}</span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span className="hidden sm:inline">{tx.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-bold ${
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount, userProfile.currency.symbol)}
                    </p>
                    <div className="flex items-center justify-end gap-2 text-xs text-slate-400 mt-0.5">
                      <button
                        onClick={() => setEditingTransaction(tx)}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        Edit
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="hover:text-rose-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
