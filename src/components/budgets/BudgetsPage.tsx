import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatMonthYear } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Edit3,
  Check,
  X,
  Sliders,
  GraduationCap,
} from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const {
    categoryBudgetsStatus,
    setCategoryBudget,
    totalMonthlyBudget,
    setTotalMonthlyBudget,
    monthlyExpenses,
    budgetUsagePercent,
    settings,
    updateSettings,
    selectedMonth,
  } = useBudget();

  // Inline editing state for categories
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editLimitVal, setEditLimitVal] = useState<string>('');

  // Editing total budget
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [totalInput, setTotalInput] = useState<string>(totalMonthlyBudget.toString());

  // Configurable thresholds in settings
  const [warningVal, setWarningVal] = useState(settings.warningThreshold);
  const [dangerVal, setDangerVal] = useState(settings.dangerThreshold);

  const startEditCategory = (catId: string, currentLimit: number) => {
    setEditingCatId(catId);
    setEditLimitVal(currentLimit.toString());
  };

  const saveCategoryLimit = (catId: string) => {
    const num = parseFloat(editLimitVal);
    if (!isNaN(num) && num >= 0) {
      setCategoryBudget(catId, num);
    }
    setEditingCatId(null);
  };

  const saveTotalBudget = () => {
    const num = parseFloat(totalInput);
    if (!isNaN(num) && num > 0) {
      setTotalMonthlyBudget(num);
    }
    setIsEditingTotal(false);
  };

  const handleUpdateThresholds = () => {
    updateSettings({
      warningThreshold: Number(warningVal),
      dangerThreshold: Number(dangerVal),
    });
  };

  const remainingTotalBudget = totalMonthlyBudget - monthlyExpenses;
  const isTotalExceeded = budgetUsagePercent >= settings.dangerThreshold;
  const isTotalWarning = budgetUsagePercent >= settings.warningThreshold && !isTotalExceeded;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Budget Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Set total monthly allowances, individual category ceilings, and alert thresholds
          </p>
        </div>
      </div>

      {/* Total Monthly Budget Overview Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Monthly Ceiling ({formatMonthYear(selectedMonth)})
            </span>
            <div className="flex items-center gap-3">
              {isEditingTotal ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold">
                      {settings.currency.symbol}
                    </span>
                    <input
                      type="number"
                      step="500"
                      value={totalInput}
                      onChange={(e) => setTotalInput(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xl font-extrabold rounded-xl border border-indigo-400 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-44 outline-none"
                    />
                  </div>
                  <button
                    onClick={saveTotalBudget}
                    className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsEditingTotal(false)}
                    className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    {formatCurrency(totalMonthlyBudget, settings.currency)}
                  </span>
                  <button
                    onClick={() => {
                      setTotalInput(totalMonthlyBudget.toString());
                      setIsEditingTotal(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit total budget"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Total expenditure cap allocated for all student categories
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Spent So Far</span>
              <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(monthlyExpenses, settings.currency)}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Remaining</span>
              <span
                className={`text-lg font-bold ${
                  remainingTotalBudget >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {remainingTotalBudget >= 0 ? '+' : '-'}
                {formatCurrency(Math.abs(remainingTotalBudget), settings.currency)}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Usage</span>
              <span
                className={`text-lg font-bold ${
                  isTotalExceeded
                    ? 'text-rose-600 dark:text-rose-400'
                    : isTotalWarning
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {Math.round(budgetUsagePercent)}%
              </span>
            </div>
          </div>
        </div>

        {/* Big Overall Progress Bar */}
        <div className="mt-6">
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isTotalExceeded ? 'bg-rose-500' : isTotalWarning ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
            <span>0%</span>
            <span>Warning threshold: {settings.warningThreshold}%</span>
            <span>Danger ceiling: {settings.dangerThreshold}%</span>
          </div>
        </div>
      </div>

      {/* Configurable Thresholds Bar */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-500" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Configurable Alert Thresholds:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Caution Warning:</span>
            <input
              type="number"
              min="50"
              max="95"
              value={warningVal}
              onChange={(e) => setWarningVal(Number(e.target.value))}
              className="w-16 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-center"
            />
            <span>%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-rose-600 dark:text-rose-400 font-semibold">Exceeded Danger:</span>
            <input
              type="number"
              min="90"
              max="150"
              value={dangerVal}
              onChange={(e) => setDangerVal(Number(e.target.value))}
              className="w-16 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-center"
            />
            <span>%</span>
          </div>

          <button
            onClick={handleUpdateThresholds}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all"
          >
            Apply Alerts
          </button>
        </div>
      </div>

      {/* Category-Wise Budgets List */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Category Limits Breakdown ({formatMonthYear(selectedMonth)})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryBudgetsStatus.map((cat) => {
            const isEditing = editingCatId === cat.categoryId;
            const isDanger = cat.status === 'danger';
            const isWarning = cat.status === 'warning';

            return (
              <div
                key={cat.categoryId}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                  isDanger
                    ? 'border-rose-400 dark:border-rose-800 shadow-sm shadow-rose-500/10'
                    : isWarning
                    ? 'border-amber-400 dark:border-amber-800 shadow-sm shadow-amber-500/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {cat.categoryName}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        {isDanger && (
                          <span className="flex items-center gap-1 text-rose-600 font-bold">
                            <AlertOctagon className="w-3 h-3" /> Exceeded limit
                          </span>
                        )}
                        {isWarning && (
                          <span className="flex items-center gap-1 text-amber-600 font-bold">
                            <AlertTriangle className="w-3 h-3" /> &gt; {settings.warningThreshold}% used
                          </span>
                        )}
                        {!isDanger && !isWarning && (
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> On Track
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Limit & Inline Edit */}
                  <div className="text-right">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="100"
                          value={editLimitVal}
                          onChange={(e) => setEditLimitVal(e.target.value)}
                          className="w-24 px-2 py-1 text-xs font-bold rounded-lg border border-indigo-400 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          autoFocus
                        />
                        <button
                          onClick={() => saveCategoryLimit(cat.categoryId)}
                          className="p-1 rounded bg-indigo-600 text-white"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingCatId(null)}
                          className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {cat.limit > 0 ? formatCurrency(cat.limit, settings.currency) : 'No Limit'}
                        </span>
                        <button
                          onClick={() => startEditCategory(cat.categoryId, cat.limit)}
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                          title="Edit Limit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 block">Monthly Limit</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Spent: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(cat.spent, settings.currency)}</strong>
                    </span>
                    <span
                      className={`font-bold ${
                        isDanger ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {Math.round(cat.percentUsed)}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(cat.percentUsed, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Remaining Amount */}
                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <span className="text-slate-400">Remaining Budget</span>
                  <span
                    className={`font-bold ${
                      cat.remaining < 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {cat.remaining >= 0 ? '+' : ''}
                    {formatCurrency(cat.remaining, settings.currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* College Student Budget Rule Tip */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800/60 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              The Student 50-30-20 Rule
            </h4>
            <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Financial advisors recommend students allocate <strong>50%</strong> to Essentials (PG Rent, Food & Mess, Transit), <strong>30%</strong> to Academic & Personal (Textbooks, Stationery, Weekend Hangouts), and <strong>20%</strong> to Emergency Buffer & Long-term Savings Goals (Coding laptop, Certifications).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
