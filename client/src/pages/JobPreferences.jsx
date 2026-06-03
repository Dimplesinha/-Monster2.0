import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './JobPreferences.module.css';

/* ── CSS/SVG location-pin illustration ──────────────────────────── */
function LocationIllustration() {
  return (
    <svg className={styles.illustration} viewBox="0 0 100 100" fill="none"
      aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* Pin body */}
      <path d="M50 10 C30 10 16 26 16 42 C16 62 50 92 50 92 C50 92 84 62 84 42 C84 26 70 10 50 10 Z"
        fill="#e9d5ff"/>
      <path d="M50 10 C30 10 16 26 16 42 C16 62 50 92 50 92 C50 92 84 62 84 42 C84 26 70 10 50 10 Z"
        stroke="#c4b5fd" strokeWidth="2"/>
      {/* Inner circle */}
      <circle cx="50" cy="40" r="14" fill="#fff"/>
      <circle cx="50" cy="40" r="14" stroke="#ddd6fe" strokeWidth="1.5"/>
      {/* Center dot */}
      <circle cx="50" cy="40" r="6" fill="#7c3aed"/>
      {/* Pulse rings */}
      <circle cx="50" cy="40" r="20" stroke="#c4b5fd" strokeWidth="1" opacity="0.5"/>
      <circle cx="50" cy="40" r="26" stroke="#ddd6fe" strokeWidth="1" opacity="0.3"/>
    </svg>
  );
}

/* ── Step bar ────────────────────────────────────────────────────── */
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

const COUNTRIES = [
  'United States', 'India', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Japan', 'China', 'Brazil', 'UAE', 'Singapore',
  'Netherlands', 'Sweden', 'Mexico', 'South Korea', 'Italy', 'Spain',
  'New Zealand', 'South Africa',
];

export default function JobPreferences() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    preferredJobTitle: '',
    country: '',
    city: '',
    remoteInterested: false,
  });
  const [saving, setSaving]   = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [error, setError]     = useState('');

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.preferredJobTitle.trim()) return setError('Preferred job title is required.');
    if (!form.country)                  return setError('Please select your country.');
    if (!form.city.trim())              return setError('City is required.');

    setSaving(true);
    try {
      await api.patch('/users/me/job-preferences', form);
      await refreshUser();
      navigate('/onboarding/success');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setError('');
    setSkipping(true);
    try {
      await api.patch('/users/me/job-preferences/skip');
      await refreshUser();
      navigate('/onboarding/success');
    } catch {
      setError('Could not skip. Please try again.');
    } finally {
      setSkipping(false);
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

          <LocationIllustration />

          <StepBar current={3} />

          <div className={styles.cardHeader}>
            <h1 className={styles.heading}>Job Search Preferences</h1>
            <p className={styles.subtext}>
              Add your preferences to receive tailored job recommendations.
            </p>
          </div>

          {error && (
            <div className={styles.errorBanner} role="alert">{error}</div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>

            {/* Preferred Job Title */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="preferredJobTitle">
                Preferred Job Title <span className={styles.req} aria-hidden="true">*</span>
              </label>
              <input
                id="preferredJobTitle"
                className={styles.input}
                type="text"
                value={form.preferredJobTitle}
                onChange={(e) => set('preferredJobTitle', e.target.value)}
                placeholder="e.g. Software Engineer, Product Manager"
                required
              />
            </div>

            {/* Country */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="prefCountry">
                Country <span className={styles.req} aria-hidden="true">*</span>
              </label>
              <select
                id="prefCountry"
                className={styles.input}
                value={form.country}
                onChange={(e) => set('country', e.target.value)}
                required
              >
                <option value="">Select country…</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="prefCity">
                City <span className={styles.req} aria-hidden="true">*</span>
              </label>
              <input
                id="prefCity"
                className={styles.input}
                type="text"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                placeholder="e.g. San Francisco"
                required
              />
            </div>

            {/* Remote checkbox */}
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={form.remoteInterested}
                onChange={(e) => set('remoteInterested', e.target.checked)}
              />
              <span className={styles.checkmark} aria-hidden="true" />
              <span className={styles.checkboxLabel}>
                I&apos;m also interested in <strong>REMOTE</strong> work.
              </span>
            </label>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={saving || skipping}
              aria-busy={saving}
            >
              {saving ? 'Saving…' : 'Set My Search Preferences'}
            </button>

            <button
              type="button"
              className={styles.skipBtn}
              onClick={handleSkip}
              disabled={saving || skipping}
              aria-busy={skipping}
            >
              {skipping ? 'Skipping…' : 'Skip For Now'}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}
