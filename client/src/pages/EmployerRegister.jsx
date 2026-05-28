import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Reuse the same panel/form styles as the job-seeker register page
import styles from './Register.module.css';

/* ── Icons ───────────────────────────────────────────────────────── */
function EyeIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59a14.88 14.88 0 01-.82-4.59c0-1.57.27-3.1.82-4.59V13.22H2.56A23.93 23.93 0 000 24c0 3.77.9 7.34 2.56 10.46l7.97-5.87z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

/* ── Employer-specific benefit copy ─────────────────────────────── */
const EMPLOYER_BENEFITS = [
  'Post jobs and reach thousands of qualified candidates',
  'Search and filter resumes to find the right match',
  'Manage all your job postings from one dashboard',
  'Access flexible hiring plans for any team size',
];

/* ── Component ───────────────────────────────────────────────────── */
export default function EmployerRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // 2-field signup — role is sent as 'employer', not selectable by user
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast]   = useState('');
  const toastTimer = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3000);
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ email: form.email, password: form.password, role: 'employer' });
      sessionStorage.setItem('pendingEmail', form.email);
      navigate('/confirm-email');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>

      {/* ── Dark purple brand header ──────────────────────────────── */}
      <header className={styles.topBar}>
        <Link to="/" className={styles.logo} aria-label="Monster home">
          Monster
        </Link>
        <nav className={styles.topBarNav} aria-label="Account navigation">
          <span className={styles.topBarText}>Already recruiting?</span>
          <Link to="/login" className={styles.topBarLogin}>
            Log In
          </Link>
        </nav>
      </header>

      {/* ── Toast ─────────────────────────────────────────────────── */}
      <div
        role="status"
        aria-live="polite"
        className={`${styles.toast} ${toast ? styles.toastVisible : ''}`}
      >
        {toast}
      </div>

      {/* ── Two-column panel ─────────────────────────────────────── */}
      <main className={styles.main}>
        <div className={styles.panel}>

          {/* LEFT column — branding + benefits */}
          <section className={styles.leftCol} aria-labelledby="employer-reg-heading">

            <div className={styles.loginPrompt}>
              <span className={styles.loginPromptText}>Have an account?</span>
              <Link to="/login" className={styles.loginPromptBtn}>
                Log In
              </Link>
            </div>

            <div>
              <h1 id="employer-reg-heading" className={styles.createHeading}>
                Create Your Employer Account
              </h1>
              <p style={{ color: '#6b7280', fontSize: '1rem', marginTop: '0.5rem', marginBottom: 0 }}>
                Start hiring candidates today.
              </p>
            </div>

            <ul className={styles.benefitsList} aria-label="Employer account benefits">
              {EMPLOYER_BENEFITS.map((b) => (
                <li key={b} className={styles.benefitItem}>{b}</li>
              ))}
            </ul>

            {/* Social sign-up placeholder */}
            <div className={styles.socialGroup} role="group" aria-label="Social sign-up options">
              <button
                type="button"
                className={styles.socialBtn}
                onClick={() => showToast('Google sign-up coming soon.')}
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
            </div>

            <p className={styles.legal}>
              By registering you agree to Monster's{' '}
              <a href="#" className={styles.legalLink}>Terms of Use</a> and{' '}
              <a href="#" className={styles.legalLink}>Privacy Policy</a>.
              Monster may send you recruiting-related communications.
              You may unsubscribe at any time.
            </p>
          </section>

          {/* Vertical divider */}
          <div className={styles.divider} aria-hidden="true">
            <span className={styles.dividerLabel}>or</span>
          </div>

          {/* RIGHT column — email sign-up form */}
          <section className={styles.rightCol} aria-label="Employer email registration form">
            <h2 className={styles.signupHeading}>Sign Up With Work Email</h2>

            {error && (
              <div className={styles.errorBanner} role="alert">
                {error}
              </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit} noValidate>

              <div className={styles.fieldGroup}>
                <label htmlFor="er-email" className={styles.label}>
                  Work Email
                </label>
                <input
                  id="er-email"
                  className={styles.input}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="er-password" className={styles.label}>
                  Password
                </label>
                <div className={styles.passwordWrap}>
                  <input
                    id="er-password"
                    className={styles.input}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={styles.createBtn}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? 'Creating account…' : 'Create Employer Account'}
              </button>

            </form>

            <p className={styles.mobileLogin}>
              Already have an account?{' '}
              <Link to="/login" className={styles.mobileLoginLink}>
                Log In
              </Link>
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
