import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { SavingsGoal } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import confetti from 'canvas-confetti';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  PiggyBank,
  X,
  History,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const GOAL_ICONS = ['Laptop', 'Award', 'Compass', 'ShieldCheck', 'BookOpen', 'GraduationCap', 'Plane', 'Smartphone', 'Gift'];
const GOAL_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6', '#ef4444', '#3b82f6'];

export const SavingsGoalsPage: React.FC = () => {
  const {
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addGoalContribution,
    settings,
  } = useBudget();

  // Modals state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Contribution Modal state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');
  const [depositError, setDepositError] = useState('');

  // Expand contributions history per goal
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  // Goal Form State
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentSaved, setCurrentSaved] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [icon, setIcon] = useState('Laptop');
  const [color, setColor] = useState('#6366f1');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const openCreateModal = () => {
    setEditingGoal(null);
    setName('');
    setTargetAmount('');
    setCurrentSaved('0');
    setTargetDate('');
    setIcon('Laptop');
    setColor('#6366f1');
    setNotes('');
    setFormError('');
    setIsGoalModalOpen(true);
  };

  const openEditModal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentSaved(goal.currentSaved.toString());
    setTargetDate(goal.targetDate);
    setIcon(goal.icon || 'Laptop');
    setColor(goal.color || '#6366f1');
    setNotes(goal.notes || '');
    setFormError('');
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Goal title is required');
      return;
    }
    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      setFormError('Target amount must be greater than 0');
      return;
    }
    const initialSaved = parseFloat(currentSaved) || 0;
    if (initialSaved < 0) {
      setFormError('Current saved cannot be negative');
      return;
    }
    if (!targetDate) {
      setFormError('Target completion date is required');
      return;
    }

    if (editingGoal) {
      updateSavingsGoal({
        ...editingGoal,
        name: name.trim(),
        targetAmount: target,
        currentSaved: initialSaved,
        targetDate,
        icon,
        color,
        notes: notes.trim(),
      });
    } else {
      addSavingsGoal({
        name: name.trim(),
        targetAmount: target,
        currentSaved: initialSaved,
        targetDate,
        icon,
        color,
        notes: notes.trim(),
      });
    }

    setIsGoalModalOpen(false);
  };

  const openDepositModal = (goalId: string) => {
    setDepositGoalId(goalId);
    setDepositAmount('');
    setDepositNote('');
    setDepositError('');
    setIsDepositModalOpen(true);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId) return;

    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      setDepositError('Please enter a valid amount greater than 0');
      return;
    }

    addGoalContribution(depositGoalId, amt, depositNote.trim());

    // Celebrate with confetti!
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#10b981', '#f59e0b'],
    });

    setIsDepositModalOpen(false);
  };

  const toggleHistory = (goalId: string) => {
    setExpandedGoalId((prev) => (prev === goalId ? null : goalId));
  };

  // Total saved across all goals
  const totalSavedAcrossGoals = savingsGoals.reduce((sum, g) => sum + g.currentSaved, 0);
  const totalTargetAcrossGoals = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Savings Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Build discipline, fund tech gear, semester trips, and course certifications
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Savings Summary Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
              Total Student Savings Reservoir
            </span>
            <div className="text-3xl font-extrabold mt-1">
              {formatCurrency(totalSavedAcrossGoals, settings.currency)}
            </div>
            <p className="text-xs text-emerald-100/90 mt-1">
              Across {savingsGoals.length} active target goals (Total Target: {formatCurrency(totalTargetAcrossGoals, settings.currency)})
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-white/20 sm:pl-6">
            <span className="text-xs text-emerald-100 block">Overall Target Progress</span>
            <span className="text-2xl font-black">
              {totalTargetAcrossGoals > 0
                ? Math.min(Math.round((totalSavedAcrossGoals / totalTargetAcrossGoals) * 100), 100)
                : 0}
              %
            </span>
          </div>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savingsGoals.map((goal) => {
          const percent = Math.min(Math.round((goal.currentSaved / goal.targetAmount) * 100), 100);
          const isCompleted = goal.currentSaved >= goal.targetAmount;
          const isExpanded = expandedGoalId === goal.id;
          const remaining = Math.max(goal.targetAmount - goal.currentSaved, 0);

          return (
            <div
              key={goal.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{
                        backgroundColor: `${goal.color || '#6366f1'}15`,
                        color: goal.color || '#6366f1',
                      }}
                    >
                      <CategoryIcon name={goal.icon || 'Laptop'} className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {goal.name}
                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Completed! 🎉
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" /> Target: {formatDate(goal.targetDate)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(goal)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSavingsGoal(goal.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Notes */}
                {goal.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                    {goal.notes}
                  </p>
                )}

                {/* Progress Bar & Amount Row */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                      {formatCurrency(goal.currentSaved, settings.currency)}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      of {formatCurrency(goal.targetAmount, settings.currency)} ({percent}%)
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
                    <span>
                      {remaining > 0
                        ? `${formatCurrency(remaining, settings.currency)} to go`
                        : 'Goal achieved!'}
                    </span>
                    <span>{goal.contributions.length} deposits</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions & Deposit Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => toggleHistory(goal.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>History</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => openDepositModal(goal.id)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors"
                >
                  <PiggyBank className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>+ Deposit Money</span>
                </button>
              </div>

              {/* Collapsible Contributions Timeline */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Deposit Timeline
                  </p>
                  {goal.contributions.length > 0 ? (
                    goal.contributions.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            +{formatCurrency(c.amount, settings.currency)}
                          </p>
                          {c.note && <p className="text-[11px] text-slate-400">{c.note}</p>}
                        </div>
                        <span className="text-[10px] text-slate-400">{formatDate(c.date)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-2 text-center">No deposits made yet.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for Creating or Editing Goal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
              </h2>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Goal Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Coding Laptop, Cloud Exam, Trip..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Amount ({settings.currency.symbol}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="50000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Already Saved ({settings.currency.symbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={currentSaved}
                    onChange={(e) => setCurrentSaved(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Deadline Date *
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Icon & Color Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Icon & Accent Color
                </label>
                <div className="flex gap-2 mb-2 max-w-full overflow-x-auto py-1">
                  {GOAL_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`p-2 rounded-xl flex-shrink-0 transition-all ${
                        icon === ic ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <CategoryIcon name={ic} className="w-4 h-4" />
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  {GOAL_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-all ${
                        color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Personal Motivation / Purpose
                </label>
                <input
                  type="text"
                  placeholder="e.g. Needed for final semester capstone project"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {formError && <p className="text-xs text-rose-500">{formError}</p>}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
                >
                  {editingGoal ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Depositing Money to Goal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Add Savings Deposit
                </h2>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deposit Amount ({settings.currency.symbol}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">
                    {settings.currency.symbol}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="500.00"
                    value={depositAmount}
                    onChange={(e) => {
                      setDepositAmount(e.target.value);
                      if (depositError) setDepositError('');
                    }}
                    autoFocus
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                {depositError && <p className="text-xs text-rose-500 mt-1">{depositError}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Source / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Saved from dining budget, Freelance gig"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/25 transition-all"
                >
                  Deposit & Celebrate 🎉
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
