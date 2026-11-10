import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SavingsGoal } from '../types';
import {
  getCumulativeNetBalance,
  getTotalMoneySaved,
  getAvailableBalance,
  formatCurrency,
  formatDate,
} from '../utils/calculations';
import { CategoryIcon, AVAILABLE_COLORS } from '../components/common/CategoryIcon';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  PiggyBank,
  PlusCircle,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  X,
  ShieldCheck,
  Info,
} from 'lucide-react';

export const SavingsGoalsPage: React.FC = () => {
  const {
    savingsGoals,
    transactions,
    userProfile,
    addSavingsGoal,
    editSavingsGoal,
    deleteSavingsGoal,
    depositToGoal,
    withdrawFromGoal,
  } = useApp();

  const netBalance = getCumulativeNetBalance(transactions);
  const totalSaved = getTotalMoneySaved(savingsGoals);
  const availableBal = getAvailableBalance(transactions, savingsGoals);

  // Modal States
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Goal Form Fields
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialSaved, setInitialSaved] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [selectedIcon, setSelectedIcon] = useState('PiggyBank');
  const [formError, setFormError] = useState('');

  // Deposit / Withdraw Modal State
  const [fundModalInfo, setFundModalInfo] = useState<{
    goal: SavingsGoal;
    action: 'deposit' | 'withdraw';
  } | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundError, setFundError] = useState('');

  // Delete confirm state
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setName('');
    setTargetAmount('');
    setInitialSaved('0');
    setTargetDate('');
    setDescription('');
    setSelectedColor('#6366f1');
    setSelectedIcon('PiggyBank');
    setFormError('');
    setIsGoalModalOpen(true);
  };

  const handleOpenEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(String(goal.targetAmount));
    setInitialSaved(String(goal.currentSavedAmount));
    setTargetDate(goal.targetDate);
    setDescription(goal.description || '');
    setSelectedColor(goal.color || '#6366f1');
    setSelectedIcon(goal.icon || 'PiggyBank');
    setFormError('');
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter a goal title');
      return;
    }
    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      setFormError('Target amount must be greater than zero');
      return;
    }

    if (editingGoal) {
      editSavingsGoal(editingGoal.id, {
        name: name.trim(),
        targetAmount: target,
        targetDate: targetDate || editingGoal.targetDate,
        description: description.trim(),
        color: selectedColor,
        icon: selectedIcon,
      });
    } else {
      const init = parseFloat(initialSaved) || 0;
      addSavingsGoal(
        {
          name: name.trim(),
          targetAmount: target,
          targetDate: targetDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
          description: description.trim(),
          color: selectedColor,
          icon: selectedIcon,
        },
        init
      );
    }

    setIsGoalModalOpen(false);
  };

  const handleExecuteFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundModalInfo) return;

    const amt = parseFloat(fundAmount);
    if (isNaN(amt) || amt <= 0) {
      setFundError('Please enter a valid amount');
      return;
    }

    if (fundModalInfo.action === 'withdraw' && amt > fundModalInfo.goal.currentSavedAmount) {
      setFundError(`Cannot withdraw more than saved (${userProfile.currency.symbol}${fundModalInfo.goal.currentSavedAmount})`);
      return;
    }

    if (fundModalInfo.action === 'deposit') {
      depositToGoal(fundModalInfo.goal.id, amt);
    } else {
      withdrawFromGoal(fundModalInfo.goal.id, amt);
    }

    setFundModalInfo(null);
    setFundAmount('');
    setFundError('');
  };

  // Motivational message generator
  const getMotivationalMessage = (pct: number) => {
    if (pct >= 100) return '🎉 Goal Achieved! Outstanding student discipline!';
    if (pct >= 75) return '🔥 Almost there! Just a final sprint to reach your target!';
    if (pct >= 50) return '💪 Over halfway there! Keep your daily canteen spending steady!';
    if (pct >= 25) return '🚀 Great momentum! Consistent savings turn into big results!';
    return '🌱 Great start! Every small rupee saved counts toward this goal.';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Anti-Double-Counting Financial Clarity Hero Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Smart Money Allocation</h3>
            </div>
            <p className="text-xs text-indigo-200/80 max-w-xl">
              Savings are portions of your net balance safely set aside for future targets. They are
              not counted as new expenses or duplicate income, keeping your true budget accurate.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs">
            <div className="bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-xs">
              <span className="text-indigo-200 block text-[10px] uppercase font-semibold">Total Saved</span>
              <span className="text-base font-extrabold text-emerald-400">
                {formatCurrency(totalSaved, userProfile.currency.symbol)}
              </span>
            </div>
            <div className="bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-xs">
              <span className="text-indigo-200 block text-[10px] uppercase font-semibold">Free Balance</span>
              <span className="text-base font-extrabold text-white">
                {formatCurrency(availableBal, userProfile.currency.symbol)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Savings Goals</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set and track targets for semester books, hardware, trips, and emergency funds
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      {savingsGoals.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <PiggyBank className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No savings goals established yet
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create a goal to start putting aside money for exams, laptop, or weekend trips!
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl"
          >
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {savingsGoals.map(goal => {
            const pct = Math.round((goal.currentSavedAmount / goal.targetAmount) * 100);
            const remaining = Math.max(0, goal.targetAmount - goal.currentSavedAmount);
            const isCompleted = pct >= 100;

            return (
              <div
                key={goal.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all relative overflow-hidden"
              >
                {/* Top Row: Icon, Title & Edit/Delete */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-3 rounded-xl text-white shadow-xs shrink-0"
                        style={{ backgroundColor: goal.color || '#6366f1' }}
                      >
                        <CategoryIcon name={goal.icon || 'PiggyBank'} size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {goal.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Target: {formatDate(goal.targetDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(goal)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Goal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingGoalId(goal.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {goal.description}
                    </p>
                  )}

                  {/* Financial figures */}
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        Saved So Far
                      </span>
                      <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(goal.currentSavedAmount, userProfile.currency.symbol)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-slate-400">Target</span>
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        {formatCurrency(goal.targetAmount, userProfile.currency.symbol)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 mb-3">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className={isCompleted ? 'text-emerald-600 font-bold' : 'text-indigo-600 dark:text-indigo-400'}>
                        {pct}% achieved
                      </span>
                      <span className="text-slate-400">
                        {isCompleted
                          ? 'Complete'
                          : `${formatCurrency(remaining, userProfile.currency.symbol)} remaining`}
                      </span>
                    </div>
                  </div>

                  {/* Motivational Student Message */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{getMotivationalMessage(pct)}</span>
                  </div>
                </div>

                {/* Deposit & Withdraw Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setFundModalInfo({ goal, action: 'deposit' });
                      setFundAmount('');
                      setFundError('');
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Deposit</span>
                  </button>
                  <button
                    onClick={() => {
                      setFundModalInfo({ goal, action: 'withdraw' });
                      setFundAmount('');
                      setFundError('');
                    }}
                    disabled={goal.currentSavedAmount <= 0}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors disabled:opacity-40"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Creation / Edit Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
              </h3>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Goal Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Coding Laptop, Manali Trip, Course Fees"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                {formError && <p className="text-xs text-rose-500 mt-1">{formError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Target Amount ({userProfile.currency.symbol}) *
                  </label>
                  <input
                    type="number"
                    step="100"
                    placeholder="e.g. 25000"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {!editingGoal && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Initial Deposit ({userProfile.currency.symbol})
                    </label>
                    <input
                      type="number"
                      step="100"
                      placeholder="0"
                      value={initialSaved}
                      onChange={e => setInitialSaved(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Description / Purpose
                </label>
                <textarea
                  rows={2}
                  placeholder="Why are you saving for this?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Card Theme Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.slice(0, 8).map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{ backgroundColor: c }}
                    >
                      {selectedColor === c && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md"
                >
                  {editingGoal ? 'Save Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit / Withdraw Modal */}
      {fundModalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                {fundModalInfo.action === 'deposit' ? 'Add Money to Goal' : 'Withdraw from Goal'}
              </h3>
              <button
                onClick={() => setFundModalInfo(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteFund} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Goal: <b className="text-slate-900 dark:text-white">{fundModalInfo.goal.name}</b>
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Amount ({userProfile.currency.symbol})
                </label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  placeholder="0.00"
                  value={fundAmount}
                  onChange={e => setFundAmount(e.target.value)}
                  className="w-full px-3 py-2 text-base font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                {fundError && <p className="text-xs text-rose-500 mt-1">{fundError}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFundModalInfo(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-xs font-semibold rounded-xl text-white shadow-md ${
                    fundModalInfo.action === 'deposit'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  Confirm {fundModalInfo.action === 'deposit' ? 'Deposit' : 'Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingGoalId)}
        title="Delete Savings Goal"
        message="Are you sure you want to delete this savings goal? Any funds tracked here will return to your general available balance calculation."
        confirmLabel="Yes, Delete"
        variant="danger"
        onConfirm={() => {
          if (deletingGoalId) {
            deleteSavingsGoal(deletingGoalId);
            setDeletingGoalId(null);
          }
        }}
        onCancel={() => setDeletingGoalId(null)}
      />
    </div>
  );
};
