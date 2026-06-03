import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSavedJobs } from '../context/SavedJobsContext';
import styles from './Navbar.module.css';

/* ── Icons ──────────────────────────────────────────────────────── */
function HeartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function UserCircleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
      <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855"/>
    </svg>
  );
}

function LogoutBoxIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function PenIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
    </svg>
  );
}

function ClipboardListIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1" ry="1"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  );
}

function MessageSquareIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

/* ── Profile dropdown ───────────────────────────────────────────── */
function ProfileDropdown({ user, onClose, onLogout, navigate }) {
  const name     = user?.name     || 'User';
  const email    = user?.email    || '';
  const initials = name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const go = (path) => { navigate(path); onClose(); };

  return (
    <div className={styles.dropdown} role="menu" aria-label="Profile menu">
      {/* User header */}
      <div className={styles.dropdownHeader}>
        <div className={styles.dropdownAvatar}>{initials}</div>
        <div className={styles.dropdownUserInfo}>
          <p className={styles.dropdownName}>{name}</p>
          <p className={styles.dropdownEmail}>{email}</p>
        </div>
      </div>

      <div className={styles.dropdownDivider} />

      {/* Menu items */}
      <button className={styles.dropdownItem} onClick={() => go('/profile')} role="menuitem">
        <ProfileIcon />
        <span>My Profile</span>
      </button>

      <button className={styles.dropdownItem} onClick={() => go('/my-applications')} role="menuitem">
        <ClipboardListIcon />
        <span>My Applications</span>
      </button>

      <button className={styles.dropdownItem} onClick={() => go('/saved-jobs')} role="menuitem">
        <HeartIcon />
        <span>Saved Jobs</span>
      </button>

      <button className={styles.dropdownItem} onClick={() => go('/my-blogs')} role="menuitem">
        <PenIcon />
        <span>My Blogs</span>
      </button>

      <button className={styles.dropdownItem} onClick={() => go('/messages')} role="menuitem">
        <MessageSquareIcon />
        <span>Messages</span>
      </button>

      <div className={styles.dropdownDivider} />

      <button
        className={`${styles.dropdownItem} ${styles.dropdownItemLogout}`}
        onClick={() => { onLogout(); onClose(); }}
        role="menuitem"
      >
        <LogoutBoxIcon />
        <span>Log out</span>
      </button>
    </div>
  );
}

