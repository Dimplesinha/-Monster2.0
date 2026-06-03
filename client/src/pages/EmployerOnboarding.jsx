import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import styles from './EmployerOnboarding.module.css';

const COMPANY_SIZES = [
  '1–10', '11–50', '51–200', '201–500', '501–1,000',
  '1,001–5,000', '5,001–10,000', '10,000+',
];

const PLANS = [
  { value: 'standard', label: 'Standard Plan' },
  { value: 'plus',     label: 'Monster+ Plan' },
  { value: 'premium',  label: 'Premium Plan' },
];

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

export default function EmployerOnboarding() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [plan, setPlan]   = useState('standard');
  const [form, setForm]   = useState({
    firstName:   user?.name?.split(' ')[0] || '',
    lastName:    user?.name?.split(' ').slice(1).join(' ') || '',
    companyName: '',
    companySize: '',
    website:     '',
    phone:       '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.companyName || !form.companySize) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.patch('/users/me/company-profile', { ...form, plan });
      await refreshUser();
      navigate('/post-job', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>

      {/* ── Top bar ───────────────────────────────────────────── */}
      <header className={styles.topBar}>
        <Link to="/employer/pricing" className={styles.logo}>
          Monster<span className={styles.logoPlus}>+</span>
        </Link>
        <button
          type="button"
          className={styles.topBarUser}
          onClick={() => navigate('/dashboard')}
          aria-label="Go to dashboard"
          title="Dashboard"
        >
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'E')}&background=6d28d9&color=fff&size=64&bold=true`}
            alt="Your account"
            className={styles.topBarAvatar}
          />
        </button>
      </header>

      {/* ── Main ──────────────────────────────────────────────── */}
      <main className={styles.main}>

        {/* Title row */}
        <div className={styles.titleRow}>
          <h1 className={styles.pageTitle}>Getting Started</h1>
          <span className={styles.requiredNote}>* Required Item</span>
        </div>

        {/* Plan bar */}
        <div className={styles.planBar}>
          <div className={styles.planSelect}>
            <select
              className={styles.planDropdown}
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              aria-label="Select plan"
            >
              {PLANS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <span className={styles.chevron}><ChevronDownIcon /></span>
          </div>
          <div className={styles.planStat}>
            <span className={styles.planStatLabel}>Monthly Monster Credits:</span>
            <span className={styles.planStatValue}>0</span>
          </div>
          <div className={styles.planStat}>
            <span className={styles.planStatLabel}>Monthly Price:</span>
            <span className={styles.planStatValue}>$0**</span>
          </div>
        </div>

        {/* Form card */}
        <div className={styles.card}>
          <p className={styles.cardIntro}>
            Before you find the perfect fit for your job, we need a little info.
          </p>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <form onSubmit={handleSubmit} noValidate>

            {/* Your Name */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Your Name <span className={styles.req}>*</span></h2>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="eo-first">First Name</label>
                  <input
                    id="eo-first"
                    className={styles.input}
                    value={form.firstName}
                    onChange={set('firstName')}
                    required
                    placeholder="First Name"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="eo-last">Last Name</label>
                  <input
                    id="eo-last"
                    className={styles.input}
                    value={form.lastName}
                    onChange={set('lastName')}
                    required
                    placeholder="Last Name"
                  />
                </div>
              </div>
            </section>

            {/* Company Name */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Company Name <span className={styles.req}>*</span></h2>
              <div className={styles.field} style={{ maxWidth: '420px' }}>
                <label className={styles.label} htmlFor="eo-company">Company Name</label>
                <input
                  id="eo-company"
                  className={styles.input}
                  value={form.companyName}
                  onChange={set('companyName')}
                  required
                  placeholder="e.g. Acme Corp"
                />
              </div>
            </section>

            {/* Company Size */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Company Size <span className={styles.req}>*</span></h2>
              <div className={styles.field} style={{ maxWidth: '280px', position: 'relative' }}>
                <label className={styles.label} htmlFor="eo-size">Number of employees</label>
                <select
                  id="eo-size"
                  className={styles.select}
                  value={form.companySize}
                  onChange={set('companySize')}
                  required
                >
                  <option value="">Select size</option>
                  {COMPANY_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <span className={styles.selectChevron}><ChevronDownIcon /></span>
              </div>
            </section>

            {/* Website */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Company Website</h2>
              <div className={styles.field} style={{ maxWidth: '420px' }}>
                <label className={styles.label} htmlFor="eo-website">Website URL</label>
                <input
                  id="eo-website"
                  className={styles.input}
                  type="url"
                  value={form.website}
                  onChange={set('website')}
                  placeholder="https://yourcompany.com"
                />
              </div>
            </section>

            {/* Phone */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Phone Number</h2>
              <div className={styles.field} style={{ maxWidth: '280px' }}>
                <label className={styles.label} htmlFor="eo-phone">Business phone</label>
                <input
                  id="eo-phone"
                  className={styles.input}
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </section>

            {/* Submit */}
            <div className={styles.submitRow}>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Saving…' : 'Continue to Post a Job →'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
