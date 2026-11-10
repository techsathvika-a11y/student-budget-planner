export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 
  | 'UPI / GPay / PhonePe'
  | 'Cash'
  | 'Debit Card'
  | 'Credit Card'
  | 'Net Banking'
  | 'Other';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault: boolean;
  budgetLimit?: number; // default monthly limit for expense categories
}

export interface MonthlyBudget {
  month: string; // YYYY-MM
  totalBudget: number;
  categoryBudgets: Record<string, number>; // categoryId -> limit
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentSavedAmount: number;
  targetDate: string; // YYYY-MM-DD
  description?: string;
  color?: string;
  icon?: string;
  createdAt: string;
}

export interface GoalTransaction {
  id: string;
  goalId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  date: string;
  notes?: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
}

export interface UserProfile {
  name: string;
  college: string;
  course: string;
  currency: CurrencyConfig;
  defaultMonthlyBudget: number;
  theme: 'light' | 'dark' | 'system';
  warningThreshold: number; // e.g., 80
  dangerThreshold: number;  // e.g., 100
  infoThreshold: number;    // e.g., 50
  budgetStartDay: number;   // e.g., 1
}

export type PageView = 
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'categories'
  | 'goals'
  | 'insights'
  | 'reports'
  | 'settings';
