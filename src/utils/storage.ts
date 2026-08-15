import { Category, Transaction, Budget } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Salary', type: 'income', color: '#10b981', icon: '💼' },
  { id: 'cat-2', name: 'Freelance', type: 'income', color: '#06b6d4', icon: '💻' },
  { id: 'cat-3', name: 'Investment', type: 'income', color: '#8b5cf6', icon: '📈' },
  { id: 'cat-4', name: 'Other Income', type: 'income', color: '#f59e0b', icon: '💰' },
  { id: 'cat-5', name: 'Housing', type: 'expense', color: '#ef4444', icon: '🏠' },
  { id: 'cat-6', name: 'Food', type: 'expense', color: '#f97316', icon: '🍔' },
  { id: 'cat-7', name: 'Transport', type: 'expense', color: '#eab308', icon: '🚗' },
  { id: 'cat-8', name: 'Healthcare', type: 'expense', color: '#ec4899', icon: '🏥' },
  { id: 'cat-9', name: 'Entertainment', type: 'expense', color: '#a855f7', icon: '🎮' },
  { id: 'cat-10', name: 'Shopping', type: 'expense', color: '#3b82f6', icon: '🛍️' },
  { id: 'cat-11', name: 'Education', type: 'expense', color: '#14b8a6', icon: '📚' },
  { id: 'cat-12', name: 'Utilities', type: 'expense', color: '#6366f1', icon: '⚡' },
];

const STORAGE_KEYS = {
  TRANSACTIONS: 'fm_transactions',
  CATEGORIES: 'fm_categories',
  BUDGETS: 'fm_budgets',
};

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return raw ? (JSON.parse(raw) as Transaction[]) : [];
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return raw ? (JSON.parse(raw) as Category[]) : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

export function loadBudgets(): Budget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return raw ? (JSON.parse(raw) as Budget[]) : [];
  } catch {
    return [];
  }
}

export function saveBudgets(budgets: Budget[]): void {
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthLabel(month: string): string {
  const [year, mon] = month.split('-');
  const date = new Date(Number(year), Number(mon) - 1, 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}
