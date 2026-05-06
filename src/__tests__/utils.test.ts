import { describe, it, expect } from 'vitest';
import { formatCurrency, getCurrentMonth, getMonthLabel, DEFAULT_CATEGORIES } from '../utils/storage';

describe('formatCurrency', () => {
  it('formats positive amounts', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
  it('formats negative amounts', () => {
    expect(formatCurrency(-500)).toBe('-$500.00');
  });
});

describe('getCurrentMonth', () => {
  it('returns YYYY-MM format', () => {
    expect(getCurrentMonth()).toMatch(/^\d{4}-\d{2}$/);
  });
});

describe('getMonthLabel', () => {
  it('returns a human-readable label', () => {
    expect(getMonthLabel('2025-01')).toContain('2025');
    expect(getMonthLabel('2025-01')).toContain('January');
  });
});

describe('DEFAULT_CATEGORIES', () => {
  it('has income and expense categories', () => {
    const incomeCategories = DEFAULT_CATEGORIES.filter(c => c.type === 'income');
    const expenseCategories = DEFAULT_CATEGORIES.filter(c => c.type === 'expense');
    expect(incomeCategories.length).toBeGreaterThan(0);
    expect(expenseCategories.length).toBeGreaterThan(0);
  });

  it('every category has required fields', () => {
    DEFAULT_CATEGORIES.forEach(cat => {
      expect(cat.id).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(['income', 'expense']).toContain(cat.type);
    });
  });
});
