import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import styles from './PostJob.module.css';

/* ── Step config ─────────────────────────────────────────────────── */
const STEPS = [
  { id: 'basics',      label: 'Job Basics' },
  { id: 'details',     label: 'Job Details' },
  { id: 'description', label: 'Description' },
  { id: 'review',      label: 'Review & Post' },
];

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];

const LOCATION_TYPES = [
  { value: 'On Site',    label: 'On Site' },
  { value: 'Hybrid',     label: 'Hybrid' },
  { value: 'Remote',     label: 'Remote' },
  { value: 'On The Road',label: 'On The Road' },
];

/* ── Step progress tracker ───────────────────────────────────────── */
function StepTracker({ steps, current }) {
  return (
    <nav className={styles.stepTracker} aria-label="Form progress">
      {steps.map((step, i) => {
        const done    = i < current;
        const active  = i === current;
        const upcoming = i > current;
        return (
          <div key={step.id} className={styles.stepItem}>
            {/* Connector line after each step (except last) */}
            {i < steps.length - 1 && (
              <div className={`${styles.stepLine} ${done ? styles.stepLineDone : ''}`} />
            )}
            {/* Circle */}
            <div
              className={`${styles.stepCircle}
                ${done    ? styles.stepCircleDone    : ''}
                ${active  ? styles.stepCircleActive  : ''}
                ${upcoming? styles.stepCircleUpcoming: ''}`}
              aria-current={active ? 'step' : undefined}
            >
              {done ? (
                /* Checkmark */
                <svg viewBox="0 0 12 10" fill="none" stroke="#fff" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="1 5 4.5 9 11 1"/>
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            {/* Label */}
            <span className={`${styles.stepLabel}
              ${done    ? styles.stepLabelDone    : ''}
              ${active  ? styles.stepLabelActive  : ''}
              ${upcoming? styles.stepLabelUpcoming: ''}`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}

/* ── Info tooltip icon ───────────────────────────────────────────── */
function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="#0d9488" aria-hidden="true">
      <circle cx="12" cy="12" r="12"/>
      <text x="12" y="17" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">i</text>
    </svg>
  );
}

/* ── Option button (On Site / Hybrid / Remote / On The Road) ─────── */
function LocationTypeBtn({ value, label, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`${styles.locationBtn} ${selected ? styles.locationBtnSelected : ''}`}
      onClick={() => onSelect(value)}
    >
      {selected && <span className={styles.locationCheck}>✓</span>}
      {label}
    </button>
  );
}

/* ── Review row ──────────────────────────────────────────────────── */
function ReviewRow({ label, value, onEdit }) {
  return (
    <div className={styles.reviewRow}>
      <div className={styles.reviewLabel}>{label}</div>
      <div className={styles.reviewValue}>{value || <em className={styles.reviewEmpty}>Not provided</em>}</div>
      <button type="button" className={styles.reviewEdit} onClick={onEdit}>Edit</button>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────── */
export default function PostJob() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    // Step 1: basics
    title:        '',
    locationType: 'On Site',
    // Step 2: details
    company:      user?.companyProfile?.companyName || '',
    location:     '',
    type:         'Full-time',
    salary:       '',
    remote:       false,
    // Step 3: description
    description:  '',
  });

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [field]: val }));
  };

  const next = () => { setError(''); setStep((s) => s + 1); };
  const back = () => { setError(''); setStep((s) => s - 1); };
  const goTo = (s) => { setError(''); setStep(s); };

  /* ── Step validation ────────────────────────────────────────────── */
  const validateStep = () => {
    if (step === 0) {
      if (!form.title.trim()) { setError('Job title is required.'); return false; }
    }
    if (step === 1) {
      if (!form.company.trim()) { setError('Company name is required.'); return false; }
      if (!form.location.trim()) { setError('Location is required.'); return false; }
    }
    if (step === 2) {
      if (!form.description.trim()) { setError('Job description is required.'); return false; }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) next(); };

  /* ── Submit ─────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        title:       form.title.trim(),
        company:     form.company.trim(),
        location:    form.location.trim(),
        type:        form.type,
        remote:      form.locationType === 'Remote' || form.remote,
        salary:      form.salary.trim(),
        description: form.description.trim(),
      };
      await api.post('/jobs', payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Render steps ───────────────────────────────────────────────── */
  const renderStep = () => {
    switch (step) {
      /* ── Step 0: Job Basics ───────────────────────────────────── */
      case 0:
        return (
          <div className={styles.stepCard}>
            {/* Hiring Boost banner */}
            <div className={styles.boostBanner}>
              <span className={styles.boostIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </span>
              <div>
                <p className={styles.boostTitle}>HIRING BOOST</p>
                <p className={styles.boostText}>Flexible location, either fully or partially remote, may increase applications by up to 150%</p>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="job-title">
                Industry Standard Job Title <span className={styles.req}>*</span>
                <span className={styles.infoIcon}><InfoIcon /></span>
              </label>
              <input
                id="job-title"
                className={styles.input}
                value={form.title}
                onChange={set('title')}
                placeholder="e.g. Flutter Developer"
                required
              />
            </div>

            <div className={styles.field}>
              <p className={styles.fieldLabel}>
                Where will this job primarily be performed? <span className={styles.req}>*</span>
              </p>
              <div className={styles.locationGrid}>
                {LOCATION_TYPES.map((lt) => (
                  <LocationTypeBtn
                    key={lt.value}
                    value={lt.value}
                    label={lt.label}
                    selected={form.locationType === lt.value}
                    onSelect={(v) => setForm((p) => ({ ...p, locationType: v, remote: v === 'Remote' }))}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      /* ── Step 1: Job Details ───────────────────────────────────── */
      case 1:
        return (
          <div className={styles.stepCard}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="job-company">
                Company Name <span className={styles.req}>*</span>
              </label>
              <input
                id="job-company"
                className={styles.input}
                value={form.company}
                onChange={set('company')}
                placeholder="Your company name"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="job-location">
                Job Location <span className={styles.req}>*</span>
              </label>
              <input
                id="job-location"
                className={styles.input}
                value={form.location}
                onChange={set('location')}
                placeholder="e.g. San Francisco, CA or Remote"
                required
              />
            </div>

            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="job-type">
                  Job Type <span className={styles.req}>*</span>
                </label>
                <select id="job-type" className={styles.select} value={form.type} onChange={set('type')}>
                  {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="job-salary">
                  Salary Range
                </label>
                <input
                  id="job-salary"
                  className={styles.input}
                  value={form.salary}
                  onChange={set('salary')}
                  placeholder="e.g. $80,000–$100,000/yr"
                />
              </div>
            </div>
          </div>
        );

      /* ── Step 2: Description ──────────────────────────────────── */
      case 2:
        return (
          <div className={styles.stepCard}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="job-desc">
                Job Description <span className={styles.req}>*</span>
              </label>
              <p className={styles.fieldHint}>
                Describe the role, responsibilities, and requirements. A detailed description attracts better candidates.
              </p>
              <textarea
                id="job-desc"
                className={styles.textarea}
                value={form.description}
                onChange={set('description')}
                rows={12}
                required
                placeholder={`Responsibilities:\n• Build and ship features…\n\nRequirements:\n• 3+ years of experience in…`}
              />
              <p className={styles.charCount}>{form.description.length} characters</p>
            </div>
          </div>
        );

      /* ── Step 3: Review & Post ────────────────────────────────── */
      case 3:
        return (
          <div className={styles.stepCard}>
            <p className={styles.reviewIntro}>
              Review your job posting before publishing. Click <strong>Edit</strong> on any section to make changes.
            </p>
            <div className={styles.reviewTable}>
              <ReviewRow label="Job Title"     value={form.title}       onEdit={() => goTo(0)} />
              <ReviewRow label="Location Type" value={form.locationType} onEdit={() => goTo(0)} />
              <ReviewRow label="Company"       value={form.company}     onEdit={() => goTo(1)} />
              <ReviewRow label="Location"      value={form.location}    onEdit={() => goTo(1)} />
              <ReviewRow label="Job Type"      value={form.type}        onEdit={() => goTo(1)} />
              <ReviewRow label="Salary"        value={form.salary}      onEdit={() => goTo(1)} />
            </div>

            <div className={styles.reviewDesc}>
              <p className={styles.reviewDescLabel}>Description</p>
              <p className={styles.reviewDescText}>{form.description.slice(0, 300)}{form.description.length > 300 ? '…' : ''}</p>
              <button type="button" className={styles.reviewEdit} onClick={() => goTo(2)}>Edit</button>
            </div>

            {error && <p className={styles.error} role="alert">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.page}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className={styles.header}>
        <Link to="/dashboard" className={styles.logo}>
          Monster<span className={styles.logoPlus}>+</span>
        </Link>
        <div className={styles.headerRight}>
          <button type="button" className={styles.helpBtn}>
            <svg viewBox="0 0 24 24" fill="#0d9488" aria-hidden="true" width="22" height="22">
              <circle cx="12" cy="12" r="12"/>
              <text x="12" y="17" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">?</text>
            </svg>
            Need Help?
          </button>
          <button
            type="button"
            className={styles.headerAvatarBtn}
            onClick={() => navigate('/dashboard')}
            aria-label="Go to dashboard"
            title="Dashboard"
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'E')}&background=6d28d9&color=fff&size=64&bold=true`}
              alt="Your account"
              className={styles.headerAvatar}
            />
          </button>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main className={styles.main}>

        {/* Step progress tracker */}
        <StepTracker steps={STEPS} current={step} />

        {/* Step title */}
        <div className={styles.stepHeader}>
          <h1 className={styles.stepTitle}>{STEPS[step].label}</h1>
          <span className={styles.requiredNote}>* Required Item</span>
        </div>

        {/* Error (steps 0–2) */}
        {error && step < 3 && (
          <p className={styles.error} role="alert">{error}</p>
        )}

        {/* Step content */}
        {renderStep()}

        {/* Navigation */}
        <div className={styles.navRow}>
          {step > 0 && (
            <button type="button" className={styles.backBtn} onClick={back}>
              ← Back
            </button>
          )}
          <div className={styles.navRight}>
            {step < STEPS.length - 1 ? (
              <button type="button" className={styles.nextBtn} onClick={handleNext}>
                Continue →
              </button>
            ) : (
              <button
                type="button"
                className={styles.postBtn}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Publishing…' : '🚀 Publish Job'}
              </button>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
