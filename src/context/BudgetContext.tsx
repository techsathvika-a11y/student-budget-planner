import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Transaction,
  Category,
  CategoryBudget,
  SavingsGoal,
  UpcomingBill,
  UserSettings,
  NavigationTab,
  ToastNotification,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_BUDGETS,
  DEFAULT_SETTINGS,
  INITIAL_TRANSACTIONS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_UPCOMING_BILLS,
} from '../data/initialData';
import { getCurrentMonth, exportTransactionsToCSV } from '../utils/formatters';

interface CategoryBudgetStatus {
  categoryId: string;
  categoryName: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
  limit: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: 'safe' | 'warning' | 'danger';
}

interface BudgetContextType {
  // State
  transactions: Transaction[];
  categories: Category[];
  budgets: CategoryBudget[];
  savingsGoals: SavingsGoal[];
  upcomingBills: UpcomingBill[];
  settings: UserSettings;
  selectedMonth: string;
  activeTab: NavigationTab;
  toasts: ToastNotification[];

  // Derived Metrics for Selected Month
  availableBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySaved: number;
  totalMonthlyBudget: number;
  budgetUsagePercent: number;
  categoryBudgetsStatus: CategoryBudgetStatus[];
  categoryExpenseMap: Record<string, number>;

  // Methods
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (data: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  setCategoryBudget: (categoryId: string, limit: number) => void;
  setTotalMonthlyBudget: (total: number) => void;
  addSavingsGoal: (data: Omit<SavingsGoal, 'id' | 'createdAt' | 'contributions'>) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  deleteSavingsGoal: (id: string) => void;
  addGoalContribution: (goalId: string, amount: number, note?: string) => void;
  addBill: (data: Omit<UpcomingBill, 'id'>) => void;
  toggleBillPaid: (id: string) => void;
  deleteBill: (id: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  setSelectedMonth: (month: string) => void;
  setActiveTab: (tab: NavigationTab) => void;
  showToast: (title: string, message?: string, type?: ToastNotification['type']) => void;
  removeToast: (id: string) => void;
  resetToSampleData: () => void;
  clearAllData: () => void;
  exportCSV: () => void;
}

const STORAGE_KEYS = {
  TRANSACTIONS: 'sbp_transactions_v1',
  CATEGORIES: 'sbp_categories_v1',
  BUDGETS: 'sbp_budgets_v1',
  GOALS: 'sbp_goals_v1',
  BILLS: 'sbp_bills_v1',
  SETTINGS: 'sbp_settings_v1',
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load data with localStorage persistence
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      return stored ? JSON.parse(stored) : DEFAULT_BUDGETS;
    } catch {
      return DEFAULT_BUDGETS;
    }
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GOALS);
      return stored ? JSON.parse(stored) : INITIAL_SAVINGS_GOALS;
    } catch {
      return INITIAL_SAVINGS_GOALS;
    }
  });

  const [upcomingBills, setUpcomingBills] = useState<UpcomingBill[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BILLS);
      return stored ? JSON.parse(stored) : INITIAL_UPCOMING_BILLS;
    } catch {
      return INITIAL_UPCOMING_BILLS;
    }
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(() => getCurrentMonth());
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets', e);
    }
  }, [budgets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(savingsGoals));
    } catch (e) {
      console.error('Failed to save savings goals', e);
    }
  }, [savingsGoals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(upcomingBills));
    } catch (e) {
      console.error('Failed to save upcoming bills', e);
    }
  }, [upcomingBills]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }, [settings]);

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Toast helper
  const showToast = useCallback((title: string, message?: string, type: ToastNotification['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastNotification = { id, title, message, type, timestamp: Date.now() };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Total Available Balance: total recorded income minus total recorded expenses (globally)
  const availableBalance = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of transactions) {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
      }
    }
    return income - expense;
  }, [transactions]);

  // Selected Month Transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.date && tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Monthly Income and Expenses
  const monthlyIncome = useMemo(() => {
    return monthTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [monthTransactions]);

  const monthlyExpenses = useMemo(() => {
    return monthTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [monthTransactions]);

  // Amount saved this month
  const monthlySaved = useMemo(() => {
    const net = monthlyIncome - monthlyExpenses;
    return net > 0 ? net : 0;
  }, [monthlyIncome, monthlyExpenses]);

  // Total Monthly Budget
  const totalMonthlyBudget = settings.totalMonthlyBudget;

  const budgetUsagePercent = useMemo(() => {
    if (totalMonthlyBudget <= 0) return 0;
    return (monthlyExpenses / totalMonthlyBudget) * 100;
  }, [monthlyExpenses, totalMonthlyBudget]);

  // Category expense map for selected month
  const categoryExpenseMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of monthTransactions) {
      if (tx.type === 'expense') {
        map[tx.category] = (map[tx.category] || 0) + tx.amount;
      }
    }
    return map;
  }, [monthTransactions]);

  // Category Budgets Status
  const categoryBudgetsStatus = useMemo((): CategoryBudgetStatus[] => {
    const catMap = new Map<string, Category>();
    categories.forEach((c) => catMap.set(c.id, c));

    // Ensure all expense categories have a budget entry
    const expenseCategories = categories.filter((c) => c.id !== 'income');

    return expenseCategories.map((cat) => {
      const budgetEntry = budgets.find((b) => b.categoryId === cat.id);
      const limit = budgetEntry ? budgetEntry.monthlyLimit : 0;
      const spent = categoryExpenseMap[cat.id] || 0;
      const remaining = limit - spent;
      const percentUsed = limit > 0 ? (spent / limit) * 100 : spent > 0 ? 100 : 0;

      let status: 'safe' | 'warning' | 'danger' = 'safe';
      if (percentUsed >= settings.dangerThreshold) {
        status = 'danger';
      } else if (percentUsed >= settings.warningThreshold) {
        status = 'warning';
      }

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        color: cat.color,
        bgColor: cat.bgColor,
        textColor: cat.textColor,
        icon: cat.icon,
        limit,
        spent,
        remaining,
        percentUsed,
        status,
      };
    });
  }, [categories, budgets, categoryExpenseMap, settings.warningThreshold, settings.dangerThreshold]);

  // Action implementations
  const addTransaction = useCallback((data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(
      data.type === 'income' ? 'Income Added' : 'Expense Recorded',
      `"${data.title}" was successfully recorded.`,
      'success'
    );
  }, [showToast]);

  const updateTransaction = useCallback((tx: Transaction) => {
    setTransactions((prev) => prev.map((item) => (item.id === tx.id ? tx : item)));
    showToast('Transaction Updated', `"${tx.title}" has been updated.`, 'info');
  }, [showToast]);

  const deleteTransaction = useCallback((id: string) => {
    const item = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaction Deleted', item ? `"${item.title}" removed.` : 'Transaction removed.', 'info');
  }, [transactions, showToast]);

  const addCategory = useCallback((data: Omit<Category, 'id'>) => {
    const newId = `cat-${data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newCat: Category = {
      ...data,
      id: newId,
      isCustom: true,
    };
    setCategories((prev) => [...prev, newCat]);
    // Create initial 0 budget for this category
    setBudgets((prev) => [...prev, { categoryId: newId, monthlyLimit: 2000 }]);
    showToast('Category Created', `"${data.name}" added with ₹2,000 default budget.`, 'success');
  }, [showToast]);

  const updateCategory = useCallback((cat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
    showToast('Category Updated', `Category "${cat.name}" was modified.`, 'info');
  }, [showToast]);

  const deleteCategory = useCallback((id: string) => {
    const cat = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setBudgets((prev) => prev.filter((b) => b.categoryId !== id));
    showToast('Category Removed', cat ? `"${cat.name}" removed.` : 'Category removed.', 'info');
  }, [categories, showToast]);

  const setCategoryBudget = useCallback((categoryId: string, limit: number) => {
    setBudgets((prev) => {
      const exists = prev.some((b) => b.categoryId === categoryId);
      if (exists) {
        return prev.map((b) => (b.categoryId === categoryId ? { ...b, monthlyLimit: limit } : b));
      }
      return [...prev, { categoryId, monthlyLimit: limit }];
    });
    showToast('Budget Updated', 'Category limit saved successfully.', 'success');
  }, [showToast]);

  const setTotalMonthlyBudget = useCallback((total: number) => {
    setSettings((prev) => ({ ...prev, totalMonthlyBudget: total }));
    showToast('Total Budget Updated', `Monthly budget updated to ${settings.currency.symbol}${total}`, 'success');
  }, [settings.currency.symbol, showToast]);

  const addSavingsGoal = useCallback((data: Omit<SavingsGoal, 'id' | 'createdAt' | 'contributions'>) => {
    const newGoal: SavingsGoal = {
      ...data,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      contributions: data.currentSaved > 0 ? [
        {
          id: `contrib-${Date.now()}`,
          amount: data.currentSaved,
          date: new Date().toISOString().slice(0, 10),
          note: 'Initial starting savings',
        }
      ] : [],
      createdAt: new Date().toISOString(),
    };
    setSavingsGoals((prev) => [newGoal, ...prev]);
    showToast('Goal Created', `"${data.name}" target set!`, 'success');
  }, [showToast]);

  const updateSavingsGoal = useCallback((goal: SavingsGoal) => {
    setSavingsGoals((prev) => prev.map((g) => (g.id === goal.id ? goal : g)));
    showToast('Goal Updated', `"${goal.name}" was updated.`, 'info');
  }, [showToast]);

  const deleteSavingsGoal = useCallback((id: string) => {
    const goal = savingsGoals.find((g) => g.id === id);
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    showToast('Goal Removed', goal ? `"${goal.name}" was deleted.` : 'Goal removed.', 'info');
  }, [savingsGoals, showToast]);

  const addGoalContribution = useCallback((goalId: string, amount: number, note?: string) => {
    if (amount <= 0) return;

    setSavingsGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== goalId) return goal;
        const newContrib = {
          id: `contrib-${Date.now()}`,
          amount,
          date: new Date().toISOString().slice(0, 10),
          note: note || 'Savings contribution',
        };
        const updatedSaved = goal.currentSaved + amount;
        return {
          ...goal,
          currentSaved: updatedSaved,
          contributions: [newContrib, ...goal.contributions],
        };
      })
    );

    showToast('Savings Deposited!', `${settings.currency.symbol}${amount} added to goal.`, 'success');
  }, [settings.currency.symbol, showToast]);

  const addBill = useCallback((data: Omit<UpcomingBill, 'id'>) => {
    const newBill: UpcomingBill = {
      ...data,
      id: `bill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setUpcomingBills((prev) => [...prev, newBill]);
    showToast('Bill Added', `"${data.title}" scheduled for due date.`, 'success');
  }, [showToast]);

  const toggleBillPaid = useCallback((id: string) => {
    setUpcomingBills((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const newPaid = !b.isPaid;
        showToast(
          newPaid ? 'Bill Paid! 🎉' : 'Bill Marked Unpaid',
          `"${b.title}" status changed.`,
          newPaid ? 'success' : 'info'
        );
        return { ...b, isPaid: newPaid };
      })
    );
  }, [showToast]);

  const deleteBill = useCallback((id: string) => {
    setUpcomingBills((prev) => prev.filter((b) => b.id !== id));
    showToast('Bill Removed', 'Scheduled bill deleted.', 'info');
  }, [showToast]);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Settings Saved', 'Preferences updated successfully.', 'success');
  }, [showToast]);

  const resetToSampleData = useCallback(() => {
    setTransactions(INITIAL_TRANSACTIONS);
    setCategories(DEFAULT_CATEGORIES);
    setBudgets(DEFAULT_BUDGETS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setUpcomingBills(INITIAL_UPCOMING_BILLS);
    setSettings(DEFAULT_SETTINGS);
    setSelectedMonth(getCurrentMonth());
    localStorage.clear();
    showToast('Sample Data Reloaded', 'All student demo records have been restored.', 'info');
  }, [showToast]);

  const clearAllData = useCallback(() => {
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setBudgets(DEFAULT_CATEGORIES.map((c) => ({ categoryId: c.id, monthlyLimit: 0 })));
    setSavingsGoals([]);
    setUpcomingBills([]);
    showToast('Data Cleared', 'All personal transactions and goals have been wiped.', 'warning');
  }, [showToast]);

  const exportCSV = useCallback(() => {
    exportTransactionsToCSV(transactions, categories, settings.currency);
    showToast('Export Ready', 'Your transactions CSV was generated and downloaded.', 'success');
  }, [transactions, categories, settings.currency, showToast]);

  return (
    <BudgetContext.Provider
      value={{
        transactions,
        categories,
        budgets,
        savingsGoals,
        upcomingBills,
        settings,
        selectedMonth,
        activeTab,
        toasts,
        availableBalance,
        monthlyIncome,
        monthlyExpenses,
        monthlySaved,
        totalMonthlyBudget,
        budgetUsagePercent,
        categoryBudgetsStatus,
        categoryExpenseMap,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        setCategoryBudget,
        setTotalMonthlyBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        addGoalContribution,
        addBill,
        toggleBillPaid,
        deleteBill,
        updateSettings,
        setSelectedMonth,
        setActiveTab,
        showToast,
        removeToast,
        resetToSampleData,
        clearAllData,
        exportCSV,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = (): BudgetContextType => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