/* ── Navbar ─────────────────────────────────────────────────────── */
export default function Navbar() {
  const { user, logout } = useAuth();
  const { count: savedCount } = useSavedJobs();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [promoVisible,   setPromoVisible]   = useState(() => sessionStorage.getItem('promoHidden') !== '1');
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [profileOpen,    setProfileOpen]    = useState(false);
  const profileRef = useRef(null);

  // Auto-redirect employers away from the jobseeker site
  useEffect(() => {
    if (user?.role === 'employer' || user?.role === 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };
  const handlePromoClose = () => { sessionStorage.setItem('promoHidden', '1'); setPromoVisible(false); };

  const isJobseeker = user?.role === 'jobseeker';

  // "Post a Job" link destination for guests / jobseekers
  const postJobPath = '/employer/pricing';

  return (
    <header className={styles.root}>

      {/* ── Yellow employer promo bar (guests only) ──────────────── */}
      {promoVisible && !user && (
        <div className={styles.promoBar} role="banner">
          <div className={styles.promoInner}>
            <span className={styles.promoText}>Hire candidates with flexible plans.</span>
            <Link to="/employer/pricing" className={styles.promoLink}>
              SIGN UP WITH MONSTER+ →
            </Link>
          </div>
          <button className={styles.promoClose} onClick={handlePromoClose} aria-label="Dismiss promotion">
            ✕
          </button>
        </div>
      )}

      {/* ── Brand row ───────────────────────────────────────────── */}
      <div className={styles.brandRow}>
        <Link to="/" className={styles.wordmark} aria-label="Monster home">
          Monster
        </Link>

        <div className={styles.brandAuth}>
          {isJobseeker ? (
            /* ── Jobseeker icon bar ─────────────────────────────── */
            <div className={styles.iconBar}>

              {/* Saved Jobs */}
              <button
                className={styles.iconBtn}
                onClick={() => navigate('/saved-jobs')}
                aria-label="Saved jobs"
                title="Saved Jobs"
                style={{ position: 'relative' }}
              >
                <HeartIcon />
                {savedCount > 0 && (
                  <span className={styles.navBadge} aria-label={`${savedCount} saved jobs`}>
                    {savedCount > 99 ? '99+' : savedCount}
                  </span>
                )}
              </button>

              {/* My Blogs */}
              <button
                className={styles.iconBtn}
                onClick={() => navigate('/my-blogs')}
                aria-label="My blogs"
                title="My Blogs"
              >
                <PenIcon />
              </button>

              {/* Messages */}
              <button
                className={styles.iconBtn}
                aria-label="Messages"
                title="Messages"
                onClick={() => navigate('/messages')}
              >
                <EnvelopeIcon />
              </button>

              {/* Profile — toggles dropdown */}
              <div className={styles.profileWrap} ref={profileRef}>
                <button
                  className={`${styles.iconBtn} ${profileOpen ? styles.iconBtnActive : ''}`}
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-label="My profile"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  title="My Profile"
                >
                  <UserCircleIcon />
                </button>

                {profileOpen && (
                  <ProfileDropdown
                    user={user}
                    onClose={() => setProfileOpen(false)}
                    onLogout={handleLogout}
                    navigate={navigate}
                  />
                )}
              </div>

              {/* Log out */}
              <button
                className={styles.iconBtnLogout}
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
              >
                <LogoutBoxIcon />
              </button>
            </div>
          ) : (
            /* ── Guest ─────────────────────────────────────────── */
            <>
              <Link to="/register" className={styles.signUpBtn}>Sign up</Link>
              <Link to="/login"    className={styles.logInBtn}>Log in</Link>
            </>
          )}
        </div>
      </div>

      {/* ── Nav row ─────────────────────────────────────────────── */}
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

          <ul id="main-nav-links" className={`${styles.navLinks} ${mobileOpen ? styles.navOpen : ''}`}>
            <li><Link to="/jobs">Find Jobs</Link></li>
            <li><Link to="/salary-calculator">Salary Tools</Link></li>
            <li><Link to="/career-advice">Career Advice</Link></li>
            <li><Link to="/blogs">Community Blogs</Link></li>
            <li><a href="#resume-templates">Free Resume Templates</a></li>
            <li><a href="#resume-builder">Free Resume Builder</a></li>

            {/* Mobile-only auth */}
            {!user && (
              <>
                <li className={styles.mobileOnly}><Link to="/register">Sign up</Link></li>
                <li className={styles.mobileOnly}><Link to="/login">Log in</Link></li>
              </>
            )}
            {isJobseeker && (
              <>
                <li className={styles.mobileOnly}>
                  <button className={styles.mobileProfileBtn} onClick={() => { navigate('/profile'); setMobileOpen(false); }}>
                    My Profile
                  </button>
                </li>
                <li className={styles.mobileOnly}>
                  <button className={styles.mobileProfileBtn} onClick={() => { navigate('/saved-jobs'); setMobileOpen(false); }}>
                    Saved Jobs {savedCount > 0 && `(${savedCount})`}
                  </button>
                </li>
                <li className={styles.mobileOnly}>
                  <button className={styles.mobileProfileBtn} onClick={() => { navigate('/my-blogs'); setMobileOpen(false); }}>
                    My Blogs
                  </button>
                </li>
                <li className={styles.mobileOnly}>
                  <button className={styles.mobileProfileBtn} onClick={() => { navigate('/messages'); setMobileOpen(false); }}>
                    Messages
                  </button>
                </li>
                <li className={styles.mobileOnly}>
                  <button className={styles.mobileProfileBtn} onClick={handleLogout}>
                    Log out
                  </button>
                </li>
              </>
            )}
            <li className={styles.mobileOnly}>
              <Link to={postJobPath}>Employers / Post Job</Link>
            </li>
          </ul>

          <Link to={postJobPath} className={styles.postJobLink}>
            Employers / Post Job →
          </Link>
        </div>
      </nav>
    </header>
  );
}
