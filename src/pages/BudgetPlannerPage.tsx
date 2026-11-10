import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  filterTransactionsByMonth,
  getCategoryBreakdown,
  getTotalExpenses,
  formatCurrency,
} from '../utils/calculations';
import { CategoryIcon } from '../components/common/CategoryIcon';
import {
  PieChart,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Info,
  DollarSign,
  Save,
  X,
} from 'lucide-react';

export const BudgetPlannerPage: React.FC = () => {
  const {
    currentMonth,
    transactions,
    categories,
    userProfile,
    getCurrentBudget,
    updateCategoryBudget,
    updateTotalBudget,
  } = useApp();

  const currentBudget = getCurrentBudget(currentMonth);
  const currentMonthTx = filterTransactionsByMonth(transactions, currentMonth);
  const totalExpenses = getTotalExpenses(currentMonthTx);

  const breakdowns = getCategoryBreakdown(currentMonthTx, categories, currentBudget.categoryBudgets);

  // Overall monthly budget limit
  const totalBudgetLimit = currentBudget.totalBudget || userProfile.defaultMonthlyBudget || 10000;
  const overallUsedPct = totalBudgetLimit > 0 ? Math.round((totalExpenses / totalBudgetLimit) * 100) : 0;
  const overallRemaining = Math.max(0, totalBudgetLimit - totalExpenses);

  // Editing Overall Budget State
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [tempTotalLimit, setTempTotalLimit] = useState(String(totalBudgetLimit));

  // Editing Individual Category Budget State
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [tempCatLimit, setTempCatLimit] = useState<string>('');

  const handleSaveTotal = () => {
    const val = parseFloat(tempTotalLimit);
    if (!isNaN(val) && val >= 0) {
      updateTotalBudget(currentMonth, Math.round(val));
    }
    setIsEditingTotal(false);
  };

  const handleStartEditCat = (catId: string, currentLimit: number) => {
    setEditingCatId(catId);
    setTempCatLimit(String(currentLimit));
  };

  const handleSaveCat = (catId: string) => {
    const val = parseFloat(tempCatLimit);
    if (!isNaN(val) && val >= 0) {
      updateCategoryBudget(currentMonth, catId, Math.round(val));
    }
    setEditingCatId(null);
  };

  // Status badge helper
  const getBudgetStatus = (pct: number) => {
    if (pct >= (userProfile.dangerThreshold || 100)) {
      return {
        label: 'Overspent Alert',
        color: 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900',
        icon: AlertCircle,
        barColor: 'bg-rose-500',
      };
    }
    if (pct >= (userProfile.warningThreshold || 80)) {
      return {
        label: '80% Warning',
        color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900',
        icon: AlertTriangle,
        barColor: 'bg-amber-500',
      };
    }
    if (pct >= (userProfile.infoThreshold || 50)) {
      return {
        label: '50% Progress Update',
        color: 'text-blue-700 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900',
        icon: Info,
        barColor: 'bg-blue-500',
      };
    }
    return {
      label: 'On Track',
      color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900',
      icon: CheckCircle2,
      barColor: 'bg-emerald-500',
    };
  };

  const overallStatus = getBudgetStatus(overallUsedPct);

  return (
    <div className="space-y-6 pb-12">
      {/* Overall Monthly Budget Hero Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Monthly Student Budget
            </span>
            <div className="flex items-center gap-3 mt-1">
              {isEditingTotal ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      {userProfile.currency.symbol}
                    </span>
                    <input
                      type="number"
                      step="100"
                      value={tempTotalLimit}
                      onChange={e => setTempTotalLimit(e.target.value)}
                      className="pl-7 pr-3 py-1.5 text-lg font-bold rounded-xl border border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-36"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleSaveTotal}
                    className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                    title="Save"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsEditingTotal(false)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(totalBudgetLimit, userProfile.currency.symbol)}
                  </h2>
                  <button
                    onClick={() => {
                      setTempTotalLimit(String(totalBudgetLimit));
                      setIsEditingTotal(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Monthly Budget Limit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Overall Status Badge */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold ${overallStatus.color}`}
          >
            <overallStatus.icon className="w-4 h-4" />
            <span>{overallStatus.label}</span>
          </div>
        </div>

        {/* Overall Big Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 font-semibold">
            <span>Spent: {formatCurrency(totalExpenses, userProfile.currency.symbol)}</span>
            <span>
              {overallRemaining === 0 ? 'Budget Exhausted' : `Remaining: ${formatCurrency(overallRemaining, userProfile.currency.symbol)}`} ({overallUsedPct}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${overallStatus.barColor}`}
              style={{ width: `${Math.min(100, overallUsedPct)}%` }}
            />
          </div>
        </div>

        {/* Alert Threshold Guide for Students */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
            <span>50%: Progress check-in</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span>80%: Spending caution</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span>100%+: Overspending alert</span>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Category Budget Allocation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click the edit icon on any card to update its monthly limit
          </p>
        </div>
      </div>

      {/* Category Budgets Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {breakdowns.map(cat => {
          const status = getBudgetStatus(cat.percentageUsed);
          const isEditing = editingCatId === cat.categoryId;

          return (
            <div
              key={cat.categoryId}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-sm ${
                cat.percentageUsed >= 100
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                  : cat.percentageUsed >= 80
                  ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Category Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-2.5 rounded-xl text-white shadow-xs shrink-0"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {cat.categoryName}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${status.color}`}
                    >
                      <status.icon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Edit Button */}
                {!isEditing && (
                  <button
                    onClick={() => handleStartEditCat(cat.categoryId, cat.limit)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Change category limit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Limit Editor or Display */}
              {isEditing ? (
                <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">
                    {userProfile.currency.symbol}
                  </span>
                  <input
                    type="number"
                    step="50"
                    value={tempCatLimit}
                    onChange={e => setTempCatLimit(e.target.value)}
                    className="w-full text-xs font-bold p-1 rounded-lg border border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveCat(cat.categoryId)}
                    className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingCatId(null)}
                    className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-semibold">Spent</span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {formatCurrency(cat.spent, userProfile.currency.symbol)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 uppercase text-[10px] font-semibold">Limit</span>
                    <p className="font-bold text-slate-600 dark:text-slate-300 text-sm">
                      {formatCurrency(cat.limit, userProfile.currency.symbol)}
                    </p>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${status.barColor}`}
                    style={{ width: `${Math.min(100, cat.percentageUsed)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                  <span>{cat.percentageUsed}% used</span>
                  <span
                    className={
                      cat.spent > cat.limit
                        ? 'font-bold text-rose-500'
                        : 'font-semibold text-emerald-600 dark:text-emerald-400'
                    }
                  >
                    {cat.spent > cat.limit
                      ? `Exceeded by ${formatCurrency(cat.spent - cat.limit, userProfile.currency.symbol)}`
                      : `${formatCurrency(cat.remaining, userProfile.currency.symbol)} remaining`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
