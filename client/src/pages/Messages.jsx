import { Link } from 'react-router-dom';
import styles from './Messages.module.css';

function InboxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  );
}

export default function Messages() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.iconWrap}>
            <InboxIcon />
          </div>
          <h1 className={styles.title}>Your Messages</h1>
          <p className={styles.sub}>
            You don't have any messages yet. When employers reach out, they'll appear here.
          </p>
          <Link to="/jobs" className={styles.browseBtn}>
            Browse Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
