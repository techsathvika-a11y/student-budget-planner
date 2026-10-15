import React, { useState, useMemo } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { Transaction, TransactionType } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  Search,
  ArrowUpDown,
  Plus,
  Trash2,
  Edit2,
  CreditCard,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';

interface TransactionsPageProps {
  onOpenAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

type SortField = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenAddTransaction,
  onEditTransaction,
}) => {
  const {
    transactions,
    categories,
    deleteTransaction,
    settings,
    exportCSV,
  } = useBudget();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all'); // 'all' or specific 'YYYY-MM'
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Category map for quick lookup
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Extract available months for filtering
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        set.add(tx.date.substring(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [transactions]);

  // Filtered and Sorted list
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = tx.title.toLowerCase().includes(q);
          const matchesNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
          const matchesMethod = tx.paymentMethod ? tx.paymentMethod.toLowerCase().includes(q) : false;
          if (!matchesTitle && !matchesNotes && !matchesMethod) return false;
        }

        // Type filter
        if (typeFilter !== 'all' && tx.type !== typeFilter) {
          return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && tx.category !== categoryFilter) {
          return false;
        }

        // Month filter
        if (monthFilter !== 'all' && (!tx.date || !tx.date.startsWith(monthFilter))) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const timeA = new Date(a.date).getTime();
          const timeB = new Date(b.date).getTime();
          return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
        }
        if (sortField === 'amount') {
          return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        }
        return 0;
      });
  }, [transactions, searchQuery, typeFilter, categoryFilter, monthFilter, sortField, sortOrder]);

  // Summary stats for filtered view
  const filteredIncome = useMemo(
    () => filteredTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );
  const filteredExpenses = useMemo(
    () => filteredTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Transaction History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Search, filter, categorize, and reconcile your student expenses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, notes, method..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTypeFilter('all')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                typeFilter === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                typeFilter === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Income
            </button>
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month Dropdown */}
          <div>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Recorded Time</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredTransactions.length}</span> of {transactions.length} entries
          </div>

          <div className="flex items-center gap-4">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Income: +{formatCurrency(filteredIncome, settings.currency)}
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">
              Expenses: -{formatCurrency(filteredExpenses, settings.currency)}
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Net: {formatCurrency(filteredIncome - filteredExpenses, settings.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table / Card List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">
                    <button
                      onClick={() => toggleSort('date')}
                      className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      Date <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleSort('amount')}
                      className="flex items-center gap-1 ml-auto hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      Amount <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredTransactions.map((tx) => {
                  const cat = categoryMap.get(tx.category);
                  const isExpense = tx.type === 'expense';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(tx.date)}
                      </td>

                      {/* Title & Notes */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {tx.title}
                        </div>
                        {tx.notes && (
                          <div className="text-xs text-slate-400 truncate mt-0.5">
                            {tx.notes}
                          </div>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={{
                            backgroundColor: `${cat?.color || '#6366f1'}15`,
                            color: cat?.color || '#6366f1',
                          }}
                        >
                          <CategoryIcon name={cat?.icon || 'Tag'} className="w-3.5 h-3.5" />
                          <span>{cat?.name || tx.category}</span>
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          {tx.paymentMethod}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-bold text-sm">
                        <span
                          className={
                            isExpense
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }
                        >
                          {isExpense ? '-' : '+'}
                          {formatCurrency(tx.amount, settings.currency)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right text-xs">
                        {deleteConfirmId === tx.id ? (
                          <div className="flex items-center justify-end gap-1.5 animate-in fade-in">
                            <button
                              onClick={() => handleDelete(tx.id)}
                              className="px-2 py-1 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onEditTransaction(tx)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(tx.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400 mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Transactions Match Your Filter
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Try adjusting your search query, clearing filters, or record a new transaction.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setCategoryFilter('all');
                  setMonthFilter('all');
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Reset Filters
              </button>
              <button
                onClick={onOpenAddTransaction}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white shadow-sm"
              >
                Add Transaction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
