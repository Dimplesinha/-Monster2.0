import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [promoVisible, setPromoVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <header className={styles.root}>

      {/* ── 1. Yellow employer promo bar ────────────────────────── */}
      {promoVisible && (
        <div className={styles.promoBar} role="banner">
          <div className={styles.promoInner}>
            <span className={styles.promoText}>
              Hire candidates with flexible plans.
            </span>
            <Link to="/register?role=employer" className={styles.promoLink}>
              SIGN UP WITH MONSTER+ →
            </Link>
          </div>
          <button
            className={styles.promoClose}
            onClick={() => setPromoVisible(false)}
            aria-label="Dismiss promotion"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 2. White brand row ──────────────────────────────────── */}
      <div className={styles.brandRow}>
        <Link to="/" className={styles.wordmark} aria-label="Monster home">
          Monster
        </Link>

        <div className={styles.brandAuth}>
          {user ? (
            <>
              <span className={styles.greeting}>Hi, {user.name}</span>
              {user.role === 'employer' && (
                <Link to="/dashboard" className={styles.logInBtn}>Dashboard</Link>
              )}
              <button onClick={handleLogout} className={styles.logInBtn}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className={styles.signUpBtn}>Sign up</Link>
              <Link to="/login" className={styles.logInBtn}>Log in</Link>
            </>
          )}
        </div>
      </div>

      {/* ── 3. Light gray nav row ───────────────────────────────── */}
      <nav className={styles.navRow} aria-label="Main navigation">
        <div className={styles.navInner}>

          {/* Mobile hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="main-nav-links"
            aria-label="Toggle navigation menu"
          >
            <span className={mobileOpen ? styles.barOpen : ''} />
            <span className={mobileOpen ? styles.barOpen : ''} />
            <span className={mobileOpen ? styles.barOpen : ''} />
          </button>

          <ul
            id="main-nav-links"
            className={`${styles.navLinks} ${mobileOpen ? styles.navOpen : ''}`}
          >
            <li>
              <Link to="/jobs" onClick={() => setMobileOpen(false)}>
                Find Jobs
              </Link>
            </li>
            <li>
              <a href="#salary" onClick={() => setMobileOpen(false)}>
                Salary Tools
              </a>
            </li>
            <li>
              <a href="#advice" onClick={() => setMobileOpen(false)}>
                Career Advice
              </a>
            </li>
            <li>
              <a href="#resume-templates" onClick={() => setMobileOpen(false)}>
                Free Resume Templates
              </a>
            </li>
            <li>
              <a href="#resume-builder" onClick={() => setMobileOpen(false)}>
                Free Resume Builder
              </a>
            </li>
            {/* Mobile-only auth & post job */}
            {!user && (
              <>
                <li className={styles.mobileOnly}>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>Sign up</Link>
                </li>
                <li className={styles.mobileOnly}>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>Log in</Link>
                </li>
              </>
            )}
            <li className={styles.mobileOnly}>
              <Link to="/post-job" onClick={() => setMobileOpen(false)}>
                Employers / Post Job
              </Link>
            </li>
          </ul>

          <Link to="/post-job" className={styles.postJobLink}>
            Employers / Post Job →
          </Link>
        </div>
      </nav>
    </header>
  );
}
