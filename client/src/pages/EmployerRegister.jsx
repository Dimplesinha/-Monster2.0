import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './EmployerRegister.module.css';

/* ── Icons ──────────────────────────────────────────────────────── */
function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

/* ── Custom checkbox ────────────────────────────────────────────── */
function CustomCheck({ checked, onToggle, teal, label }) {
  return (
    <span
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      tabIndex={0}
      className={`${styles.checkBox} ${
        checked ? (teal ? styles.checkBoxTeal : styles.checkBoxPurple) : ''
      }`}
      onClick={onToggle}
      onKeyDown={(e) => e.key === ' ' && onToggle()}
    >
      {checked && (
        <svg viewBox="0 0 12 10" fill="none" stroke="#fff" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 5 4.5 9 11 1"/>
        </svg>
      )}
    </span>
  );
}

/* ── Sign-up form ───────────────────────────────────────────────── */
function SignUpForm({ onRegistered }) {
  const { register } = useAuth();

  const [form, setForm]             = useState({ email: '', password: '' });
  const [showPw, setShowPw]         = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(true);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms)           { setError('You must agree to the Terms of Use to continue.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      await register({ email: form.email, password: form.password, role: 'employer', agreeMarketing });
      sessionStorage.setItem('pendingEmail', form.email);
      sessionStorage.setItem('pendingRole', 'employer');
      onRegistered();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className={styles.heading}>Create an employer account</h1>
      {error && <p className={styles.error} role="alert">{error}</p>}

      <form className={styles.formGrid} onSubmit={handleSubmit} noValidate>

        {/* Left: inputs */}
        <div className={styles.fieldsCol}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="er-email">Email Address</label>
            <input
              id="er-email"
              className={styles.input}
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="er-password">Password</label>
            <div className={styles.pwWrap}>
              <input
                id="er-password"
                className={styles.input}
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="Choose a password"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button type="button" className={styles.eyeBtn}
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* Right: password requirements */}
        <aside className={styles.requirementsCol} aria-label="Password requirements">
          <p className={styles.reqTitle}>Password requirements:</p>
          <ul className={styles.reqList}>
            <li>Password should be at least 8 characters</li>
          </ul>
          <p className={styles.reqTitle} style={{ marginTop: '0.75rem' }}>
            Must contain at least 3 of the following 4 types of characters:
          </p>
          <ul className={styles.reqList}>
            <li>Lower case letters (a - z)</li>
            <li>Upper case letters (A - Z)</li>
            <li>Numbers (i.e. 0 - 9)</li>
            <li>Special characters, i.e. !@#$%^&amp;*()</li>
          </ul>
        </aside>

        {/* Checkboxes */}
        <div className={styles.checkboxGroup}>
          <label className={styles.checkLabel}>
            <CustomCheck
              checked={agreeTerms}
              onToggle={() => setAgreeTerms((v) => !v)}
              teal={false}
              label="Agree to Terms of Use"
            />
            <span>
              You agree to Monster&apos;s{' '}
              <a href="#" className={styles.checkLink}>Terms of Use</a>{' '}
              and use of{' '}
              <a href="#" className={styles.checkLink}>Privacy Policy</a>.
            </span>
          </label>

          <label className={styles.checkLabel}>
            <CustomCheck
              checked={agreeMarketing}
              onToggle={() => setAgreeMarketing((v) => !v)}
              teal={true}
              label="Opt in to marketing emails"
            />
            <span>
              Please send me relevant news, personalized offers, and tips on how to get the most out of my job postings.
            </span>
          </label>
        </div>

        <div className={styles.submitRow}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating account…' : 'SUBMIT'}
          </button>
        </div>
      </form>
    </>
  );
}

/* ── Log-in form (stays on the employer Monster+ page) ─────────── */
function LoginForm() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);

      if (!user) { setError('Login failed. Please try again.'); return; }

      // Not an employer account
      if (user.role !== 'employer' && user.role !== 'admin') {
        setError('This portal is for employer accounts. Please use the candidate login instead.');
        return;
      }

      // Email not verified
      if (!user.emailVerified) {
        sessionStorage.setItem('pendingEmail', form.email);
        sessionStorage.setItem('pendingRole', 'employer');
        navigate('/confirm-email');
        return;
      }

      // Employer onboarding incomplete → Getting Started
      if (!user.employerOnboardingComplete) {
        navigate('/employer/onboarding');
        return;
      }

      // All good → dashboard
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === 'Please verify your email before logging in.') {
        sessionStorage.setItem('pendingEmail', form.email);
        sessionStorage.setItem('pendingRole', 'employer');
        navigate('/confirm-email');
      } else {
        setError(msg || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className={styles.heading}>Sign in to Monster+</h1>
      <p className={styles.loginSub}>
        Access your employer dashboard, manage job postings, and find top candidates.
      </p>

      {error && <p className={styles.error} role="alert">{error}</p>}

      <form className={styles.loginForm} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="li-email">Email Address</label>
          <input
            id="li-email"
            className={styles.input}
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="li-password">Password</label>
          <div className={styles.pwWrap}>
            <input
              id="li-password"
              className={styles.input}
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              placeholder="Your password"
              required
              autoComplete="current-password"
            />
            <button type="button" className={styles.eyeBtn}
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? <EyeIcon /> : <EyeOffIcon />}
            </button>
          </div>
        </div>

        <div className={styles.loginFooter}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing in…' : 'SIGN IN'}
          </button>
          <Link to="#" className={styles.forgotLink}>Forgot password?</Link>
        </div>

        <p className={styles.loginDisclaimer}>
          This portal is exclusively for employer accounts.
        </p>
      </form>
    </>
  );
}

/* ── Page component ─────────────────────────────────────────────── */
export default function EmployerRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Allow ?tab=login to deep-link to the login tab (e.g. from employer pricing "Sign In")
  const [tab, setTab] = useState(searchParams.get('tab') === 'login' ? 'login' : 'signup');

  const switchTab = (t) => { setTab(t); };

  return (
    <div className={styles.page}>

      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className={styles.topBar}>
        <Link to="/employer/pricing" className={styles.logo} aria-label="Monster+ employer home">
          Monster<span className={styles.logoPlus}>+</span>
        </Link>
      </header>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className={styles.main}>
        <div className={styles.card}>

          {/* Tabs */}
          <div className={styles.tabs} role="tablist">
            <button
              role="tab"
              aria-selected={tab === 'signup'}
              className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`}
              onClick={() => switchTab('signup')}
            >
              Sign up
            </button>
            <button
              role="tab"
              aria-selected={tab === 'login'}
              className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
              onClick={() => switchTab('login')}
            >
              Log in
            </button>
          </div>

          {/* Tab content */}
          <div className={styles.cardBody}>
            {tab === 'signup'
              ? <SignUpForm onRegistered={() => navigate('/confirm-email')} />
              : <LoginForm />
            }
          </div>

        </div>
      </main>
    </div>
  );
}
