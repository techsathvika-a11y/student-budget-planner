import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Transaction,
  Category,
  SavingsGoal,
  MonthlyBudget,
  UserProfile,
  PageView,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_TRANSACTIONS,
  DEFAULT_SAVINGS_GOALS,
  DEFAULT_USER_PROFILE,
} from '../data/initialData';

interface ToastInfo {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  // Navigation & View
  activePage: PageView;
  setActivePage: (page: PageView) => void;
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  
  // Quick Add Modal & Edit Modal
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;

  // Data
  transactions: Transaction[];
  categories: Category[];
  savingsGoals: SavingsGoal[];
  budgets: Record<string, MonthlyBudget>;
  userProfile: UserProfile;

  // Actions - Transactions
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Actions - Categories
  addCategory: (data: Omit<Category, 'id' | 'isDefault'>) => Category;
  editCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => { success: boolean; reason?: string; transactionCount?: number };
  reassignCategory: (fromCatId: string, toCatId: string) => void;

  // Actions - Budgets
  getCurrentBudget: (monthStr?: string) => MonthlyBudget;
  updateCategoryBudget: (month: string, categoryId: string, limit: number) => void;
  updateTotalBudget: (month: string, totalBudget: number) => void;

  // Actions - Savings Goals
  addSavingsGoal: (data: Omit<SavingsGoal, 'id' | 'currentSavedAmount' | 'createdAt'>, initialAmount?: number) => void;
  editSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  depositToGoal: (goalId: string, amount: number, notes?: string) => void;
  withdrawFromGoal: (goalId: string, amount: number, notes?: string) => void;

  // Actions - Profile & Settings
  updateProfile: (updates: Partial<UserProfile>) => void;
  toggleTheme: (theme?: 'light' | 'dark' | 'system') => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
  loadSampleData: () => void;

  // Toast notifications
  toast: ToastInfo | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const STORAGE_KEY_PREFIX = 'student_budget_planner_v1_';

const AppContext = createContext<AppContextType | undefined>(undefined);

// Generate default month string YYYY-MM
export function getInitialMonthString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Current active navigation page
  const [activePage, setActivePage] = useState<PageView>('dashboard');

  // Month navigation (e.g. "2026-10")
  const [currentMonth, setCurrentMonth] = useState<string>(getInitialMonthString);

