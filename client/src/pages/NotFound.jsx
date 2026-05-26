import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <main className={styles.page}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>This page doesn't exist.</p>
      <Link to="/" className={styles.btn}>Go Home</Link>
    </main>
  );
}
