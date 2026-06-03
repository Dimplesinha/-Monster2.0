import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './ConfirmEmail.module.css';

export default function ConfirmEmail() {
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();

  const email       = sessionStorage.getItem('pendingEmail') || '';
  const pendingRole = sessionStorage.getItem('pendingRole')  || 'jobseeker';

  const [code, setCode]           = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const resendTimer = useRef(null);

  useEffect(() => {
    if (!email) {
      // No pending email — send to the right registration page
      navigate(pendingRole === 'employer' ? '/employer/register' : '/register', { replace: true });
    }
    return () => clearTimeout(resendTimer.current);
  }, [email, navigate, pendingRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await verifyEmail(email, code.trim());
      sessionStorage.removeItem('pendingEmail');
      sessionStorage.removeItem('pendingRole');
      if (user.role === 'employer') {
        navigate('/employer/onboarding', { replace: true });
      } else {
        navigate('/resume-upload', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "That code didn't work. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendMsg('');
    setResendLoading(true);
    try {
      const data = await resendVerification(email);
      setResendMsg(data.message || 'A new code has been sent to your email.');
      clearTimeout(resendTimer.current);
      resendTimer.current = setTimeout(() => setResendMsg(''), 5000);
    } catch {
      setResendMsg('Could not resend the code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleCodeChange = (e) =>
    setCode(e.target.value.replace(/\D/g, '').slice(0, 6));

  return (
    <div className={styles.page}>

      {/* ── Main ──────────────────────────────────────────────── */}
      <main className={styles.main}>
        <div className={styles.card}>

          <h1 className={styles.heading}>Confirm your email</h1>

          <p className={styles.subText}>
            Please check your email account{' '}
            <strong>{email}</strong>, and follow the instructions to confirm your account.
          </p>

          {error && <p className={styles.error} role="alert">{error}</p>}

          {/* ── Code entry ────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label htmlFor="verify-code" className={styles.label}>
                Enter the 6-digit code from your email
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
              />
            </div>

            <div className={styles.btnRow}>
              <Link
                to={pendingRole === 'employer' ? '/employer/register?tab=login' : '/login'}
                className={styles.btnOutline}
                onClick={() => {
                  sessionStorage.removeItem('pendingEmail');
                  sessionStorage.removeItem('pendingRole');
                }}
              >
                BACK TO LOGIN
              </Link>

              <button
                type="submit"
                className={styles.btnFilled}
                disabled={loading || code.length < 6}
              >
                {loading ? 'Verifying…' : 'CONFIRM EMAIL'}
              </button>
            </div>
          </form>

          {/* Resend */}
          <button
            type="button"
            className={styles.resendBtn}
            onClick={handleResend}
            disabled={resendLoading}
          >
            {resendLoading ? 'Sending…' : 'RESEND EMAIL'}
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
