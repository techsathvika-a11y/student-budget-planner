import React from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatMonthYear, getAvailableMonthsList, getPreviousMonth, getNextMonth } from '../../utils/formatters';
import {
  Menu,
  Moon,
  Sun,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onOpenAddTransaction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileMenu,
  onOpenAddTransaction,
}) => {
  const {
    settings,
    updateSettings,
    selectedMonth,
    setSelectedMonth,
    availableBalance,
    transactions,
  } = useBudget();

  const availableMonths = getAvailableMonthsList(transactions);

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  const handlePrevMonth = () => {
    setSelectedMonth(getPreviousMonth(selectedMonth));
  };

  const handleNextMonth = () => {
    setSelectedMonth(getNextMonth(selectedMonth));
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile menu button + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
                  CampusBudget
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  Student Edition
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Month Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={handlePrevMonth}
            className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 px-2 py-1 outline-none cursor-pointer text-center"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                {formatMonthYear(m)}
              </option>
            ))}
          </select>

          <button
            onClick={handleNextMonth}
            className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Balance Pill + Add Button + Theme Toggle + User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-time Available Balance */}
          <div className="hidden md:flex flex-col items-end px-3 py-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
              Total Balance
            </span>
            <span
              className={`text-sm font-bold tracking-tight ${
                availableBalance >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrency(availableBalance, settings.currency)}
            </span>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-indigo-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Add Entry</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title={settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Avatar */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-slate-900 shadow">
              {settings.studentName.charAt(0)}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {settings.studentName.split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-indigo-400" /> Student
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
