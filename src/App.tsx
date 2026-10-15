import React, { useState } from 'react';
import { BudgetProvider, useBudget } from './context/BudgetContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { TransactionModal } from './components/transactions/TransactionModal';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { TransactionsPage } from './components/transactions/TransactionsPage';
import { CategoriesPage } from './components/categories/CategoriesPage';
import { BudgetsPage } from './components/budgets/BudgetsPage';
import { SavingsGoalsPage } from './components/goals/SavingsGoalsPage';
import { InsightsPage } from './components/insights/InsightsPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { Transaction } from './types';

const MainLayout: React.FC = () => {
  const { activeTab } = useBudget();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleOpenAddTransaction = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenAddTransaction={handleOpenAddTransaction}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Sidebar Navigation */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-full overflow-hidden">
          {activeTab === 'dashboard' && (
            <DashboardPage onOpenAddTransaction={handleOpenAddTransaction} />
          )}
          {activeTab === 'transactions' && (
            <TransactionsPage
              onOpenAddTransaction={handleOpenAddTransaction}
              onEditTransaction={handleEditTransaction}
            />
          )}
          {activeTab === 'categories' && <CategoriesPage />}
          {activeTab === 'budgets' && <BudgetsPage />}
          {activeTab === 'goals' && <SavingsGoalsPage />}
          {activeTab === 'insights' && <InsightsPage />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={handleCloseTransactionModal}
        editTransaction={editingTransaction}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <BudgetProvider>
      <MainLayout />
    </BudgetProvider>
  );
}

export default App;
