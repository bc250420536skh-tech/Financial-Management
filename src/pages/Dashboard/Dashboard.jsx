import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { SEED_TRANSACTIONS } from '../../data/seed';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [transactions] = useLocalStorage('transactions', SEED_TRANSACTIONS);

  const { totalBalance, totalIncome, totalExpenses } = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { totalBalance: totalIncome - totalExpenses, totalIncome, totalExpenses };
  }, [transactions]);

  const chartData = useMemo(() => {
    const months = {};
    transactions.forEach(t => {
      const month = t.date.slice(0, 7);
      if (!months[month]) months[month] = { month, income: 0, expenses: 0 };
      if (t.type === 'income') months[month].income += t.amount;
      else months[month].expenses += t.amount;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).map(m => ({
      ...m,
      month: new Date(m.month + '-01').toLocaleString('default', { month: 'short', year: '2-digit' })
    }));
  }, [transactions]);

  const recent = useMemo(() => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5), [transactions]);

  const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.cards}>
        <div className={`${styles.card} ${styles.balanceCard}`}>
          <p className={styles.cardLabel}>Total Balance</p>
          <p className={styles.cardValue}>{fmt(totalBalance)}</p>
        </div>
        <div className={`${styles.card} ${styles.incomeCard}`}>
          <p className={styles.cardLabel}>Total Income</p>
          <p className={styles.cardValue}>{fmt(totalIncome)}</p>
        </div>
        <div className={`${styles.card} ${styles.expenseCard}`}>
          <p className={styles.cardLabel}>Total Expenses</p>
          <p className={styles.cardValue}>{fmt(totalExpenses)}</p>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h2 className={styles.sectionTitle}>Monthly Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => fmt(v)} />
            <Legend />
            <Bar dataKey="income" fill="#22c55e" radius={[4,4,0,0]} name="Income" />
            <Bar dataKey="expenses" fill="#ef4444" radius={[4,4,0,0]} name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.recentSection}>
        <h2 className={styles.sectionTitle}>Recent Transactions</h2>
        <div className={styles.transactionList}>
          {recent.map(t => (
            <div key={t.id} className={styles.transactionRow}>
              <div className={styles.transactionInfo}>
                <span className={styles.transactionDesc}>{t.description}</span>
                <span className={styles.transactionMeta}>{t.category} · {t.date}</span>
              </div>
              <span className={t.type === 'income' ? styles.income : styles.expense}>
                {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
