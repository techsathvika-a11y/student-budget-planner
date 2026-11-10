import { describe, it, expect } from 'vitest';
import {
  getTotalIncome,
  getTotalExpenses,
  getCumulativeNetBalance,
  getTotalMoneySaved,
  getAvailableBalance,
  getBudgetUsagePercentage,
  getSavingsGoalProgress,
  formatCurrency,
  filterTransactionsByMonth,
} from './calculations';
import { Transaction, SavingsGoal } from '../types';

describe('Financial Calculations Engine', () => {
  const dummyTransactions: Transaction[] = [
    {
      id: '1',
      title: 'Parent Allowance',
      amount: 10000,
      type: 'income',
      categoryId: 'cat-parents',
      date: '2026-10-01',
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: '2026-10-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Part-time Gig',
      amount: 3000,
      type: 'income',
      categoryId: 'cat-part-time',
      date: '2026-10-05',
      paymentMethod: 'Net Banking',
      createdAt: '2026-10-05T00:00:00Z',
    },
    {
      id: '3',
      title: 'Hostel Rent',
      amount: 3000,
      type: 'expense',
      categoryId: 'cat-accom',
      date: '2026-10-02',
      paymentMethod: 'Net Banking',
      createdAt: '2026-10-02T00:00:00Z',
    },
    {
      id: '4',
      title: 'Canteen Meals',
      amount: 1500,
      type: 'expense',
      categoryId: 'cat-food',
      date: '2026-10-04',
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: '2026-10-04T00:00:00Z',
    },
    {
      id: '5',
      title: 'Previous Month Book',
      amount: 600,
      type: 'expense',
      categoryId: 'cat-education',
      date: '2026-09-15',
      paymentMethod: 'Cash',
      createdAt: '2026-09-15T00:00:00Z',
    },
  ];

  const dummySavingsGoals: SavingsGoal[] = [
    {
      id: 'g1',
      name: 'Laptop Fund',
      targetAmount: 50000,
      currentSavedAmount: 15000,
      targetDate: '2026-12-31',
      createdAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'g2',
      name: 'Books',
      targetAmount: 2000,
      currentSavedAmount: 2500, // over 100%
      targetDate: '2026-11-15',
      createdAt: '2026-09-01T00:00:00Z',
    },
  ];

  it('calculates total income accurately', () => {
    const octTx = filterTransactionsByMonth(dummyTransactions, '2026-10');
    expect(getTotalIncome(octTx)).toBe(13000);
  });

  it('calculates total expenses accurately', () => {
    const octTx = filterTransactionsByMonth(dummyTransactions, '2026-10');
    expect(getTotalExpenses(octTx)).toBe(4500);
  });

  it('filters transactions by month accurately', () => {
    const septTx = filterTransactionsByMonth(dummyTransactions, '2026-09');
    expect(septTx.length).toBe(1);
    expect(septTx[0].title).toBe('Previous Month Book');
  });

  it('calculates cumulative net balance', () => {
    // Total Income = 13000, Total Expenses = 3000 + 1500 + 600 = 5100
    // Net = 13000 - 5100 = 7900
    expect(getCumulativeNetBalance(dummyTransactions)).toBe(7900);
  });

  it('calculates total money saved in savings goals without double counting', () => {
    // 15000 + 2500 = 17500
    expect(getTotalMoneySaved(dummySavingsGoals)).toBe(17500);
  });

  it('calculates available balance correctly (Net Balance - Total Saved)', () => {
    // Net Balance = 7900, Total Saved = 17500 => Available = 7900 - 17500 = -9600
    expect(getAvailableBalance(dummyTransactions, dummySavingsGoals)).toBe(-9600);
  });

  it('handles budget usage percentages safely and prevents division by zero', () => {
    expect(getBudgetUsagePercentage(1500, 2500)).toBe(60);
    expect(getBudgetUsagePercentage(2500, 2500)).toBe(100);
    expect(getBudgetUsagePercentage(3000, 2500)).toBe(120);
    expect(getBudgetUsagePercentage(500, 0)).toBe(0);
  });

  it('caps visual savings goal progress percentage safely at 100%', () => {
    expect(getSavingsGoalProgress(15000, 50000)).toBe(30);
    expect(getSavingsGoalProgress(2500, 2000)).toBe(100); // capped at 100
    expect(getSavingsGoalProgress(500, 0)).toBe(0);
  });

  it('formats currency with symbol nicely', () => {
    expect(formatCurrency(2500, '₹')).toContain('₹');
    expect(formatCurrency(2500, '₹')).toContain('2,500');
    expect(formatCurrency(-500, '₹')).toBe('-₹500');
  });
});
