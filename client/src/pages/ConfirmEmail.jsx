import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './ConfirmEmail.module.css';

export default function ConfirmEmail() {
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();

  // Email is stored by Register / EmployerRegister / Login (needsVerification path)
  const email = sessionStorage.getItem('pendingEmail') || '';

  const [code, setCode]             = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [resendMsg, setResendMsg]   = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const resendTimer = useRef(null);

  // Guard: if there's no pending email, there's nothing to confirm
  useEffect(() => {
    if (!email) navigate('/register', { replace: true });
    return () => clearTimeout(resendTimer.current);
  }, [email, navigate]);

  /* ── confirm submission ───────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await verifyEmail(email, code.trim());
      sessionStorage.removeItem('pendingEmail');
      navigate(user.role === 'employer' ? '/dashboard' : '/jobs', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'That code didn\'t work. Please check and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── resend ───────────────────────────────────────────────────── */
  const handleResend = async () => {
    setResendMsg('');
    setResendLoading(true);
    try {
      const data = await resendVerification(email);
      setResendMsg(data.message || 'A new code has been sent.');
      clearTimeout(resendTimer.current);
      resendTimer.current = setTimeout(() => setResendMsg(''), 5000);
    } catch {
      setResendMsg('Could not resend the code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  /* ── only allow digits, max 6 chars ──────────────────────────── */
  const handleCodeChange = (e) =>
    setCode(e.target.value.replace(/\D/g, '').slice(0, 6));

  return (
    <div className={styles.pageWrapper}>

      {/* ── Dark purple top bar ───────────────────────────────────── */}
      <header className={styles.topBar}>
        <Link to="/" className={styles.logo} aria-label="Monster home">
          Monster
        </Link>
        <span className={styles.topBarTitle}>Confirm Email</span>
      </header>

      {/* ── Centered card ─────────────────────────────────────────── */}
      <main className={styles.main}>
        <div className={styles.card}>

          {/* CSS envelope + check illustration */}
          <div className={styles.illustration} aria-hidden="true">
            <div className={styles.envelope}>
              {/* flap triangle via ::before */}
              <div className={styles.envelopeLetter} />
              <div className={styles.checkBadge}>✓</div>
            </div>
          </div>

          <h1 className={styles.heading}>Confirm Your Email</h1>

          {/* Purple email pill */}
          <p className={styles.emailPill}>{email}</p>

          <p className={styles.subText}>
            Enter the verification code we just emailed to you.
          </p>

          {/* "Not my email" link — clears state and returns to signup */}
          <Link
            to="/register"
            className={styles.notMyEmail}
            onClick={() => sessionStorage.removeItem('pendingEmail')}
          >
            Not my email address
          </Link>

          {error && (
            <div className={styles.errorBanner} role="alert">
              {error}
            </div>
          )}

          {/* Verification form */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.fieldGroup}>
              <label htmlFor="verify-code" className={styles.label}>
                Verification Code
              </label>
              <input
                id="verify-code"
                className={styles.codeInput}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={handleCodeChange}
                required
                maxLength={6}
                placeholder="• • • • • •"
                aria-describedby="code-hint"
              />
              <span id="code-hint" className={styles.codeHint}>
                Enter the 6-digit code from your email
              </span>
            </div>

            <button
              type="submit"
              className={styles.confirmBtn}
              disabled={loading || code.length < 6}
              aria-busy={loading}
            >
              {loading ? 'Verifying…' : 'Confirm My Email'}
            </button>
          </form>

          {/* Resend link */}
          <button
            type="button"
            className={styles.resendBtn}
            onClick={handleResend}
            disabled={resendLoading}
          >
            {resendLoading ? 'Sending…' : "Didn't receive a code?"}
          </button>

          {resendMsg && (
            <p className={styles.resendMsg} role="status" aria-live="polite">
              {resendMsg}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
