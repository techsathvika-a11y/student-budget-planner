import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEFAULT_CURRENCIES } from '../data/initialData';
import { exportAppDataJson, exportTransactionsToCsv } from '../utils/csvExport';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  User,
  Sliders,
  Database,
  Moon,
  Sun,
  Laptop,
  Save,
  Download,
  RotateCcw,
  Trash2,
  ShieldAlert,
  GraduationCap,
  Bell,
  CheckCircle2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    userProfile,
    updateProfile,
    toggleTheme,
    transactions,
    categories,
    savingsGoals,
    budgets,
    resetToDemoData,
    clearAllData,
    loadSampleData,
  } = useApp();

  // Profile Form state
  const [name, setName] = useState(userProfile.name);
  const [college, setCollege] = useState(userProfile.college);
  const [course, setCourse] = useState(userProfile.course);

  // Preferences Form state
  const [currencyCode, setCurrencyCode] = useState(userProfile.currency.code);
  const [defaultBudget, setDefaultBudget] = useState(String(userProfile.defaultMonthlyBudget));
  const [warningThreshold, setWarningThreshold] = useState(String(userProfile.warningThreshold || 80));
  const [dangerThreshold, setDangerThreshold] = useState(String(userProfile.dangerThreshold || 100));
  const [budgetStartDay, setBudgetStartDay] = useState(String(userProfile.budgetStartDay || 1));

  // Modal Confirmations
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || 'Student',
      college: college.trim(),
      course: course.trim(),
    });
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const curr = DEFAULT_CURRENCIES.find(c => c.code === currencyCode) || userProfile.currency;
    const budgetVal = parseFloat(defaultBudget) || 10000;
    const warnVal = parseInt(warningThreshold, 10) || 80;
    const dangerVal = parseInt(dangerThreshold, 10) || 100;
    const startDay = parseInt(budgetStartDay, 10) || 1;

    updateProfile({
      currency: curr,
      defaultMonthlyBudget: budgetVal,
      warningThreshold: warnVal,
      dangerThreshold: dangerVal,
      budgetStartDay: startDay,
    });
  };

  const handleExportAllBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      userProfile,
      categories,
      transactions,
      savingsGoals,
      budgets,
    };
    exportAppDataJson(backupData, `student-budget-backup-${userProfile.name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const handleExportCsv = () => {
    exportTransactionsToCsv(transactions, categories, userProfile.currency.code, 'all-transactions');
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* 1. Student Profile Settings */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Student Profile</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalize your dashboard and student ID information
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Display Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                College / University
              </label>
              <input
                type="text"
                value={college}
                onChange={e => setCollege(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Course / Department
              </label>
              <input
                type="text"
                value={course}
                onChange={e => setCourse(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Preferences & Alerts */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Application Preferences & Budget Alerts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Currency, default limits, theme, and spending warning thresholds
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Currency */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Currency
              </label>
              <select
                value={currencyCode}
                onChange={e => setCurrencyCode(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DEFAULT_CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Default Monthly Budget */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Default Total Monthly Budget ({userProfile.currency.symbol})
              </label>
              <input
                type="number"
                step="500"
                value={defaultBudget}
                onChange={e => setDefaultBudget(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Warning Threshold */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Budget Caution Alert Threshold (%)
              </label>
              <input
                type="number"
                min="10"
                max="99"
                value={warningThreshold}
                onChange={e => setWarningThreshold(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Triggers warning alert (Default: 80%)</p>
            </div>

            {/* Danger Threshold */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Overspending Alert Threshold (%)
              </label>
              <input
                type="number"
                min="50"
                max="150"
                value={dangerThreshold}
                onChange={e => setDangerThreshold(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Triggers overspending alert (Default: 100%)</p>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Appearance Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => toggleTheme('light')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  userProfile.theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => toggleTheme('dark')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  userProfile.theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark</span>
              </button>

              <button
                type="button"
                onClick={() => toggleTheme('system')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  userProfile.theme === 'system'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>System</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Data Management & Persistence */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Management & Demo Sandbox
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export data backups, restore demo records, or wipe clean
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <p className="font-semibold text-slate-900 dark:text-white mb-1">
            🔒 Local Storage Guarantee
          </p>
          <p>
            All records are stored privately in your browser's localStorage. No bank credentials,
            account numbers, or passwords are ever requested or transmitted over the internet.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={handleExportAllBackup}
            className="flex items-center justify-center gap-2 p-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Export Full JSON Backup</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="flex items-center justify-center gap-2 p-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export All Transactions (CSV)</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={() => setConfirmResetOpen(true)}
            className="flex items-center justify-center gap-2 p-3 text-xs font-semibold rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Demo Data</span>
          </button>

          {/* Clear All Data */}
          <button
            onClick={() => setConfirmClearOpen(true)}
            className="flex items-center justify-center gap-2 p-3 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 hover:bg-rose-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Application Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Reset Demo Data */}
      <ConfirmModal
        isOpen={confirmResetOpen}
        title="Reset to Student Demo Data"
        message="This will reload the realistic student demo transactions, categories, budgets, and savings goals. Any custom transactions you added will be replaced by the demo set. Do you want to proceed?"
        confirmLabel="Reset Demo Data"
        variant="warning"
        onConfirm={() => {
          resetToDemoData();
          setConfirmResetOpen(false);
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />

      {/* Confirmation Modal for Clear All Data */}
      <ConfirmModal
        isOpen={confirmClearOpen}
        title="Wipe All Application Data"
        message="Are you sure you want to clear all transactions, savings goals, and monthly budgets? This action cannot be undone unless you have downloaded a JSON backup."
        confirmLabel="Yes, Clear Everything"
        variant="danger"
        onConfirm={() => {
          clearAllData();
          setConfirmClearOpen(false);
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
};
