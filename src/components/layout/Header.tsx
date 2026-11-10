import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MonthSelector } from '../common/MonthSelector';
import {
  Sun,
  Moon,
  Plus,
  Menu,
  Bell,
  X,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  filterTransactionsByMonth,
  getCategoryBreakdown,
  formatCurrency,
} from '../../utils/calculations';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    activePage,
    setActivePage,
    setIsQuickAddOpen,
    userProfile,
    toggleTheme,
    transactions,
    categories,
    currentMonth,
    getCurrentBudget,
  } = useApp();

  const [showAlertDropdown, setShowAlertDropdown] = useState(false);

  // Calculate budget alerts for current month
  const currBudget = getCurrentBudget(currentMonth);
  const currentMonthTx = filterTransactionsByMonth(transactions, currentMonth);
  const breakdowns = getCategoryBreakdown(currentMonthTx, categories, currBudget.categoryBudgets);

  const activeAlerts = breakdowns.filter(
    b => b.limit > 0 && b.percentageUsed >= (userProfile.warningThreshold || 80)
  );

  const pageDetails: Record<string, { title: string; subtitle: string; showMonth: boolean }> = {
    dashboard: {
      title: 'Financial Dashboard',
      subtitle: `Welcome back, ${userProfile.name}! Here is your money overview.`,
      showMonth: true,
    },
    transactions: {
      title: 'Transactions',
      subtitle: 'Complete record of your income, expenses, and payments.',
      showMonth: false,
    },
    budgets: {
      title: 'Smart Budget Planner',
      subtitle: 'Track spending against category limits and avoid student debt.',
      showMonth: true,
    },
    categories: {
      title: 'Expense Categories',
      subtitle: 'Organize your spending into custom student categories.',
      showMonth: false,
    },
    goals: {
      title: 'Savings Goals',
      subtitle: 'Save steadily for your laptop, semester books, and emergency fund.',
      showMonth: false,
    },
    insights: {
      title: 'Financial Insights',
      subtitle: 'Smart analysis of your actual spending patterns & practical tips.',
      showMonth: true,
    },
    reports: {
      title: 'Reports & Data Export',
      subtitle: 'Detailed charts, spending analytics, and CSV transaction exports.',
      showMonth: true,
    },
    settings: {
      title: 'Settings & Preferences',
      subtitle: 'Manage your student profile, currency, alerts, and demo data.',
      showMonth: false,
    },
  };

  const currentDetail = pageDetails[activePage] || {
    title: 'Student Budget Planner',
    subtitle: 'Manage your finances',
    showMonth: false,
  };

  const isDarkMode =
    userProfile.theme === 'dark' ||
    (userProfile.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {currentDetail.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {currentDetail.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Month Selector when appropriate */}
          {currentDetail.showMonth && <MonthSelector className="hidden sm:inline-flex" />}

          {/* Budget Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlertDropdown(prev => !prev)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Budget Alerts"
            >
              <Bell className="w-5 h-5" />
              {activeAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>

            {/* Alerts Dropdown */}
            {showAlertDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowAlertDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Budget Notifications
                    </h3>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold px-2 py-0.5 rounded-full">
                      {activeAlerts.length} Active
                    </span>
                  </div>

                  {activeAlerts.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 dark:text-slate-400 text-xs">
                      🎉 All budgets are within safe spending limits this month!
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto">
                      {activeAlerts.map(alert => (
                        <div
                          key={alert.categoryId}
                          className={`p-3 rounded-xl border text-xs ${
                            alert.percentageUsed >= 100
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50'
                              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span
                              className={
                                alert.percentageUsed >= 100
                                  ? 'text-rose-700 dark:text-rose-300'
                                  : 'text-amber-700 dark:text-amber-300'
                              }
                            >
                              {alert.categoryName}
                            </span>
                            <span
                              className={
                                alert.percentageUsed >= 100
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-amber-600 dark:text-amber-400'
                              }
                            >
                              {alert.percentageUsed}% used
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300">
                            Spent {formatCurrency(alert.spent, userProfile.currency.symbol)} of{' '}
                            {formatCurrency(alert.limit, userProfile.currency.symbol)} limit.
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowAlertDropdown(false);
                      setActivePage('budgets');
                    }}
                    className="w-full mt-3 py-2 text-xs font-semibold text-center text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View Budget Planner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => toggleTheme()}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {/* Quick Add Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-1.5 py-2 px-3 sm:px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Mobile Month Selector Row */}
      {currentDetail.showMonth && (
        <div className="sm:hidden mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-center">
          <MonthSelector />
        </div>
      )}
    </header>
  );
};
