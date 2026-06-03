import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './ResumeVisibility.module.css';

/* ── CSS/SVG glasses illustration ───────────────────────────────── */
function GlassesIllustration() {
  return (
    <svg className={styles.illustration} viewBox="0 0 120 70" fill="none"
      aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* Left lens */}
      <circle cx="32" cy="38" r="22" fill="#e9d5ff"/>
      <circle cx="32" cy="38" r="22" stroke="#c4b5fd" strokeWidth="2"/>
      <circle cx="32" cy="38" r="14" fill="#fff"/>
      <circle cx="32" cy="38" r="14" stroke="#ddd6fe" strokeWidth="1.5"/>
      <circle cx="28" cy="34" r="4" fill="#7c3aed" opacity="0.35"/>
      {/* Right lens */}
      <circle cx="88" cy="38" r="22" fill="#e9d5ff"/>
      <circle cx="88" cy="38" r="22" stroke="#c4b5fd" strokeWidth="2"/>
      <circle cx="88" cy="38" r="14" fill="#fff"/>
      <circle cx="88" cy="38" r="14" stroke="#ddd6fe" strokeWidth="1.5"/>
      <circle cx="84" cy="34" r="4" fill="#7c3aed" opacity="0.35"/>
      {/* Bridge */}
      <line x1="54" y1="38" x2="66" y2="38" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round"/>
      {/* Arms */}
      <line x1="10" y1="38" x2="4" y2="32" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round"/>
      <line x1="110" y1="38" x2="116" y2="32" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Step bar (same as ContactInfo) ─────────────────────────────── */
function StepBar({ current }) {
  const steps = ['Resume', 'Contact', 'Visibility', 'Preferences'];
  return (
    <div className={styles.stepBar} aria-label="Onboarding progress">
      {steps.map((label, i) => (
        <div key={label} className={styles.stepItem}>
          <div className={`${styles.stepDot} ${i < current ? styles.stepDone : ''} ${i === current ? styles.stepActive : ''}`}>
            {i < current ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <span>{i + 1}</span>
            )}
          </div>
          <span className={`${styles.stepLabel} ${i === current ? styles.stepLabelActive : ''}`}>
            {label}
          </span>
          {i < steps.length - 1 && <div className={`${styles.stepLine} ${i < current ? styles.stepLineDone : ''}`} />}
        </div>
      ))}
    </div>
  );
}

const VISIBILITY_OPTIONS = [
  {
    value: 'hide_contact',
    title: 'Hide contact details',
    description:
      'Your profile and resume are visible to employers, but your contact details are hidden. Employers can reach you through our message center or after you apply.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    ),
  },
  {
    value: 'visible',
    title: 'Visible to employers',
    description:
      'Your profile, resume, and contact information are visible. Employers can contact you directly for opportunities that match your skills.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  },
  {
    value: 'not_visible',
    title: 'Not visible to employers',
    description:
      'Your profile and resume are not visible to employers. You may still receive matched job recommendation emails from us.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
];

export default function ResumeVisibility() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [selected, setSelected] = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selected) return setError('Please select a visibility option.');

    setSaving(true);
    try {
      await api.patch('/users/me/resume-visibility', { resumeVisibility: selected });
      await refreshUser();
      navigate('/onboarding/job-preferences');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>

      <header className={styles.topBar}>
        <Link to="/" className={styles.logo} aria-label="Monster home">Monster</Link>
        <span className={styles.topBarTitle}>Complete Your Profile</span>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>

          <GlassesIllustration />

          <StepBar current={2} />

          <div className={styles.cardHeader}>
            <h1 className={styles.heading}>Let Employers Find You</h1>
            <p className={styles.subtext}>
              Choose how your profile and resume are viewed and searched by employers.
            </p>
          </div>

          {error && (
            <div className={styles.errorBanner} role="alert">{error}</div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.optionList} role="radiogroup" aria-label="Resume visibility">
              {VISIBILITY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`${styles.optionCard} ${selected === opt.value ? styles.optionCardSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    className={styles.radioInput}
                    value={opt.value}
                    checked={selected === opt.value}
                    onChange={() => setSelected(opt.value)}
                  />
                  <div className={`${styles.optionIcon} ${selected === opt.value ? styles.optionIconSelected : ''}`}>
                    {opt.icon}
                  </div>
                  <div className={styles.optionBody}>
                    <p className={styles.optionTitle}>{opt.title}</p>
                    <p className={styles.optionDesc}>{opt.description}</p>
                  </div>
                  <span className={`${styles.radioMark} ${selected === opt.value ? styles.radioMarkSelected : ''}`} aria-hidden="true" />
                </label>
              ))}
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={saving || !selected}
              aria-busy={saving}
            >
              {saving ? 'Saving…' : 'Set My Visibility'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
