import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-emerald-600 text-white dark:bg-emerald-700',
    error: 'bg-rose-600 text-white dark:bg-rose-700',
    info: 'bg-indigo-600 text-white dark:bg-indigo-700',
  }[toast.type];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[toast.type];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-md">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl backdrop-blur-md ${bgStyles} transition-all duration-200`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">{toast.text}</span>
      </div>
    </div>
  );
};
