import React, { useState, useEffect } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { Transaction, TransactionType, PaymentMethod } from '../../types';
import { X, Check, AlertCircle } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI / GPay / PhonePe',
  'Cash',
  'Debit/Credit Card',
  'Net Banking',
  'Campus Card',
  'Other',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editTransaction,
}) => {
  const { categories, addTransaction, updateTransaction, settings } = useBudget();

  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI / GPay / PhonePe');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setTitle(editTransaction.title);
      setAmount(editTransaction.amount.toString());
      setCategory(editTransaction.category);
      setDate(editTransaction.date);
      setPaymentMethod(editTransaction.paymentMethod || 'UPI / GPay / PhonePe');
      setNotes(editTransaction.notes || '');
    } else {
      // Defaults for new transaction
      setType('expense');
      setTitle('');
      setAmount('');
      // Default to food for expense, income for income
      setCategory('food');
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('UPI / GPay / PhonePe');
      setNotes('');
    }
    setErrors({});
  }, [editTransaction, isOpen]);

  if (!isOpen) return null;

  // Filter categories by type
  const availableCategories = categories.filter((c) => {
    if (type === 'income') return c.id === 'income';
    return c.id !== 'income';
  });

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory('income');
    } else {
      setCategory('food');
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = 'Title or description is required';
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Amount must be a positive number greater than 0';
    }

    if (!category) {
      errs.category = 'Please select a category';
    }

    if (!date) {
      errs.date = 'Date is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedAmount = Math.abs(parseFloat(amount));

    if (editTransaction) {
      updateTransaction({
        ...editTransaction,
        title: title.trim(),
        amount: parsedAmount,
        type,
        category,
        date,
        paymentMethod,
        notes: notes.trim(),
      });
    } else {
      addTransaction({
        title: title.trim(),
        amount: parsedAmount,
        type,
        category,
        date,
        paymentMethod,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {editTransaction ? 'Edit Transaction' : 'Record New Transaction'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track student expenses, daily food, or income
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Toggle: Expense vs Income */}
          <div>
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Expense (-)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Income (+)
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount ({settings.currency.symbol}) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                {settings.currency.symbol}
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
                }}
                className={`w-full pl-8 pr-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-lg font-bold focus:outline-none focus:ring-2 transition-all ${
                  errors.amount
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="flex items-center gap-1 text-xs text-rose-500 mt-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.amount}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title / Description *
            </label>
            <input
              type="text"
              placeholder={type === 'expense' ? 'e.g. Canteen lunch, Metro pass, Textbook' : 'e.g. Parent allowance, Freelance gig, Tutor fee'}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              className={`w-full px-3.5 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.title
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
            />
            {errors.title && (
              <p className="flex items-center gap-1 text-xs text-rose-500 mt-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.title}
              </p>
            )}
          </div>

          {/* Category & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Split with roommates, purchased on discount..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-md transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{editTransaction ? 'Save Changes' : 'Save Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
