import { useState, useMemo } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { SEED_TRANSACTIONS, SEED_BUDGETS, CATEGORIES } from '../../data/seed';
import styles from './Budget.module.css';

export default function Budget() {
  const [transactions] = useLocalStorage('transactions', SEED_TRANSACTIONS);
  const [budgets, setBudgets] = useLocalStorage('budgets', SEED_BUDGETS);
  const [editCategory, setEditCategory] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newAmount, setNewAmount] = useState('');
  const [error, setError] = useState('');

  const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const spentByCategory = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  }, [transactions]);

  const handleAddBudget = (e) => {
    e.preventDefault();
    const amt = parseFloat(newAmount);
    if (isNaN(amt) || amt <= 0) { setError('Amount must be a positive number.'); return; }
    if (budgets.find(b => b.category === newCategory)) { setError('Budget for this category already exists. Edit it below.'); return; }
    setBudgets(prev => [...prev, { category: newCategory, amount: amt }]);
    setNewAmount('');
    setError('');
  };

  const handleUpdate = (category) => {
    const amt = parseFloat(editAmount);
    if (isNaN(amt) || amt <= 0) return;
    setBudgets(prev => prev.map(b => b.category === category ? { ...b, amount: amt } : b));
    setEditCategory('');
    setEditAmount('');
  };

  const handleDelete = (category) => {
    setBudgets(prev => prev.filter(b => b.category !== category));
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Budget</h1>

      <div className={styles.addSection}>
        <h2 className={styles.sectionTitle}>Set New Budget</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form className={styles.addForm} onSubmit={handleAddBudget}>
          <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className={styles.input}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input
            type="number" min="1" step="0.01"
            value={newAmount} onChange={e => setNewAmount(e.target.value)}
            placeholder="Monthly budget ($)" className={styles.input}
          />
          <button type="submit" className={styles.addBtn}>Add Budget</button>
        </form>
      </div>

      <div className={styles.budgetList}>
        {budgets.length === 0 && <p className={styles.empty}>No budgets set. Add one above.</p>}
        {budgets.map(b => {
          const spent = spentByCategory[b.category] || 0;
          const pct = Math.min((spent / b.amount) * 100, 100);
          const over = spent > b.amount;
          return (
            <div key={b.category} className={`${styles.budgetCard} ${over ? styles.overBudget : ''}`}>
              <div className={styles.cardHeader}>
                <span className={styles.category}>{b.category}</span>
                {over && <span className={styles.warning}>⚠️ Over budget!</span>}
                <div className={styles.actions}>
                  <button className={styles.editBtn} onClick={() => { setEditCategory(b.category); setEditAmount(b.amount); }}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(b.category)}>Delete</button>
                </div>
              </div>

              {editCategory === b.category ? (
                <div className={styles.editRow}>
                  <input type="number" min="1" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} className={styles.input} />
                  <button className={styles.saveBtn} onClick={() => handleUpdate(b.category)}>Save</button>
                  <button className={styles.cancelBtn} onClick={() => setEditCategory('')}>Cancel</button>
                </div>
              ) : (
                <>
                  <div className={styles.amounts}>
                    <span className={over ? styles.overAmt : styles.spentAmt}>{fmt(spent)} spent</span>
                    <span className={styles.budgetAmt}>of {fmt(b.amount)}</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={`${styles.progressFill} ${over ? styles.overFill : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className={styles.remaining}>
                    {over
                      ? `${fmt(spent - b.amount)} over budget`
                      : `${fmt(b.amount - spent)} remaining`
                    }
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
