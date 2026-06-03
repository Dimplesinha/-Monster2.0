import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import styles from './QuickApplyModal.module.css';

/* ── tiny helpers ──────────────────────────────────────────────────── */
function timeAgo(dateStr) {
  if (!dateStr) return null;
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (d === 0) return 'today';
  if (d === 1) return '1d ago';
  if (d < 30)  return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="8 17 12 21 16 17"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
    </svg>
  );
}

/* ── Component ─────────────────────────────────────────────────────── */
export default function QuickApplyModal({ job, user, onClose, onSuccess }) {
  const c = user?.contactInfo;

  const [form, setForm] = useState({
    firstName:        c?.firstName        || '',
    lastName:         c?.lastName         || '',
    pronouns:         '',
    email:            user?.email         || '',
    phoneCountryCode: c?.phoneCountryCode || '+1',
    phone:            c?.phone            || '',
    country:          c?.country          || '',
    zipCode:          c?.zipCode          || '',
    city:             c?.city             || '',
    coverNote:        '',
    allowEmployerSms: false,
    allowMonsterSms:  false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(false);
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/jobs/${job._id}/apply`, {
        firstName:        form.firstName.trim(),
        lastName:         form.lastName.trim(),
        pronouns:         form.pronouns.trim(),
        email:            form.email,
        phone:            form.phone,
        phoneCountryCode: form.phoneCountryCode,
        country:          form.country,
        zipCode:          form.zipCode,
        city:             form.city,
        coverNote:        form.coverNote.trim(),
      });
      setSuccess(true);
      setTimeout(() => { onSuccess(job._id); onClose(); }, 1800);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg === 'Already applied' ? 'You have already applied to this job.' : (msg || 'Something went wrong.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Job application form">
      <div className={styles.modal}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div className={styles.header}>
          <span className={styles.headerTitle}>
            My Application — <span className={styles.headerJob}>{job.title}</span>
          </span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close application form">
            <CloseIcon />
          </button>
        </div>

        {/* ── Success state ───────────────────────────────────── */}
        {success ? (
          <div className={styles.successBody}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className={styles.successHeading}>Application Submitted!</h2>
            <p className={styles.successSub}>Good luck with <strong>{job.company}</strong>. You&apos;ll hear back soon.</p>
          </div>
        ) : (
          <form className={styles.body} onSubmit={handleSubmit} noValidate>

            {/* My Resume */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>My Resume</h2>
              {user?.resume ? (
                <>
                  <div className={styles.resumeChip}>
                    <span className={styles.resumeName}>{user.resume.originalName}</span>
                    <span className={styles.resumeDownload}><DownloadIcon /></span>
                  </div>
                  {user.resume.uploadedAt && (
                    <p className={styles.resumeDate}>Last updated {timeAgo(user.resume.uploadedAt)}</p>
                  )}
                </>
              ) : (
                <p className={styles.noResume}>No resume on file. <a href="/resume-upload" target="_blank" rel="noreferrer">Upload one</a></p>
              )}

              <div className={styles.resumeActions}>
                <button type="button" className={styles.qualifiedBtn}>
                  <SparkleIcon /> Am I Qualified?
                </button>
                <button type="button" className={styles.customResumeBtn}>
                  Apply With Custom Resume
                </button>
              </div>
            </section>

            {/* Contact Information */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Contact Information</h2>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>First Name <span className={styles.req}>*</span></label>
                  <input className={styles.input} value={form.firstName} onChange={set('firstName')} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Last Name <span className={styles.req}>*</span></label>
                  <input className={styles.input} value={form.lastName} onChange={set('lastName')} required />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Pronouns</label>
                <input className={styles.input} value={form.pronouns} onChange={set('pronouns')} placeholder="e.g. she/her" />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email Address</label>
                <input className={`${styles.input} ${styles.inputReadonly}`} value={form.email} readOnly />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Phone Number</label>
                <div className={styles.phoneRow}>
                  <select className={styles.ccSelect} value={form.phoneCountryCode} onChange={set('phoneCountryCode')}>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+86">🇨🇳 +86</option>
                  </select>
                  <input className={styles.phoneInput} value={form.phone} onChange={set('phone')} placeholder="Phone number" type="tel" />
                </div>
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkLabel}>
                  <input type="checkbox" checked={form.allowEmployerSms} onChange={set('allowEmployerSms')} />
                  <span>Allow employers to text me with job opportunities</span>
                </label>
                <label className={styles.checkLabel}>
                  <input type="checkbox" checked={form.allowMonsterSms} onChange={set('allowMonsterSms')} />
                  <span>Allow us to text you about your latest job matches.</span>
                </label>
              </div>
            </section>

            {/* Location */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Location</h2>
              <div className={styles.field}>
                <label className={styles.label}>Country <span className={styles.req}>*</span></label>
                <input className={styles.input} value={form.country} onChange={set('country')} />
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Zip Code <span className={styles.req}>*</span></label>
                  <input className={styles.input} value={form.zipCode} onChange={set('zipCode')} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>City <span className={styles.req}>*</span></label>
                  <input className={styles.input} value={form.city} onChange={set('city')} />
                </div>
              </div>
            </section>

            {/* Cover Note */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Cover Note <span className={styles.optional}>(optional)</span></h2>
              <textarea
                className={styles.textarea}
                value={form.coverNote}
                onChange={set('coverNote')}
                rows={4}
                maxLength={2000}
                placeholder="Tell the employer why you're a great fit…"
              />
            </section>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.formFooter}>
              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
