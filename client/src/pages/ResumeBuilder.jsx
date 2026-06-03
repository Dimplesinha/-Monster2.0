import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './ResumeBuilder.module.css';

const STORAGE_KEY = 'rb_draft';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  skills: '',
  experience: '',
  education: '',
};

function loadDraft(userId) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(userId, data) {
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(data));
}

/* ── Field component ─────────────────────────────────────────────── */
function Field({ id, label, value, onChange, type = 'text', multiline = false, rows = 4, placeholder = '', required = false }) {
  const inputProps = {
    id,
    name: id,
    value,
    onChange: (e) => onChange(id, e.target.value),
    placeholder,
    required,
    className: styles.input,
    'aria-required': required,
  };

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.req} aria-hidden="true"> *</span>}
      </label>
      {multiline
        ? <textarea {...inputProps} rows={rows} className={styles.textarea} />
        : <input {...inputProps} type={type} />
      }
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function ResumeBuilder() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const stored   = loadDraft(user?._id) || {};
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    fullName: stored.fullName ?? user?.name ?? '',
    email:    stored.email    ?? user?.email ?? '',
    ...stored,
  });

  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    // Validate required fields
    if (!form.fullName.trim() || !form.email.trim()) {
      setError('Full name and email are required.');
      setSaving(false);
      return;
    }

    // Save to localStorage (backend integration point)
    saveDraft(user?._id, form);
    // Small artificial delay for UX feel
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    setSaving(false);
  };

  if (saved) {
    return (
      <div className={styles.pageWrapper}>
        <header className={styles.topBar}>
          <Link to="/" className={styles.logo} aria-label="Monster home">Monster</Link>
          <span className={styles.topBarTitle}>Resume Builder</span>
        </header>
        <main className={styles.main}>
          <div className={styles.card}>
            <div className={styles.successIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h1 className={styles.successHeading}>Resume Profile Saved!</h1>
            <p className={styles.successBody}>
              Your resume profile has been saved. You can now start searching for jobs.
            </p>
            <div className={styles.successBtns}>
              <button className={styles.primaryBtn} onClick={() => navigate('/jobs')}>
                Find Jobs →
              </button>
              <button className={styles.secondaryBtn} onClick={() => setSaved(false)}>
                Edit Profile
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className={styles.topBar}>
        <Link to="/" className={styles.logo} aria-label="Monster home">Monster</Link>
        <span className={styles.topBarTitle}>Resume Builder</span>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.heading}>Build Your Resume</h1>
            <p className={styles.subtext}>
              Fill in your details below. We'll save your profile so employers can find you.
            </p>
          </div>

          {error && (
            <div className={styles.errorBanner} role="alert">{error}</div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>

            <div className={styles.formGrid}>

              {/* Personal info */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Personal Information</h2>
                <div className={styles.row2}>
                  <Field id="fullName"  label="Full Name"  value={form.fullName}  onChange={handleChange} required placeholder="Jane Smith" />
                  <Field id="email"     label="Email"      value={form.email}     onChange={handleChange} type="email" required placeholder="jane@example.com" />
                </div>
                <div className={styles.row2}>
                  <Field id="phone"    label="Phone"    value={form.phone}    onChange={handleChange} type="tel" placeholder="+1 (555) 000-0000" />
                  <Field id="location" label="Location" value={form.location} onChange={handleChange} placeholder="City, State" />
                </div>
              </div>

              {/* Summary */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Professional Summary</h2>
                <Field
                  id="summary"
                  label="Summary"
                  value={form.summary}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder="A brief overview of your professional background and career goals..."
                />
              </div>

              {/* Skills */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Skills</h2>
                <Field
                  id="skills"
                  label="Skills"
                  value={form.skills}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="e.g. Project Management, Python, SQL, Communication, Leadership..."
                />
                <p className={styles.fieldHint}>Separate skills with commas or new lines.</p>
              </div>

              {/* Experience */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Work Experience</h2>
                <Field
                  id="experience"
                  label="Experience"
                  value={form.experience}
                  onChange={handleChange}
                  multiline
                  rows={6}
                  placeholder={"Job Title — Company Name (Start – End)\n• Describe your responsibilities and achievements\n• Use action verbs and quantify results where possible"}
                />
                <p className={styles.fieldHint}>Add each role on a new block. Focus on achievements.</p>
              </div>

              {/* Education */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Education</h2>
                <Field
                  id="education"
                  label="Education"
                  value={form.education}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder={"Bachelor of Science in Computer Science\nState University — 2020"}
                />
              </div>

            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={saving}
                aria-busy={saving}
              >
                {saving ? 'Saving…' : 'Save Resume Profile'}
              </button>
              <Link to="/resume-upload" className={styles.backLink}>
                ← Back to Resume Upload
              </Link>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
