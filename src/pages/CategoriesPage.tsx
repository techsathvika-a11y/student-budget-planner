import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Category, TransactionType } from '../types';
import {
  CategoryIcon,
  AVAILABLE_CATEGORY_ICONS,
  AVAILABLE_COLORS,
} from '../components/common/CategoryIcon';
import { formatCurrency, getCategorySpending } from '../utils/calculations';
import {
  FolderTree,
  PlusCircle,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  ArrowRight,
  Check,
} from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const {
    categories,
    transactions,
    userProfile,
    addCategory,
    editCategory,
    deleteCategory,
    reassignCategory,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TransactionType>('expense');

  // Create / Edit Category Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [selectedIcon, setSelectedIcon] = useState('Utensils');
  const [selectedColor, setSelectedColor] = useState('#f97316');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [error, setError] = useState('');

  // Reassignment Modal state for safe deletion
  const [reassignModalInfo, setReassignModalInfo] = useState<{
    catToDelete: Category;
    txCount: number;
  } | null>(null);
  const [targetCatId, setTargetCatId] = useState('');

  const currentCategories = categories.filter(c => c.type === activeTab);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setType(activeTab);
    setSelectedIcon('Utensils');
    setSelectedColor('#6366f1');
    setBudgetLimit('1000');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setSelectedIcon(cat.icon);
    setSelectedColor(cat.color);
    setBudgetLimit(cat.budgetLimit ? String(cat.budgetLimit) : '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a category name');
      return;
    }

    const limitNum = budgetLimit ? parseFloat(budgetLimit) : undefined;

    if (editingCategory) {
      editCategory(editingCategory.id, {
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        budgetLimit: limitNum,
      });
    } else {
      addCategory({
        name: name.trim(),
        type,
        icon: selectedIcon,
        color: selectedColor,
        budgetLimit: limitNum,
      });
    }

    setIsModalOpen(false);
  };

  const handleDeleteClick = (cat: Category) => {
    const res = deleteCategory(cat.id);
    if (!res.success && res.transactionCount) {
      // Show reassignment modal
      const availableReplacements = categories.filter(
        c => c.id !== cat.id && c.type === cat.type
      );
      setTargetCatId(availableReplacements[0]?.id || '');
      setReassignModalInfo({
        catToDelete: cat,
        txCount: res.transactionCount,
      });
    }
  };

  const handleReassignAndDelete = () => {
    if (!reassignModalInfo || !targetCatId) return;
    reassignCategory(reassignModalInfo.catToDelete.id, targetCatId);
    deleteCategory(reassignModalInfo.catToDelete.id);
    setReassignModalInfo(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Category Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize and monitor spending categories tailored to student living
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Tabs: Expense vs Income */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('expense')}
          className={`py-2.5 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'expense'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Expense Categories ({categories.filter(c => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`py-2.5 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'income'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Income Categories ({categories.filter(c => c.type === 'income').length})
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentCategories.map(cat => {
          const txCount = transactions.filter(t => t.categoryId === cat.id).length;
          const totalSpentOrEarned = getCategorySpending(transactions, cat.id);

          return (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-3 rounded-xl text-white shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {cat.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {cat.isDefault ? 'Standard Category' : 'Custom Category'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!cat.isDefault && (
                      <button
                        onClick={() => handleDeleteClick(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Activity</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {txCount} transaction{txCount === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      {cat.type === 'expense' ? 'Total Spent' : 'Total Earned'}
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(totalSpentOrEarned, userProfile.currency.symbol)}
                    </p>
                  </div>
                </div>
              </div>

              {cat.type === 'expense' && cat.budgetLimit !== undefined && (
                <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center border-t border-slate-100 dark:border-slate-800 mt-2">
                  <span>Default Monthly Budget:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {formatCurrency(cat.budgetLimit, userProfile.currency.symbol)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Create Custom Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gym & Sports, Canteen Snacks"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
              </div>

              {!editingCategory && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Category Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setType('expense')}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        type === 'expense'
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('income')}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        type === 'income'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Income
                    </button>
                  </div>
                </div>
              )}

              {/* Color Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Color Tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{ backgroundColor: c }}
                    >
                      {selectedColor === c && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Icon
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
                  {AVAILABLE_CATEGORY_ICONS.map(iconName => (
                    <button
                      type="button"
                      key={iconName}
                      onClick={() => setSelectedIcon(iconName)}
                      className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
                        selectedIcon === iconName
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <CategoryIcon name={iconName} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Budget Limit (For expense categories) */}
              {type === 'expense' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Monthly Budget Limit ({userProfile.currency.symbol})
                  </label>
                  <input
                    type="number"
                    step="50"
                    placeholder="e.g. 1500"
                    value={budgetLimit}
                    onChange={e => setBudgetLimit(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe Deletion Reassignment Modal */}
      {reassignModalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Reassign Transactions First
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  <b>{reassignModalInfo.txCount} transaction(s)</b> are currently assigned to{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    "{reassignModalInfo.catToDelete.name}"
                  </span>
                  . To prevent orphaning your transaction history, select a replacement category:
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Transfer existing transactions to:
                </label>
                <select
                  value={targetCatId}
                  onChange={e => setTargetCatId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories
                    .filter(
                      c =>
                        c.id !== reassignModalInfo.catToDelete.id &&
                        c.type === reassignModalInfo.catToDelete.type
                    )
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setReassignModalInfo(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReassignAndDelete}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
                >
                  Reassign & Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
