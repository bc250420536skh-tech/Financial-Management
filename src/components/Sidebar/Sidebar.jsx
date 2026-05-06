import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>💰</span>
        <span className={styles.logoText}>FinanceApp</span>
      </div>
      <nav className={styles.nav}>
        <NavLink to="/" end className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          <span className={styles.icon}>📊</span> Dashboard
        </NavLink>
        <NavLink to="/transactions" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          <span className={styles.icon}>💳</span> Transactions
        </NavLink>
        <NavLink to="/budget" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          <span className={styles.icon}>🎯</span> Budget
        </NavLink>
      </nav>
    </aside>
  );
}
