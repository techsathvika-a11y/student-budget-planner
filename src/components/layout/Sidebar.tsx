import React from 'react';
import { useBudget } from '../../context/BudgetContext';
import { NavigationTab } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Layers,
  PieChart,
  Target,
  Sparkles,
  FileBarChart2,
  Settings,
  X,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    activeTab,
    setActiveTab,
    monthlyExpenses,
    totalMonthlyBudget,
    budgetUsagePercent,
    settings,
  } = useBudget();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'categories', label: 'Expense Categories', icon: Layers },
    { id: 'budgets', label: 'Budget Management', icon: PieChart },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'insights', label: 'Financial Insights', icon: Sparkles, badge: 'Smart' },
    { id: 'reports', label: 'Reports & Export', icon: FileBarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const remainingBudget = totalMonthlyBudget - monthlyExpenses;
  const isBudgetExceeded = budgetUsagePercent >= settings.dangerThreshold;
  const isBudgetWarning = budgetUsagePercent >= settings.warningThreshold && !isBudgetExceeded;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors">
      {/* Brand Header for Mobile Drawer */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100">Student Budget</span>
        </div>
        <button
          onClick={onCloseMobile}
          className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-2">
          Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Monthly Budget Tracker Card in Sidebar */}
      <div className="p-3 m-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Month Budget</span>
            {isBudgetExceeded && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {Math.round(budgetUsagePercent)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
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

        <div className="flex justify-between items-center mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Spent: {formatCurrency(monthlyExpenses, settings.currency)}</span>
          <span className={remainingBudget < 0 ? 'text-rose-600 font-semibold' : ''}>
            {remainingBudget >= 0 ? 'Left: ' : 'Over: '}
            {formatCurrency(Math.abs(remainingBudget), settings.currency)}
          </span>
        </div>
      </div>

      {/* Student Profile Info Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
            {settings.college}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            {settings.semester}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-4rem)] sticky top-16 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer Slider */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
