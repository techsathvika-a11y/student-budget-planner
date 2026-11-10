import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';
import { exportTransactionsToCsv } from '../utils/csvExport';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  PlusCircle,
  Edit2,
  Trash2,
  Receipt,
  FileQuestion,
  Calendar,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const {
    transactions,
    categories,
    userProfile,
    setIsQuickAddOpen,
    setEditingTransaction,
    deleteTransaction,
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'last_30_days' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Deletion modal state
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

  // Category mapping
  const categoryMap = useMemo(() => {
    const map = new Map<string, (typeof categories)[0]>();
    categories.forEach(c => map.set(c.id, c));
    return map;
  }, [categories]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = tx.title.toLowerCase().includes(q);
          const matchesNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
          const cat = categoryMap.get(tx.categoryId);
          const matchesCategory = cat ? cat.name.toLowerCase().includes(q) : false;
          if (!matchesTitle && !matchesNotes && !matchesCategory) return false;
        }

        // Type filter
        if (selectedType !== 'all' && tx.type !== selectedType) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) {
          return false;
        }

        // Date range filter
        const now = new Date();
        const txDate = new Date(tx.date);

        if (dateFilter === 'this_month') {
          const isSameMonth =
            txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
          if (!isSameMonth) return false;
        } else if (dateFilter === 'last_30_days') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          if (txDate < thirtyDaysAgo) return false;
        } else if (dateFilter === 'custom') {
          if (customStartDate && tx.date < customStartDate) return false;
          if (customEndDate && tx.date > customEndDate) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'highest') {
          return b.amount - a.amount;
        }
        if (sortBy === 'lowest') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [
    transactions,
    searchQuery,
    selectedType,
    selectedCategory,
    dateFilter,
    customStartDate,
    customEndDate,
    sortBy,
    categoryMap,
  ]);

  // Filtered Totals
  const filteredIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleExportCsv = () => {
    exportTransactionsToCsv(
      filteredTransactions,
      categories,
      userProfile.currency.code,
      'filtered-transactions'
    );
  };

  const confirmDelete = () => {
    if (deletingTxId) {
      deleteTransaction(deletingTxId);
      setDeletingTxId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transaction History</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filteredTransactions.length} transaction{filteredTransactions.length === 1 ? '' : 's'} found
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={filteredTransactions.length === 0}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filtered Summary Pill Banner */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Filtered Inflow</p>
          <p className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(filteredIncome, userProfile.currency.symbol)}
          </p>
        </div>
        <div className="border-x border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Filtered Outflow</p>
          <p className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400">
            -{formatCurrency(filteredExpenses, userProfile.currency.symbol)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Net Difference</p>
          <p
            className={`text-sm sm:text-base font-bold ${
              filteredIncome - filteredExpenses >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(filteredIncome - filteredExpenses, userProfile.currency.symbol)}
          </p>
        </div>
      </div>

      {/* Search & Filter Controls Card */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
        {/* Row 1: Search Bar & Type Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, notes, or category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Type filter tabs */}
          <div className="inline-flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {(['all', 'expense', 'income'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedType(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  selectedType === tab
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab === 'all' ? 'All Types' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Category, Date Range, and Sorting Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.type === 'expense' ? '🔴' : '🟢'} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date filter dropdown */}
          <div>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Date: All Time</option>
              <option value="this_month">Date: This Month</option>
              <option value="last_30_days">Date: Last 30 Days</option>
              <option value="custom">Date: Custom Range</option>
            </select>
          </div>

          {/* Sort dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest">Sort: Highest Amount</option>
              <option value="lowest">Sort: Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Row if 'custom' is active */}
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">From:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={e => setCustomStartDate(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
            />
            <span className="text-xs text-slate-500">To:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={e => setCustomEndDate(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Transactions Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
              <FileQuestion className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No transactions match your filters
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, clear some filters, or log a new transaction.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedCategory('all');
                setDateFilter('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Title & Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTransactions.map(tx => {
                    const cat = categoryMap.get(tx.categoryId);
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900 dark:text-white">{tx.title}</p>
                          {tx.notes && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-xs">
                              {tx.notes}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white shadow-xs"
                            style={{ backgroundColor: cat?.color || '#64748b' }}
                          >
                            <CategoryIcon name={cat?.icon || 'CircleDot'} size={12} />
                            {cat?.name || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {tx.paymentMethod}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap font-bold">
                          <span
                            className={
                              tx.type === 'income'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-900 dark:text-white'
                            }
                          >
                            {tx.type === 'income' ? '+' : '-'}
                            {formatCurrency(tx.amount, userProfile.currency.symbol)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingTransaction(tx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                              title="Edit Transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingTxId(tx.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                              title="Delete Transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map(tx => {
                const cat = categoryMap.get(tx.categoryId);
                return (
                  <div key={tx.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="p-2 rounded-xl text-white shadow-xs shrink-0"
                          style={{ backgroundColor: cat?.color || '#64748b' }}
                        >
                          <CategoryIcon name={cat?.icon || 'CircleDot'} size={15} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.title}</p>
                          <p className="text-xs text-slate-500">{cat?.name || 'General'}</p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount, userProfile.currency.symbol)}
                      </span>
                    </div>

                    {tx.notes && (
                      <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                        {tx.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>{formatDate(tx.date)} • {tx.paymentMethod}</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setEditingTransaction(tx)}
                          className="font-semibold text-indigo-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingTxId(tx.id)}
                          className="font-semibold text-rose-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal for Transaction Deletion */}
      <ConfirmModal
        isOpen={Boolean(deletingTxId)}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction record? This action will immediately adjust your available balance and monthly budget totals."
        confirmLabel="Yes, Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingTxId(null)}
      />
    </div>
  );
};
