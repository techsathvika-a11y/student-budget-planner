export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 
  | 'UPI / GPay / PhonePe' 
  | 'Cash' 
  | 'Debit/Credit Card' 
  | 'Net Banking' 
  | 'Campus Card' 
  | 'Other';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string; // Category id or name
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  savingsGoalId?: string; // If this transaction is a contribution to a savings goal
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
  isCustom?: boolean;
  description?: string;
}

export interface CategoryBudget {
  categoryId: string;
  monthlyLimit: number;
}

export interface GoalContribution {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentSaved: number;
  targetDate: string; // YYYY-MM-DD
  category?: string;
  color?: string;
  icon?: string;
  notes?: string;
  contributions: GoalContribution[];
  createdAt: string;
}

export interface UpcomingBill {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  category: string;
  isPaid: boolean;
  notes?: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
  position: 'prefix' | 'suffix';
}

export interface UserSettings {
  studentName: string;
  college: string;
  semester: string;
  currency: CurrencyConfig;
  theme: 'light' | 'dark' | 'system';
  warningThreshold: number; // e.g. 80%
  dangerThreshold: number; // e.g. 100%
  totalMonthlyBudget: number;
}

export type NavigationTab = 
  | 'dashboard' 
  | 'transactions' 
  | 'categories' 
  | 'budgets' 
  | 'goals' 
  | 'insights' 
  | 'reports' 
  | 'settings';

export interface ToastNotification {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
}
