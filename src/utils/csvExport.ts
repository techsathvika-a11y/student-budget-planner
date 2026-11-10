import { Transaction, Category } from '../types';

/**
 * Escapes a CSV cell value per RFC 4180
 */
function escapeCsvValue(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Export transactions to CSV format and initiate browser download
 */
export function exportTransactionsToCsv(
  transactions: Transaction[],
  categories: Category[],
  currencyCode: string = 'INR',
  filenamePrefix: string = 'student-budget-transactions'
): void {
  const categoryMap = new Map<string, string>();
  categories.forEach(c => categoryMap.set(c.id, c.name));

  const headers = [
    'Date',
    'Title',
    'Type',
    'Category',
    `Amount (${currencyCode})`,
    'Payment Method',
    'Notes',
  ];

  const rows = transactions.map(t => {
    const categoryName = categoryMap.get(t.categoryId) || 'Uncategorized';
    return [
      escapeCsvValue(t.date),
      escapeCsvValue(t.title),
      escapeCsvValue(t.type === 'income' ? 'Income' : 'Expense'),
      escapeCsvValue(categoryName),
      escapeCsvValue(t.amount.toFixed(2)),
      escapeCsvValue(t.paymentMethod),
      escapeCsvValue(t.notes || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const today = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}-${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export all application data as JSON for backup
 */
export function exportAppDataJson(data: unknown, filenamePrefix: string = 'student-budget-backup'): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const today = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}-${today}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
