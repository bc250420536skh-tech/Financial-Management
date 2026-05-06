import { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { SEED_TRANSACTIONS, CATEGORIES } from '../../data/seed';
import styles from './Transactions.module.css';

const EMPTY_FORM = { type: 'expense', date: '', description: '', category: 'Food', amount: '' };

export default function Transactions() {
  const [transactions, setTransactions] = useLocalStorage('transactions', SEED_TRANSACTIONS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const filtered = transactions
    .filter(t => filterType === 'all' || t.type === filterType)
    .filter(t => filterCategory === 'all' || t.category === filterCategory)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.description.trim() || !form.amount) {
      setError('Please fill in all fields.');
      return;
    }
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) { setError('Amount must be a positive number.'); return; }
    setTransactions(prev => [...prev, { ...form, amount: amt, id: Date.now().toString() }]);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Transactions</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ Add Transaction'}
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>New Transaction</h2>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.formGrid}>
            <label className={styles.label}>
              Type
              <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className={styles.input}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>
            <label className={styles.label}>
              Date
              <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} className={styles.input} />
            </label>
            <label className={styles.label}>
              Description
              <input type="text" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className={styles.input} placeholder="e.g. Grocery run" />
            </label>
            <label className={styles.label}>
              Category
              <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className={styles.input}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className={styles.label}>
              Amount ($)
              <input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} className={styles.input} placeholder="0.00" />
            </label>
          </div>
          <button type="submit" className={styles.submitBtn}>Save Transaction</button>
        </form>
      )}

      <div className={styles.filters}>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className={styles.filterSelect}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={styles.filterSelect}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <span className={styles.count}>{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className={styles.empty}>No transactions found.</td></tr>
            ) : filtered.map(t => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.description}</td>
                <td><span className={styles.badge}>{t.category}</span></td>
                <td><span className={t.type === 'income' ? styles.incomeTag : styles.expenseTag}>{t.type}</span></td>
                <td className={t.type === 'income' ? styles.income : styles.expense}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </td>
                <td>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(t.id)} title="Delete">🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
