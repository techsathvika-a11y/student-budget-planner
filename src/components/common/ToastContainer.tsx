import React from 'react';
import { useBudget } from '../../context/BudgetContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useBudget();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let borderClass = 'border-emerald-500/30 bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200';
        let iconClass = 'text-emerald-600 dark:text-emerald-400';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          borderClass = 'border-rose-500/30 bg-rose-50/95 dark:bg-rose-950/90 text-rose-900 dark:text-rose-200';
          iconClass = 'text-rose-600 dark:text-rose-400';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-500/30 bg-amber-50/95 dark:bg-amber-950/90 text-amber-900 dark:text-amber-200';
          iconClass = 'text-amber-600 dark:text-amber-400';
        } else if (toast.type === 'info') {
          Icon = Info;
          borderClass = 'border-indigo-500/30 bg-indigo-50/95 dark:bg-indigo-950/90 text-indigo-900 dark:text-indigo-200';
          iconClass = 'text-indigo-600 dark:text-indigo-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-bottom-5 ${borderClass}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconClass}`} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">{toast.title}</p>
              {toast.message && <p className="text-xs mt-1 opacity-90 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
