import { useNavigate } from 'react-router-dom';
import styles from './OnboardingSuccess.module.css';

/* ── Star + checkmark illustration ──────────────────────────────── */
function StarCheckIllustration() {
  return (
    <svg
      className={styles.illustration}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Star body */}
      <path
        d="M100 18 L121 74 L181 74 L133 109 L151 165 L100 132 L49 165 L67 109 L19 74 L79 74 Z"
        fill="#f3e8ff"
        stroke="#6b21a8"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Dashed detail lines at bottom of star */}
      <line x1="82" y1="158" x2="92" y2="158" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3"/>
      <line x1="96" y1="162" x2="106" y2="162" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3"/>
      <line x1="110" y1="158" x2="120" y2="158" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3"/>
      {/* Purple check circle */}
      <circle cx="100" cy="95" r="32" fill="#6b21a8"/>
      {/* Checkmark */}
      <polyline
        points="84,95 96,108 118,82"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ── Search icon ─────────────────────────────────────────────────── */
function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.searchIcon}
    >
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

export default function OnboardingSuccess() {
  const navigate = useNavigate();

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.main}>
        <div className={styles.card}>

          <StarCheckIllustration />

          <div className={styles.textBlock}>
            <p className={styles.successLabel}>Success!</p>
            <h1 className={styles.heading}>Your Account Has Been Created</h1>
            <p className={styles.subtext}>Now, let&apos;s find the right job for you.</p>
          </div>

          <button
            className={styles.searchBtn}
            onClick={() => navigate('/jobs')}
          >
            <SearchIcon />
            Search Jobs
          </button>

        </div>
      </main>
    </div>
  );
}
