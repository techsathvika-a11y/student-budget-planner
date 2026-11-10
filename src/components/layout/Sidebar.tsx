import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageView } from '../../types';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  FolderTree,
  PiggyBank,
  TrendingUp,
  FileSpreadsheet,
  Settings,
  PlusCircle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { getAvailableBalance, formatCurrency } from '../../utils/calculations';

interface NavItem {
  id: PageView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'budgets', label: 'Budget Planner', icon: PieChart },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'goals', label: 'Savings Goals', icon: PiggyBank },
  { id: 'insights', label: 'Financial Insights', icon: TrendingUp },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    setIsQuickAddOpen,
    userProfile,
    transactions,
    savingsGoals,
  } = useApp();

  const availableBal = getAvailableBalance(transactions, savingsGoals);

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
            Student Budget
            <span className="text-[10px] uppercase font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
              Smart
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Money Management</p>
        </div>
      </div>

      {/* Quick Add Button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Quick Transaction</span>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Student Profile Card Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
              {userProfile.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {userProfile.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {userProfile.college || 'College Student'}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-slate-400">Available:</span>
            <span
              className={`font-bold ${
                availableBal >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrency(availableBal, userProfile.currency.symbol)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
