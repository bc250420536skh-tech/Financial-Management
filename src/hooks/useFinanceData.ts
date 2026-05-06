import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, Category, Budget, TransactionType } from '../types';
import {
  loadTransactions, saveTransactions,
  loadCategories, saveCategories,
  loadBudgets, saveBudgets,
} from '../utils/storage';

export function useFinanceData() {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [categories, setCategories] = useState<Category[]>(loadCategories);
  const [budgets, setBudgets] = useState<Budget[]>(loadBudgets);

  // Transactions
  const addTransaction = useCallback((data: Omit<Transaction, 'id'>) => {
    const tx: Transaction = { ...data, id: uuidv4() };
    setTransactions(prev => {
      const next = [tx, ...prev];
      saveTransactions(next);
      return next;
    });
  }, []);

  const updateTransaction = useCallback((id: string, data: Partial<Omit<Transaction, 'id'>>) => {
    setTransactions(prev => {
      const next = prev.map(t => (t.id === id ? { ...t, ...data } : t));
      saveTransactions(next);
      return next;
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const next = prev.filter(t => t.id !== id);
      saveTransactions(next);
      return next;
    });
  }, []);

  // Categories
  const addCategory = useCallback((data: Omit<Category, 'id'>) => {
    const cat: Category = { ...data, id: uuidv4() };
    setCategories(prev => {
      const next = [...prev, cat];
      saveCategories(next);
      return next;
    });
  }, []);

  const updateCategory = useCallback((id: string, data: Partial<Omit<Category, 'id'>>) => {
    setCategories(prev => {
      const next = prev.map(c => (c.id === id ? { ...c, ...data } : c));
      saveCategories(next);
      return next;
    });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => {
      const next = prev.filter(c => c.id !== id);
      saveCategories(next);
      return next;
    });
  }, []);

  // Budgets
  const setBudget = useCallback((categoryId: string, month: string, amount: number) => {
    setBudgets(prev => {
      const existing = prev.find(b => b.categoryId === categoryId && b.month === month);
      let next: Budget[];
      if (existing) {
        next = prev.map(b =>
          b.categoryId === categoryId && b.month === month ? { ...b, amount } : b
        );
      } else {
        next = [...prev, { id: uuidv4(), categoryId, month, amount }];
      }
      saveBudgets(next);
      return next;
    });
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets(prev => {
      const next = prev.filter(b => b.id !== id);
      saveBudgets(next);
      return next;
    });
  }, []);

  // Helpers
  const getCategoryById = useCallback(
    (id: string) => categories.find(c => c.id === id),
    [categories]
  );

  const getTransactionsByMonth = useCallback(
    (month: string) => transactions.filter(t => t.date.startsWith(month)),
    [transactions]
  );

  const getTotalByType = useCallback(
    (txList: Transaction[], type: TransactionType) =>
      txList.filter(t => t.type === type).reduce((sum, t) => sum + t.amount, 0),
    []
  );

  return {
    transactions,
    categories,
    budgets,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    setBudget,
    deleteBudget,
    getCategoryById,
    getTransactionsByMonth,
    getTotalByType,
  };
}