  // Quick Add Modal state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Toast notification
  const [toast, setToast] = useState<ToastInfo | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, text, type });
    setTimeout(() => {
      setToast(curr => (curr?.id === id ? null : curr));
    }, 3500);
  };

  // Persistent User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}profile`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load profile from localStorage', e);
    }
    return DEFAULT_USER_PROFILE;
  });

  // Persistent Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}categories`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load categories from localStorage', e);
    }
    return DEFAULT_CATEGORIES;
  });

  // Persistent Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load transactions from localStorage', e);
    }
    return DEFAULT_TRANSACTIONS;
  });

  // Persistent Savings Goals
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}goals`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load goals from localStorage', e);
    }
    return DEFAULT_SAVINGS_GOALS;
  });

  // Persistent Budgets per month
  const [budgets, setBudgets] = useState<Record<string, MonthlyBudget>>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}budgets`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load budgets from localStorage', e);
    }
    // Default initial budget for current month
    const initialMap: Record<string, number> = {};
    DEFAULT_CATEGORIES.filter(c => c.type === 'expense').forEach(c => {
      if (c.budgetLimit) initialMap[c.id] = c.budgetLimit;
    });

    const initMonth = getInitialMonthString();
    return {
      [initMonth]: {
        month: initMonth,
        totalBudget: DEFAULT_USER_PROFILE.defaultMonthlyBudget,
        categoryBudgets: initialMap,
      },
    };
  });

  // Save to localStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}profile`, JSON.stringify(userProfile));
    } catch (e) {
      console.error('Error saving profile', e);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}categories`, JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}transactions`, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}goals`, JSON.stringify(savingsGoals));
    } catch (e) {
      console.error('Error saving goals', e);
    }
  }, [savingsGoals]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}budgets`, JSON.stringify(budgets));
    } catch (e) {
      console.error('Error saving budgets', e);
    }
  }, [budgets]);

  // Sync Theme with DOM
  useEffect(() => {
    const isDark =
      userProfile.theme === 'dark' ||
      (userProfile.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userProfile.theme]);

  // Handle Theme Toggle
  const toggleTheme = (chosenTheme?: 'light' | 'dark' | 'system') => {
    setUserProfile(prev => {
      const nextTheme = chosenTheme || (prev.theme === 'dark' ? 'light' : 'dark');
      return { ...prev, theme: nextTheme };
    });
  };

  // Helper to get or initialize a monthly budget
  const getCurrentBudget = (monthStr: string = currentMonth): MonthlyBudget => {
    if (budgets[monthStr]) {
      return budgets[monthStr];
    }
    // Create new budget entry populated with category defaults
    const categoryBudgets: Record<string, number> = {};
    categories.filter(c => c.type === 'expense').forEach(c => {
      if (c.budgetLimit) categoryBudgets[c.id] = c.budgetLimit;
    });

    const newBudget: MonthlyBudget = {
      month: monthStr,
      totalBudget: userProfile.defaultMonthlyBudget,
      categoryBudgets,
    };
    return newBudget;
  };

  // Transaction CRUD
  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTx, ...prev]);
    showToast(`Transaction "${newTx.title}" recorded!`, 'success');
  };

  const editTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(tx => (tx.id === id ? { ...tx, ...updates } : tx))
    );
    showToast('Transaction updated successfully!', 'success');
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    showToast('Transaction deleted', 'info');
  };

  // Category CRUD
  const addCategory = (data: Omit<Category, 'id' | 'isDefault'>): Category => {
    const newCat: Category = {
      ...data,
      id: `cat-custom-${Date.now()}`,
      isDefault: false,
    };
    setCategories(prev => [...prev, newCat]);
    
    // Also if it's an expense category with a budget limit, set it into current budget
    if (newCat.type === 'expense' && newCat.budgetLimit) {
      setBudgets(prev => {
        const curr = prev[currentMonth] || getCurrentBudget(currentMonth);
        return {
          ...prev,
          [currentMonth]: {
            ...curr,
            categoryBudgets: {
              ...curr.categoryBudgets,
              [newCat.id]: newCat.budgetLimit || 0,
            },
          },
        };
      });
    }

    showToast(`Category "${newCat.name}" created!`, 'success');
    return newCat;
  };

  const editCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
    // If budget limit was updated, sync to current budget
    if (updates.budgetLimit !== undefined) {
      setBudgets(prev => {
        const curr = prev[currentMonth] || getCurrentBudget(currentMonth);
        return {
          ...prev,
          [currentMonth]: {
            ...curr,
            categoryBudgets: {
              ...curr.categoryBudgets,
              [id]: updates.budgetLimit || 0,
            },
          },
        };
      });
    }
    showToast('Category updated successfully!', 'success');
  };

  const deleteCategory = (id: string): { success: boolean; reason?: string; transactionCount?: number } => {
    // Check if any transactions reference this category
    const count = transactions.filter(t => t.categoryId === id).length;
    if (count > 0) {
      return {
        success: false,
        transactionCount: count,
        reason: `Cannot delete: ${count} transaction(s) are assigned to this category. Please reassign them to another category first.`,
      };
    }

    setCategories(prev => prev.filter(c => c.id !== id));
    showToast('Category deleted successfully', 'info');
    return { success: true };
  };

  const reassignCategory = (fromCatId: string, toCatId: string) => {
    setTransactions(prev =>
      prev.map(t => (t.categoryId === fromCatId ? { ...t, categoryId: toCatId } : t))
    );
    showToast('Transactions reassigned to new category!', 'success');
  };

  // Budget Actions
  const updateCategoryBudget = (month: string, categoryId: string, limit: number) => {
    setBudgets(prev => {
      const curr = prev[month] || getCurrentBudget(month);
      return {
        ...prev,
        [month]: {
          ...curr,
          categoryBudgets: {
            ...curr.categoryBudgets,
            [categoryId]: Math.max(0, limit),
          },
        },
      };
    });
    showToast('Category budget updated!', 'success');
  };

  const updateTotalBudget = (month: string, totalBudget: number) => {
    setBudgets(prev => {
      const curr = prev[month] || getCurrentBudget(month);
      return {
        ...prev,
        [month]: {
          ...curr,
          totalBudget: Math.max(0, totalBudget),
        },
      };
    });
    showToast('Monthly budget limit updated!', 'success');
  };

  // Savings Goals Actions
  const addSavingsGoal = (
    data: Omit<SavingsGoal, 'id' | 'currentSavedAmount' | 'createdAt'>,
    initialAmount: number = 0
  ) => {
    const newGoal: SavingsGoal = {
      ...data,
      id: `goal-${Date.now()}`,
      currentSavedAmount: Math.max(0, initialAmount),
      createdAt: new Date().toISOString(),
    };
    setSavingsGoals(prev => [...prev, newGoal]);
    showToast(`Savings goal "${newGoal.name}" added!`, 'success');
  };

  const editSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals(prev =>
      prev.map(g => (g.id === id ? { ...g, ...updates } : g))
    );
    showToast('Savings goal updated!', 'success');
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
    showToast('Savings goal removed', 'info');
  };

  const depositToGoal = (goalId: string, amount: number) => {
    if (amount <= 0) return;
    setSavingsGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const updated = g.currentSavedAmount + amount;
          return { ...g, currentSavedAmount: updated };
        }
        return g;
      })
    );
    showToast(`Added ${userProfile.currency.symbol}${amount} to savings goal!`, 'success');
  };

  const withdrawFromGoal = (goalId: string, amount: number) => {
    if (amount <= 0) return;
    setSavingsGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const updated = Math.max(0, g.currentSavedAmount - amount);
          return { ...g, currentSavedAmount: updated };
        }
        return g;
      })
    );
    showToast(`Withdrawn ${userProfile.currency.symbol}${amount} from savings goal`, 'info');
  };

  // User Profile
  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
    showToast('Settings saved successfully!', 'success');
  };

  // Reset to Demo Data
  const resetToDemoData = () => {
    setUserProfile(DEFAULT_USER_PROFILE);
    setCategories(DEFAULT_CATEGORIES);
    setTransactions(DEFAULT_TRANSACTIONS);
    setSavingsGoals(DEFAULT_SAVINGS_GOALS);
    
    const initMonth = getInitialMonthString();
    const categoryBudgets: Record<string, number> = {};
    DEFAULT_CATEGORIES.filter(c => c.type === 'expense').forEach(c => {
      if (c.budgetLimit) categoryBudgets[c.id] = c.budgetLimit;
    });
    setBudgets({
      [initMonth]: {
        month: initMonth,
        totalBudget: DEFAULT_USER_PROFILE.defaultMonthlyBudget,
        categoryBudgets,
      },
    });

    showToast('Demo data restored successfully!', 'success');
  };

  const loadSampleData = () => {
    resetToDemoData();
  };

  // Clear All Data
  const clearAllData = () => {
    setTransactions([]);
    setSavingsGoals([]);
    setBudgets({});
    // Reset to default empty categories
    setCategories(DEFAULT_CATEGORIES.map(c => ({ ...c, budgetLimit: 0 })));
    setUserProfile(prev => ({
      ...prev,
      defaultMonthlyBudget: 0,
    }));
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}transactions`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}goals`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}budgets`);
    } catch (e) {
      console.error(e);
    }
    showToast('All transaction and budget data cleared.', 'info');
  };

  const value = useMemo(
    () => ({
      activePage,
      setActivePage,
      currentMonth,
      setCurrentMonth,
      isQuickAddOpen,
      setIsQuickAddOpen,
      editingTransaction,
      setEditingTransaction,
      transactions,
      categories,
      savingsGoals,
      budgets,
      userProfile,
      addTransaction,
      editTransaction,
      deleteTransaction,
      addCategory,
      editCategory,
      deleteCategory,
      reassignCategory,
      getCurrentBudget,
      updateCategoryBudget,
      updateTotalBudget,
      addSavingsGoal,
      editSavingsGoal,
      deleteSavingsGoal,
      depositToGoal,
      withdrawFromGoal,
      updateProfile,
      toggleTheme,
      resetToDemoData,
      clearAllData,
      loadSampleData,
      toast,
      showToast,
    }),
    [
      activePage,
      currentMonth,
      isQuickAddOpen,
      editingTransaction,
      transactions,
      categories,
      savingsGoals,
      budgets,
      userProfile,
      toast,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
