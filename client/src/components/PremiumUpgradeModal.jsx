import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './PremiumUpgradeModal.module.css';

const FREE_FEATURES = [
  '9 professionally designed templates',
  'PDF & DOCX download',
  'ATS-optimised layouts',
  'Unlimited edits',
];

const PREMIUM_FEATURES = [
  'Everything in Free',
  '3 exclusive premium templates',
  'Executive, Bold Impact & Signature designs',
  'Priority support',
];

export default function PremiumUpgradeModal({ onClose, onUpgraded }) {
  const { user, refreshUser } = useAuth();
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubscribe = async () => {
    if (!user) { window.location.href = '/login'; return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/users/me/resume-plan/upgrade');
      // Store refreshed token then re-fetch user so AuthContext reflects new plan
      localStorage.setItem('token', data.token);
      await refreshUser();
      setSuccess(true);
      setTimeout(() => { onClose(); onUpgraded?.(); }, 1800);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="upgrade-title">

        {/* Close */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.crown}>👑</span>
          <h2 id="upgrade-title" className={styles.title}>Unlock Premium Templates</h2>
          <p className={styles.subtitle}>
            Get access to our exclusive premium resume designs used by top professionals.
          </p>
        </div>

        {/* Plans */}
        <div className={styles.plans}>
          {/* Free */}
          <div className={styles.plan}>
            <div className={styles.planName}>Free</div>
            <div className={styles.planPrice}><span className={styles.priceAmt}>₹0</span><span className={styles.pricePer}>/month</span></div>
            <ul className={styles.featureList}>
              {FREE_FEATURES.map((f) => (
                <li key={f} className={styles.featureItem}><span className={styles.check}>✓</span>{f}</li>
              ))}
            </ul>
            <div className={styles.currentPlanBadge}>Your current plan</div>
          </div>

          {/* Premium */}
          <div className={`${styles.plan} ${styles.planPremium}`}>
            <div className={styles.popularBadge}>Most Popular</div>
            <div className={styles.planName}>Premium</div>
            <div className={styles.planPrice}><span className={styles.priceAmt}>₹199</span><span className={styles.pricePer}>/month</span></div>
            <ul className={styles.featureList}>
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className={styles.featureItem}><span className={styles.checkPremium}>✓</span>{f}</li>
              ))}
            </ul>

            {success ? (
              <div className={styles.successMsg}>🎉 You're now Premium!</div>
            ) : (
              <button
                className={styles.subscribeBtn}
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? 'Processing…' : 'Subscribe Now'}
              </button>
            )}
            {error && <p className={styles.errorMsg}>{error}</p>}
          </div>
        </div>

        <p className={styles.note}>Cancel anytime. No hidden charges.</p>
      </div>
    </div>
  );
}
