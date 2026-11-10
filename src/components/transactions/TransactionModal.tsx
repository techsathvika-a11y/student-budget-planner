import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction, TransactionType, PaymentMethod } from '../../types';
import { X, ArrowUpRight, ArrowDownLeft, Calendar, CreditCard, Tag, FileText } from 'lucide-react';

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI / GPay / PhonePe',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Net Banking',
  'Other',
];

export const TransactionModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    editingTransaction,
    setEditingTransaction,
    categories,
    addTransaction,
    editTransaction,
    userProfile,
  } = useApp();

  const isOpen = isQuickAddOpen || Boolean(editingTransaction);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI / GPay / PhonePe');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ title?: string; amount?: string; categoryId?: string }>({});

  // Filter categories by selected transaction type
  const availableCategories = categories.filter(c => c.type === type);

  // Sync state when editing or opening modal
  useEffect(() => {
    if (editingTransaction) {
      setTitle(editingTransaction.title);
      setAmount(String(editingTransaction.amount));
      setType(editingTransaction.type);
      setCategoryId(editingTransaction.categoryId);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNotes(editingTransaction.notes || '');
      setErrors({});
    } else if (isOpen) {
      setTitle('');
      setAmount('');
      setType('expense');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI / GPay / PhonePe');
      setNotes('');
      setErrors({});
      // Pick first default expense category
      const firstExpense = categories.find(c => c.type === 'expense');
      if (firstExpense) setCategoryId(firstExpense.id);
    }
  }, [isOpen, editingTransaction, categories]);

  // When type changes, ensure valid category is selected
  useEffect(() => {
    const currentCat = categories.find(c => c.id === categoryId);
    if (!currentCat || currentCat.type !== type) {
      const match = categories.find(c => c.type === type);
      if (match) setCategoryId(match.id);
    }
  }, [type, categories, categoryId]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsQuickAddOpen(false);
    setEditingTransaction(null);
  };

  const validate = (): boolean => {
    const errs: { title?: string; amount?: string; categoryId?: string } = {};

    if (!title.trim()) {
      errs.title = 'Please enter a transaction title';
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Amount must be greater than zero';
    }

    if (!categoryId) {
      errs.categoryId = 'Please select a category';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedAmount = Math.round(parseFloat(amount) * 100) / 100;

    if (editingTransaction) {
      editTransaction(editingTransaction.id, {
        title: title.trim(),
        amount: parsedAmount,
        type,
        categoryId,
        date,
        paymentMethod,
        notes: notes.trim(),
      });
    } else {
      addTransaction({
        title: title.trim(),
        amount: parsedAmount,
        type,
        categoryId,
        date,
        paymentMethod,
        notes: notes.trim(),
      });
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {editingTransaction
                ? 'Update transaction details'
                : 'Log your student income or daily expense'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Income
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Amount ({userProfile.currency.symbol}) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                {userProfile.currency.symbol}
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                autoFocus
                className={`w-full pl-8 pr-4 py-2.5 text-lg font-bold rounded-xl border bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.amount
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Title / Description *
            </label>
            <input
              type="text"
              placeholder={type === 'expense' ? 'e.g. Canteen Lunch, Metro recharge' : 'e.g. Parents Allowance, Part-time stipend'}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                errors.title
                  ? 'border-rose-400 focus:ring-rose-400'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
              }`}
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
          </div>

          {/* Category & Payment Method Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                <Tag className="w-3.5 h-3.5" />
                Category *
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-rose-500 mt-1">{errors.categoryId}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Field */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Optional Notes */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              <FileText className="w-3.5 h-3.5" />
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Additional details, bill reference, split with friends..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl text-white shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-400'
                  : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-400'
              }`}
            >
              {editingTransaction ? 'Save Changes' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
