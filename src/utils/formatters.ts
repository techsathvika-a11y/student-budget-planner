import { CurrencyConfig, Transaction, Category } from '../types';

export const formatCurrency = (amount: number, currency: CurrencyConfig): string => {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format numbers with Indian or International commas appropriately
  let formattedNumber: string;
  if (currency.code === 'INR') {
    formattedNumber = absAmount.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: absAmount % 1 !== 0 ? 2 : 0,
    });
  } else {
    formattedNumber = absAmount.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: absAmount % 1 !== 0 ? 2 : 0,
    });
  }

  const sign = isNegative ? '-' : '';
  if (currency.position === 'prefix') {
    return `${sign}${currency.symbol}${formattedNumber}`;
  }
  return `${sign}${formattedNumber} ${currency.symbol}`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatMonthYear = (monthStr: string): string => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-').map(Number);
  if (!year || !month) return monthStr;
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return `${year}-${month < 10 ? `0${month}` : month}`;
};

export const getPreviousMonth = (currentMonthStr: string): string => {
  const [year, month] = currentMonthStr.split('-').map(Number);
  if (month === 1) {
    return `${year - 1}-12`;
  }
  const prevMonth = month - 1;
  return `${year}-${prevMonth < 10 ? `0${prevMonth}` : prevMonth}`;
};

export const getNextMonth = (currentMonthStr: string): string => {
  const [year, month] = currentMonthStr.split('-').map(Number);
  if (month === 12) {
    return `${year + 1}-01`;
  }
  const nextMonth = month + 1;
  return `${year}-${nextMonth < 10 ? `0${nextMonth}` : nextMonth}`;
};

// Generates list of available months from transactions + current month
export const getAvailableMonthsList = (transactions: Transaction[]): string[] => {
  const current = getCurrentMonth();
  const monthSet = new Set<string>([current]);
  
  // also add previous 3 months minimum
  let temp = current;
  for (let i = 0; i < 4; i++) {
    temp = getPreviousMonth(temp);
    monthSet.add(temp);
  }

  transactions.forEach((tx) => {
    if (tx.date && tx.date.length >= 7) {
      monthSet.add(tx.date.substring(0, 7));
    }
  });

  return Array.from(monthSet).sort().reverse();
};

export const exportTransactionsToCSV = (
  transactions: Transaction[],
  categories: Category[],
  currency: CurrencyConfig
) => {
  const catMap = new Map<string, string>();
  categories.forEach((c) => catMap.set(c.id, c.name));

  const headers = ['ID', 'Date', 'Type', 'Title', 'Category', `Amount (${currency.code})`, 'Payment Method', 'Notes'];

  const rows = transactions.map((tx) => [
    `"${tx.id}"`,
    `"${tx.date}"`,
    `"${tx.type.toUpperCase()}"`,
    `"${(tx.title || '').replace(/"/g, '""')}"`,
    `"${catMap.get(tx.category) || tx.category}"`,
    tx.amount.toFixed(2),
    `"${tx.paymentMethod || 'Other'}"`,
    `"${(tx.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `student_budget_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
