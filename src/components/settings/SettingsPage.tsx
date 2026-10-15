import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { CURRENCIES } from '../../data/initialData';
import {
  User,
  Coins,
  Palette,
  RotateCcw,
  Trash2,
  Check,
  AlertTriangle,
  Download,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToSampleData,
    clearAllData,
    transactions,
    categories,
    budgets,
    savingsGoals,
    upcomingBills,
    showToast,
  } = useBudget();

  // Local form state
  const [studentName, setStudentName] = useState(settings.studentName);
  const [college, setCollege] = useState(settings.college);
  const [semester, setSemester] = useState(settings.semester);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(settings.currency.code);
  const [theme, setTheme] = useState(settings.theme);
  const [warningThreshold, setWarningThreshold] = useState(settings.warningThreshold);
  const [dangerThreshold, setDangerThreshold] = useState(settings.dangerThreshold);
  const [totalBudget, setTotalBudget] = useState(settings.totalMonthlyBudget.toString());

  // Confirm Modals
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const curr = CURRENCIES.find((c) => c.code === selectedCurrencyCode) || settings.currency;
    const budgetVal = parseFloat(totalBudget) || settings.totalMonthlyBudget;

    updateSettings({
      studentName: studentName.trim() || 'Student',
      college: college.trim() || 'College',
      semester: semester.trim() || 'Semester',
      currency: curr,
      theme,
      warningThreshold: Number(warningThreshold),
      dangerThreshold: Number(dangerThreshold),
      totalMonthlyBudget: budgetVal,
    });
  };

  const handleExportBackup = () => {
    const backupData = {
      transactions,
      categories,
      budgets,
      savingsGoals,
      upcomingBills,
      settings,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student_budget_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Backup Downloaded', 'Full JSON data backup saved.', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Personalize your student identity, currency, alert limits, and data storage
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Student Profile Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Student Profile & Campus Info
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Student Full Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                University / College
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Semester / Department
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Currency & Financial Preferences */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Coins className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Currency & Budget Rules
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Currency Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Operating Currency (Default: INR ₹)
              </label>
              <select
                value={selectedCurrencyCode}
                onChange={(e) => setSelectedCurrencyCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.label} ({curr.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Total Budget */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Total Monthly Budget
              </label>
              <input
                type="number"
                step="500"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>

            {/* Warning Threshold Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Caution Alert Threshold
                </span>
                <span className="font-bold text-amber-600">{warningThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">
                Warns when category spending crosses this percentage
              </span>
            </div>

            {/* Danger Ceiling Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Danger Exceeded Ceiling
                </span>
                <span className="font-bold text-rose-600">{dangerThreshold}%</span>
              </div>
              <input
                type="range"
                min="90"
                max="130"
                value={dangerThreshold}
                onChange={(e) => setDangerThreshold(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">
                Flags category as strictly exceeded
              </span>
            </div>
          </div>
        </div>

        {/* Theme Preferences */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Palette className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Appearance & Theme
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`p-3.5 rounded-2xl border text-center font-bold text-xs capitalize transition-all ${
                  theme === t
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t === 'light' && '☀️ Light Mode'}
                {t === 'dark' && '🌙 Dark Mode'}
                {t === 'system' && '💻 System Auto'}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Data Management & Sample Data Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <RotateCcw className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Data Storage & Sample Controls
          </h2>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          All data is stored directly in your browser's persistent localStorage. You can restore realistic sample student records anytime or export a full JSON backup.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Reset Demo Data Button */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold text-xs sm:text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore Realistic Sample Data</span>
          </button>

          {/* Export JSON Backup */}
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export JSON Backup</span>
          </button>

          {/* Wipe All Data Button */}
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/80 bg-rose-50/50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold text-xs sm:text-sm hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Wipe All Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Resetting to Demo Data */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Restore Sample Student Records?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              This will populate your planner with realistic student transactions, categories, budgets, and savings goals across multiple semesters.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToSampleData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white"
              >
                Yes, Restore Demo Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Wiping Data */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-rose-200 dark:border-rose-900 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold">Wipe All Records?</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to delete all transactions, budgets, and savings goals? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllData();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white"
              >
                Yes, Wipe Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
