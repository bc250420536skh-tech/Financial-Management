import { useState } from 'react';
import { Sidebar, Header, type Page } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { ReportsPage } from './pages/ReportsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { TransactionModal } from './components/TransactionComponents';
import { ConfirmDialog } from './components/ConfirmDialog';
import { useFinanceData } from './hooks/useFinanceData';
import { Transaction } from './types';

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | undefined>();

  const finance = useFinanceData();

  function handleAddTransaction() {
    setEditingTransaction(undefined);
    setShowModal(true);
  }

  function handleEditTransaction(t: Transaction) {
    setEditingTransaction(t);
    setShowModal(true);
  }

  function handleSaveTransaction(data: Omit<Transaction, 'id'>) {
    if (editingTransaction) {
      finance.updateTransaction(editingTransaction.id, data);
    } else {
      finance.addTransaction(data);
    }
    setShowModal(false);
  }

  function handleDeleteTransaction(id: string) {
    setDeletingTransactionId(id);
  }

  function confirmDeleteTransaction() {
    if (deletingTransactionId) {
      finance.deleteTransaction(deletingTransactionId);
    }
    setDeletingTransactionId(undefined);
  }

  const pageTitles: Record<Page, string> = {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    budgets: 'Budgets',
    reports: 'Reports',
    categories: 'Categories',
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {activePage === 'dashboard' && (
            <div>
              <Header title={pageTitles.dashboard} onMenuClick={() => setSidebarOpen(true)} />
              <Dashboard
                transactions={finance.transactions}
                categories={finance.categories}
                budgets={finance.budgets}
                onAddTransaction={handleAddTransaction}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={handleDeleteTransaction}
              />
            </div>
          )}

          {activePage === 'transactions' && (
            <TransactionsPage
              transactions={finance.transactions}
              categories={finance.categories}
              onAdd={handleAddTransaction}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onMenuClick={() => setSidebarOpen(true)}
            />
          )}

          {activePage === 'budgets' && (
            <BudgetsPage
              categories={finance.categories}
              transactions={finance.transactions}
              budgets={finance.budgets}
              onSetBudget={finance.setBudget}
              onDeleteBudget={finance.deleteBudget}
              onMenuClick={() => setSidebarOpen(true)}
            />
          )}

          {activePage === 'reports' && (
            <ReportsPage
              transactions={finance.transactions}
              categories={finance.categories}
              onMenuClick={() => setSidebarOpen(true)}
            />
          )}

          {activePage === 'categories' && (
            <CategoriesPage
              categories={finance.categories}
              onAdd={finance.addCategory}
              onUpdate={finance.updateCategory}
              onDelete={finance.deleteCategory}
              onMenuClick={() => setSidebarOpen(true)}
            />
          )}
        </div>
      </main>

      {showModal && (
        <TransactionModal
          categories={finance.categories}
          transaction={editingTransaction}
          onSave={handleSaveTransaction}
          onClose={() => setShowModal(false)}
        />
      )}

      {deletingTransactionId && (
        <ConfirmDialog
          message="Delete this transaction?"
          onConfirm={confirmDeleteTransaction}
          onCancel={() => setDeletingTransactionId(undefined)}
        />
      )}
    </div>
  );
}
