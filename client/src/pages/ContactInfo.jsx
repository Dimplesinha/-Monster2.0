import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './ContactInfo.module.css';

/* ── Progress indicator ──────────────────────────────────────────── */
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

/* ── CSS/SVG profile-card illustration ───────────────────────────── */
function ProfileIllustration() {
  return (
    <svg className={styles.illustration} viewBox="0 0 120 90" fill="none"
      aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* Card */}
      <rect x="10" y="15" width="100" height="65" rx="8" fill="#f3e8ff"/>
      <rect x="10" y="15" width="100" height="65" rx="8" stroke="#d8b4fe" strokeWidth="1.5"/>
      {/* Avatar circle */}
      <circle cx="35" cy="40" r="14" fill="#ddd6fe"/>
      <circle cx="35" cy="36" r="6" fill="#7c3aed" opacity="0.6"/>
      <ellipse cx="35" cy="49" rx="9" ry="5" fill="#7c3aed" opacity="0.4"/>
      {/* Text lines */}
      <rect x="56" y="32" width="38" height="5" rx="2.5" fill="#c4b5fd"/>
      <rect x="56" y="42" width="28" height="4" rx="2" fill="#ddd6fe"/>
      <rect x="56" y="51" width="34" height="4" rx="2" fill="#ddd6fe"/>
      {/* Divider */}
      <line x1="20" y1="65" x2="100" y2="65" stroke="#e9d5ff" strokeWidth="1.5"/>
      {/* Bottom dots */}
      <circle cx="35" cy="73" r="3" fill="#c4b5fd"/>
      <rect x="44" y="71" width="50" height="4" rx="2" fill="#ede9fe"/>
    </svg>
  );
}

/* ── Phone country selector (simplified) ────────────────────────── */
const COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+1',  label: '🇺🇸 +1'  },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+49', label: '🇩🇪 +49' },
  { code: '+33', label: '🇫🇷 +33' },
  { code: '+81', label: '🇯🇵 +81' },
  { code: '+86', label: '🇨🇳 +86' },
  { code: '+55', label: '🇧🇷 +55' },
  { code: '+971', label: '🇦🇪 +971' },
];

const COUNTRIES = [
  'United States', 'India', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Japan', 'China', 'Brazil', 'UAE', 'Singapore',
  'Netherlands', 'Sweden', 'Mexico', 'South Korea', 'Italy', 'Spain',
  'New Zealand', 'South Africa',
];

export default function ContactInfo() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneCountryCode: '+91',
    phone: '',
    country: '',
    zipCode: '',
    city: '',
    authorizedToWork: null, // null = not yet chosen
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      return setError('First and last name are required.');
    }
    if (!form.country) {
      return setError('Please select your country.');
    }
    if (!form.zipCode.trim() || !form.city.trim()) {
      return setError('Zip code and city are required.');
    }
    if (form.authorizedToWork === null) {
      return setError('Please indicate your work authorization status.');
    }

    setSaving(true);
    try {
      await api.patch('/users/me/contact-info', form);
      await refreshUser();
      navigate('/onboarding/visibility');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>

      {/* Top bar */}
      <header className={styles.topBar}>
        <Link to="/" className={styles.logo} aria-label="Monster home">Monster</Link>
        <span className={styles.topBarTitle}>Complete Your Profile</span>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>

          <ProfileIllustration />

          <StepBar current={1} />

          <div className={styles.cardHeader}>
            <h1 className={styles.heading}>Add Contact Information</h1>
            <p className={styles.subtext}>
              Help employers reach you. Your details are only shared based on your visibility settings.
            </p>
          </div>

          {error && (
            <div className={styles.errorBanner} role="alert">{error}</div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>

            {/* Name row */}
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="firstName">
                  First Name <span className={styles.req} aria-hidden="true">*</span>
                </label>
                <input
                  id="firstName"
                  className={styles.input}
                  type="text"
                  value={form.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                  placeholder="Jane"
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="lastName">
                  Last Name <span className={styles.req} aria-hidden="true">*</span>
                </label>
                <input
                  id="lastName"
                  className={styles.input}
                  type="text"
                  value={form.lastName}
                  onChange={(e) => set('lastName', e.target.value)}
                  placeholder="Smith"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="phone">Phone Number</label>
              <div className={styles.phoneRow}>
                <select
                  className={styles.countryCode}
                  value={form.phoneCountryCode}
                  onChange={(e) => set('phoneCountryCode', e.target.value)}
                  aria-label="Country calling code"
                >
                  {COUNTRY_CODES.map(({ code, label }) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
                <input
                  id="phone"
                  className={styles.phoneInput}
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="9876543210"
                />
              </div>
            </div>

            {/* Country */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="country">
                Country <span className={styles.req} aria-hidden="true">*</span>
              </label>
              <select
                id="country"
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

            {/* Zip / City */}
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="zipCode">
                  Zip Code <span className={styles.req} aria-hidden="true">*</span>
                </label>
                <input
                  id="zipCode"
                  className={styles.input}
                  type="text"
                  value={form.zipCode}
                  onChange={(e) => set('zipCode', e.target.value)}
                  placeholder="10001"
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="city">
                  City <span className={styles.req} aria-hidden="true">*</span>
                </label>
                <input
                  id="city"
                  className={styles.input}
                  type="text"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="New York"
                  required
                />
              </div>
            </div>

            {/* Work authorization */}
            <div className={styles.field}>
              <p className={styles.authQuestion}>
                Are you authorized to work in this country?
                <span className={styles.req} aria-hidden="true"> *</span>
              </p>
              {form.country && (
                <p className={styles.authCountryHint}>{form.country}</p>
              )}
              <div className={styles.radioGroup} role="group" aria-label="Work authorization">
                <label className={`${styles.radioCard} ${form.authorizedToWork === true ? styles.radioCardSelected : ''}`}>
                  <input
                    type="radio"
                    name="authorizedToWork"
                    className={styles.radioInput}
                    checked={form.authorizedToWork === true}
                    onChange={() => set('authorizedToWork', true)}
                  />
                  <span className={styles.radioMark} aria-hidden="true" />
                  <span className={styles.radioCardLabel}>Yes</span>
                </label>
                <label className={`${styles.radioCard} ${form.authorizedToWork === false ? styles.radioCardSelected : ''}`}>
                  <input
                    type="radio"
                    name="authorizedToWork"
                    className={styles.radioInput}
                    checked={form.authorizedToWork === false}
                    onChange={() => set('authorizedToWork', false)}
                  />
                  <span className={styles.radioMark} aria-hidden="true" />
                  <span className={styles.radioCardLabel}>No</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={saving}
              aria-busy={saving}
            >
              {saving ? 'Saving…' : 'Add My Information'}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}
