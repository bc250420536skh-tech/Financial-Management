import Sidebar from '../Sidebar/Sidebar';
import styles from './Layout.module.css';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
