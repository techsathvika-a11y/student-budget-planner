import React from 'react';
import { useApp, getInitialMonthString } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export const MonthSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentMonth, setCurrentMonth } = useApp();
  const defaultMonth = getInitialMonthString();

  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const currentDateObj = new Date(year, month - 1, 1);
  const monthName = currentDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    const prevDate = new Date(year, month - 2, 1);
    const newYear = prevDate.getFullYear();
    const newMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${newYear}-${newMonth}`);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(year, month, 1);
    const newYear = nextDate.getFullYear();
    const newMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${newYear}-${newMonth}`);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentMonth(e.target.value);
  };

  // Generate 12 months list around current year
  const options = [];
  const baseYear = new Date().getFullYear();
  for (let y = baseYear - 1; y <= baseYear + 1; y++) {
    for (let m = 1; m <= 12; m++) {
      const val = `${y}-${String(m).padStart(2, '0')}`;
      const d = new Date(y, m - 1, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      options.push({ value: val, label });
    }
  }

  const isCurrentMonth = currentMonth === defaultMonth;

  return (
    <div className={`inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm ${className}`}>
      <button
        onClick={handlePrevMonth}
        title="Previous Month"
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="relative flex items-center px-2 py-0.5">
        <Calendar className="w-4 h-4 text-indigo-500 mr-2 shrink-0 hidden sm:inline" />
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 min-w-[120px] text-center">
          {monthName}
        </span>
        <select
          value={currentMonth}
          onChange={handleSelectChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          aria-label="Select month"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleNextMonth}
        title="Next Month"
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {!isCurrentMonth && (
        <button
          onClick={() => setCurrentMonth(defaultMonth)}
          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 px-2 py-1 rounded-lg transition-colors ml-1"
        >
          This Month
        </button>
      )}
    </div>
  );
};
