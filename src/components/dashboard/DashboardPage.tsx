import React from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatDate, formatMonthYear } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
  Circle,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

interface DashboardPageProps {
  onOpenAddTransaction: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenAddTransaction }) => {
  const {
    availableBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlySaved,
    budgetUsagePercent,
    totalMonthlyBudget,
    transactions,
    categories,
    savingsGoals,
    upcomingBills,
    toggleBillPaid,
    selectedMonth,
    settings,
    setActiveTab,
    categoryBudgetsStatus,
  } = useBudget();

  // Selected month transactions
  const monthTransactions = transactions.filter(
    (tx) => tx.date && tx.date.startsWith(selectedMonth)
  );

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Category breakdown for Donut Chart
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  
  const pieData = categoryBudgetsStatus
    .filter((c) => c.spent > 0)
    .map((c) => ({
      name: c.categoryName,
      value: c.spent,
      color: c.color,
    }))
    .sort((a, b) => b.value - a.value);

  // Income vs Expense comparison data across 4 months for BarChart
  const getComparisonData = () => {
    const monthSet = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        monthSet.add(tx.date.substring(0, 7));
      }
    });
    const months = Array.from(monthSet).sort().slice(-4);
    
    return months.map((m) => {
      const txs = transactions.filter((tx) => tx.date && tx.date.startsWith(m));
      const inc = txs.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const exp = txs.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      const [year, month] = m.split('-').map(Number);
      const label = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' });
      return {
        month: label,
        Income: inc,
        Expenses: exp,
      };
    });
  };

  const comparisonData = getComparisonData();

  // Budget warnings
  const isBudgetExceeded = budgetUsagePercent >= settings.dangerThreshold;
  const isBudgetWarning = budgetUsagePercent >= settings.warningThreshold && !isBudgetExceeded;
  const overspentCategories = categoryBudgetsStatus.filter((c) => c.status === 'danger');
  const warningCategories = categoryBudgetsStatus.filter((c) => c.status === 'warning');

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-100">{payload[0].name}</p>
          <p className="font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
            {formatCurrency(payload[0].value, settings.currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
                🎓 {settings.studentName}
              </span>
              <span className="text-xs text-indigo-100">
                Viewing {formatMonthYear(selectedMonth)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Student Financial Command Center
            </h1>
            <p className="text-sm text-indigo-100/90 mt-1 max-w-xl">
              Track daily meals, travel, college fees, and save up for your key academic goals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddTransaction}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense / Income</span>
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>View Insights</span>
            </button>
          </div>
        </div>

        {/* Decorative blur spheres */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-violet-500/20 blur-2xl pointer-events-none" />
      </div>

      {/* Warnings & Alerts */}
      {isBudgetExceeded && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 animate-in fade-in duration-300">
          <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-bold">Total Monthly Budget Exceeded!</p>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
              You have spent {formatCurrency(monthlyExpenses, settings.currency)} out of your {formatCurrency(totalMonthlyBudget, settings.currency)} limit ({Math.round(budgetUsagePercent)}%). Consider pausing non-essential spending.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('budgets')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
          >
            Manage Budget
          </button>
        </div>
      )}

      {!isBudgetExceeded && (isBudgetWarning || overspentCategories.length > 0) && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 animate-in fade-in duration-300">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-bold">Budget Caution Alert</p>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
              {isBudgetWarning && `You have utilized ${Math.round(budgetUsagePercent)}% of your monthly budget. `}
              {overspentCategories.length > 0 && `Category limits exceeded: ${overspentCategories.map((c) => c.categoryName).join(', ')}.`}
              {warningCategories.length > 0 && ` Approaching limit: ${warningCategories.map((c) => c.categoryName).join(', ')}.`}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('budgets')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700"
          >
            Review Limits
          </button>
        </div>
      )}

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Available Balance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Available Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-xl font-extrabold mt-2 tracking-tight ${
              availableBalance >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(availableBalance, settings.currency)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Total recorded net worth</p>
        </div>

        {/* Monthly Income */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Monthly Income
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 tracking-tight">
            +{formatCurrency(monthlyIncome, settings.currency)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Allowance & tutoring</p>
        </div>

        {/* Monthly Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Monthly Expenses
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-2 tracking-tight">
            -{formatCurrency(monthlyExpenses, settings.currency)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{monthTransactions.filter(t => t.type === 'expense').length} transactions</p>
        </div>

        {/* Amount Saved This Month */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Saved This Month
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-violet-600 dark:text-violet-400 mt-2 tracking-tight">
            {formatCurrency(monthlySaved, settings.currency)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {monthlyIncome > 0 ? `${Math.round((monthlySaved / monthlyIncome) * 100)}% savings rate` : 'Income pending'}
          </p>
        </div>

        {/* Budget Usage % */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Budget Usage
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isBudgetExceeded
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                  : isBudgetWarning
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
              }`}
            >
              {Math.round(budgetUsagePercent)}%
            </span>
          </div>
          <div className="mt-3">
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isBudgetExceeded
                    ? 'bg-rose-500'
                    : isBudgetWarning
                    ? 'bg-amber-500'
                    : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex justify-between">
              <span>Limit: {formatCurrency(totalMonthlyBudget, settings.currency)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category-wise Spending Donut Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Category Spending
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Where your money went in {formatMonthYear(selectedMonth)}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('categories')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              All Categories <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pieData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {pieData.slice(0, 5).map((item) => {
                  const percent = monthlyExpenses > 0 ? Math.round((item.value / monthlyExpenses) * 100) : 0;
                  return (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-slate-700 dark:text-slate-300 truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(item.value, settings.currency)}
                        </span>
                        <span className="text-slate-400 ml-1.5">({percent}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm">No expenses recorded for {formatMonthYear(selectedMonth)}.</p>
              <button
                onClick={onOpenAddTransaction}
                className="mt-3 px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg"
              >
                + Record Expense
              </button>
            </div>
          )}
        </div>

        {/* Monthly Income vs Expenses Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Income vs Expenses Trend
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly comparison across semesters
              </p>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              Full Reports <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value), settings.currency)]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Transactions + Upcoming Bills + Savings Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 columns on wide) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Recent Transactions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Latest recorded spending and income</p>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              View All ({transactions.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions.map((tx) => {
                const cat = categoryMap.get(tx.category);
                const isExpense = tx.type === 'expense';

                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: `${cat?.color || '#6366f1'}15`,
                          color: cat?.color || '#6366f1',
                        }}
                      >
                        <CategoryIcon name={cat?.icon || 'Tag'} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {tx.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{cat?.name || tx.category}</span>
                          <span>•</span>
                          <span>{formatDate(tx.date)}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">{tx.paymentMethod}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p
                        className={`text-sm font-bold ${
                          isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatCurrency(tx.amount, settings.currency)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">
              No transactions recorded yet.
            </div>
          )}
        </div>

        {/* Right Side: Upcoming Bills & Savings Goals Preview */}
        <div className="space-y-6">
          {/* Upcoming Bills & Planned Expenses */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Upcoming Bills
                </h2>
                <p className="text-[11px] text-slate-400">Planned student commitments</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {upcomingBills.slice(0, 4).map((bill) => (
                <div
                  key={bill.id}
                  onClick={() => toggleBillPaid(bill.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    bill.isPaid
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-60'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button className="text-slate-400 hover:text-indigo-600">
                      {bill.isPaid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-semibold truncate ${
                          bill.isPaid ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {bill.title}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> Due {formatDate(bill.dueDate)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(bill.amount, settings.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Savings Goals Preview */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Savings Goals
                </h2>
                <p className="text-[11px] text-slate-400">Target funds in progress</p>
              </div>
              <button
                onClick={() => setActiveTab('goals')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                View Goals
              </button>
            </div>

            <div className="space-y-3">
              {savingsGoals.slice(0, 2).map((goal) => {
                const percent = Math.min(Math.round((goal.currentSaved / goal.targetAmount) * 100), 100);
                return (
                  <div key={goal.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {goal.name}
                      </span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 ml-2">
                        {percent}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Saved: {formatCurrency(goal.currentSaved, settings.currency)}</span>
                      <span>Target: {formatCurrency(goal.targetAmount, settings.currency)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
