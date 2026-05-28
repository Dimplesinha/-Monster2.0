import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

/* ── inline SVG icons ─────────────────────────────────────────── */
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

function FacebookIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 814 1000" fill="currentColor">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.3-164-39.3c-76 0-103.7 40.8-165.9 40.8s-105.5-57.8-155.5-127.4C46 411.6 4 325.1 4 242.5c0-128.2 83.7-196.5 165.9-196.5 82.6 0 139.1 52.8 185.8 52.8 44.1 0 112.6-54.8 207.2-54.8zm-170.5-108c39.3-46.4 67.5-110.8 67.5-175.2 0-8.9-.6-17.9-2.2-25.5-63.6 2.5-139.1 42.8-184.5 91.9-34.1 37.2-66.2 101.2-66.2 166.4 0 10.3 1.9 20.7 2.5 24 4 .6 10.3 1.3 16.5 1.3 57.8 0 128.8-38.1 166.4-82.9z"/>
    </svg>
  );
}

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

/* ── component ────────────────────────────────────────────────── */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      const errData = err.response?.data;
      // Backend returns needsVerification when account exists but email isn't confirmed
      if (errData?.needsVerification) {
        sessionStorage.setItem('pendingEmail', errData.email || form.email);
        navigate('/confirm-email');
        return;
      }
      setError(errData?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (provider) => {
    showToast(`${provider} login coming soon.`);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* ── Top header bar ───────────────────────────────────────── */}
      <header className={styles.topBar}>
        <Link to="/" className={styles.logo} aria-label="Monster home">
          Monster
        </Link>
        <nav className={styles.topBarNav} aria-label="Account navigation">
          <span className={styles.topBarText}>New to Monster?</span>
          <Link to="/register" className={styles.topBarSignUp}>
            Create Account
          </Link>
        </nav>
      </header>

      {/* ── Toast notification ───────────────────────────────────── */}
      <div
        role="status"
        aria-live="polite"
        className={`${styles.toast} ${toast ? styles.toastVisible : ''}`}
      >
        {toast}
      </div>

      {/* ── Main two-column panel ────────────────────────────────── */}
      <main className={styles.main}>
        <div className={styles.panel}>

          {/* LEFT column */}
          <section className={styles.leftCol} aria-labelledby="login-heading">
            {/* Sign-up prompt — also visible on mobile where top-bar nav is hidden */}
            <div className={styles.signupPrompt}>
              <p className={styles.signupPromptText}>New to Monster?</p>
              <Link to="/register" className={styles.signupPromptBtn}>
                Create a free account
              </Link>
            </div>

            <h1 id="login-heading" className={styles.loginHeading}>Please Log In</h1>

            <div className={styles.socialGroup} role="group" aria-label="Social login options">
              <button
                type="button"
                className={styles.socialBtn}
                onClick={() => handleSocial('Google')}
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
              <button
                type="button"
                className={styles.socialBtn}
                onClick={() => handleSocial('Facebook')}
              >
                <FacebookIcon />
                <span>Continue with Facebook</span>
              </button>
              <button
                type="button"
                className={styles.socialBtn}
                onClick={() => handleSocial('Apple')}
              >
                <AppleIcon />
                <span>Continue with Apple</span>
              </button>
            </div>

            <p className={styles.legal}>
              By logging in you agree to Monster's{' '}
              <a href="#" className={styles.legalLink}>Terms of Use</a> and{' '}
              <a href="#" className={styles.legalLink}>Privacy Policy</a>.
              Monster may send you communications; you may opt out at any time.
            </p>
          </section>

          {/* Divider */}
          <div className={styles.divider} aria-hidden="true">
            <span className={styles.dividerLabel}>or</span>
          </div>

          {/* RIGHT column */}
          <section className={styles.rightCol} aria-label="Email login form">
            <h2 className={styles.emailHeading}>Or Log In With Email</h2>

            {error && (
              <div className={styles.errorBanner} role="alert">
                {error}
              </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.fieldGroup}>
                <label htmlFor="login-email" className={styles.label}>
                  Email Address
                </label>
                <input
                  id="login-email"
                  className={styles.input}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.passwordLabelRow}>
                  <label htmlFor="login-password" className={styles.label}>
                    Password
                  </label>
                  <a href="#" className={styles.forgotLink}>
                    Forgot Password?
                  </a>
                </div>
                <div className={styles.passwordWrap}>
                  <input
                    id="login-password"
                    className={styles.input}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
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
                className={styles.loginBtn}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? 'Logging in…' : 'Log In'}
              </button>
            </form>

            <p className={styles.mobileSignup}>
              New to Monster?{' '}
              <Link to="/register" className={styles.mobileSignupLink}>
                Create Account
              </Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
