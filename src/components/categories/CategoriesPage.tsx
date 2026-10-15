import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { Category } from '../../types';
import { formatCurrency, formatMonthYear } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  Info,
} from 'lucide-react';

const ICON_OPTIONS = [
  'Utensils',
  'Bus',
  'GraduationCap',
  'Home',
  'Film',
  'ShoppingBag',
  'HeartPulse',
  'CreditCard',
  'Coffee',
  'Gamepad2',
  'BookOpen',
  'Laptop',
  'Shirt',
  'Wifi',
  'Gift',
  'Tag',
];

const COLOR_OPTIONS = [
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Slate', hex: '#64748b' },
];

export const CategoriesPage: React.FC = () => {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    categoryBudgetsStatus,
    selectedMonth,
    settings,
    transactions,
    setActiveTab,
  } = useBudget();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#6366f1');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setIcon('Tag');
    setColor('#6366f1');
    setDescription('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setDescription(cat.description || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name: name.trim(),
        icon,
        color,
        description: description.trim(),
        bgColor: `${color}15`,
        textColor: color,
      });
    } else {
      addCategory({
        name: name.trim(),
        icon,
        color,
        description: description.trim(),
        bgColor: `${color}15`,
        textColor: color,
      });
    }

    setIsModalOpen(false);
  };

  // Month transactions count per category
  const txCountMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((tx) => tx.date && tx.date.startsWith(selectedMonth))
      .forEach((tx) => {
        map[tx.category] = (map[tx.category] || 0) + 1;
      });
    return map;
  }, [transactions, selectedMonth]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Expense Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Organize student living costs, configure limits, and customize category tags
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Custom Category</span>
        </button>
      </div>

      {/* Info notice */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-indigo-900 dark:text-indigo-200 text-xs">
        <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
        <p>
          Viewing spending statistics for <strong>{formatMonthYear(selectedMonth)}</strong>. You can customize limits in the{' '}
          <button
            onClick={() => setActiveTab('budgets')}
            className="underline font-bold hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Budget Management
          </button>{' '}
          page.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryBudgetsStatus.map((cat) => {
          const original = categories.find((c) => c.id === cat.categoryId);
          const count = txCountMap[cat.categoryId] || 0;
          const isDanger = cat.status === 'danger';
          const isWarning = cat.status === 'warning';

          return (
            <div
              key={cat.categoryId}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Category Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                        {cat.categoryName}
                        {original?.isCustom && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                            Custom
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {original?.description || 'Custom category'}
                      </p>
                    </div>
                  </div>

                  {/* Actions for custom categories */}
                  {original?.isCustom && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(original)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.categoryId)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Spending Progress Bar */}
                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Monthly Usage</span>
                    <span
                      className={`font-bold ${
                        isDanger
                          ? 'text-rose-600 dark:text-rose-400'
                          : isWarning
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-700 dark:text-slate-300'
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
              </div>

              {/* Stats Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Spent</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(cat.spent, settings.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Limit</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {cat.limit > 0 ? formatCurrency(cat.limit, settings.currency) : 'No Limit'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Tx Count</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{count}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Creating or Editing Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingCategory ? 'Edit Category' : 'Create Custom Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gym & Sports, Cafe, Books..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Icon
                </label>
                <div className="grid grid-cols-8 gap-2 max-h-36 overflow-y-auto p-1">
                  {ICON_OPTIONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                        icon === ic
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <CategoryIcon name={ic} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Color Theme
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setColor(c.hex)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        color === c.hex ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {color === c.hex && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Short Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Campus gym pass and protein"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
                >
                  {editingCategory ? 'Update' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
