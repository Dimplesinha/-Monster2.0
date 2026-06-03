import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import styles from './EmployerJobDetail.module.css';

/* ── Icons ─────────────────────────────────────────────────── */
function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

/* ── Status badge ──────────────────────────────────────────── */
const STATUS_COLORS = {
  pending:     { bg: '#fef9c3', color: '#854d0e', border: '#fde68a' },
  reviewed:    { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  shortlisted: { bg: '#f0fdf4', color: '#166534', border: '#86efac' },
  rejected:    { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span className={styles.statusBadge} style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ── Applicant card ────────────────────────────────────────── */
function ApplicantCard({ app, onStatusChange }) {
  const [status, setStatus]   = useState(app.status || 'pending');
  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);

  const name  = app.firstName && app.lastName
    ? `${app.firstName} ${app.lastName}`
    : app.applicant?.name || 'Applicant';
  const email = app.email || app.applicant?.email || '—';
  const phone = app.phone ? `${app.phoneCountryCode || ''} ${app.phone}`.trim() : null;
  const location = [app.city, app.country].filter(Boolean).join(', ') || null;
  const appliedAt = new Date(app.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/applications/${app._id}/status`, { status });
      onStatusChange(app._id, status);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  // Initials avatar
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={styles.appCard}>
      {/* Left: avatar + name */}
      <div className={styles.appLeft}>
        <div className={styles.appAvatar}>{initials}</div>
        <div className={styles.appInfo}>
          <p className={styles.appName}>{name}</p>
          <a href={`mailto:${email}`} className={styles.appEmail}>{email}</a>
          {phone    && <p className={styles.appMeta}>{phone}</p>}
          {location && <p className={styles.appMeta}>{location}</p>}
          <p className={styles.appMeta}>Applied {appliedAt}</p>
        </div>
      </div>

      {/* Right: status + cover note */}
      <div className={styles.appRight}>
        {app.coverNote && (
          <div className={styles.coverNote}>
            <p className={styles.coverNoteLabel}>Cover Note</p>
            <p className={styles.coverNoteText}>{app.coverNote}</p>
          </div>
        )}

        <div className={styles.statusRow}>
          <StatusBadge status={app.status || 'pending'} />
          <select
            className={styles.statusSelect}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Change applicant status"
          >
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ''}`}
            onClick={handleSave}
            disabled={saving || status === (app.status || 'pending')}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function EmployerJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job,          setJob]          = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobLoading,   setJobLoading]   = useState(true);
  const [appLoading,   setAppLoading]   = useState(true);
  const [error,        setError]        = useState('');

  useEffect(() => {
    // Fetch job details
    api.get(`/jobs/${id}`)
      .then(({ data }) => setJob(data.job))
      .catch(() => setError('Could not load job details.'))
      .finally(() => setJobLoading(false));

    // Fetch applicants for this job
    api.get(`/applications/job/${id}`)
      .then(({ data }) => setApplications(data.applications))
      .catch(() => {})
      .finally(() => setAppLoading(false));
  }, [id]);

  const handleStatusChange = (appId, newStatus) => {
    setApplications((prev) =>
      prev.map((a) => a._id === appId ? { ...a, status: newStatus } : a)
    );
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this job posting? This cannot be undone.')) return;
    try {
      await api.delete(`/jobs/${id}`);
      navigate('/dashboard');
    } catch {
      setError('Failed to delete job. Please try again.');
    }
  };

  const companyName = user?.companyProfile?.companyName || user?.name || 'E';

  return (
    <div className={styles.page}>

      {/* ── Header ───────────────────────────────────────────── */}
      <header className={styles.header}>
        <Link to="/dashboard" className={styles.logo}>
          Monster<span className={styles.logoPlus}>+</span>
        </Link>
        <button
          type="button"
          className={styles.headerAvatarBtn}
          onClick={() => navigate('/dashboard')}
          aria-label="Dashboard"
          title="Dashboard"
        >
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=6d28d9&color=fff&size=64&bold=true`}
            alt="Your account"
            className={styles.headerAvatar}
          />
        </button>
      </header>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className={styles.main}>

        {/* Back link */}
        <Link to="/dashboard" className={styles.backLink}>
          <ArrowLeftIcon /> Back to Dashboard
        </Link>

        {error && <p className={styles.errorBanner} role="alert">{error}</p>}

        {jobLoading ? (
          <div className={styles.skeleton} />
        ) : !job ? (
          <p className={styles.notFound}>Job not found or you don't have permission to view it.</p>
        ) : (
          <>
            {/* ── Job detail card ─────────────────────────────── */}
            <div className={styles.jobCard}>
              <div className={styles.jobCardHeader}>
                <div className={styles.jobCardTitleGroup}>
                  <h1 className={styles.jobTitle}>{job.title}</h1>
                  <p className={styles.jobCompany}>{job.company}</p>
                </div>
                <div className={styles.jobCardActions}>
                  <button
                    className={styles.deleteBtn}
                    onClick={handleDelete}
                    title="Delete job posting"
                  >
                    <TrashIcon /> Delete
                  </button>
                </div>
              </div>

              {/* Meta chips */}
              <div className={styles.metaChips}>
                {job.location && (
                  <span className={styles.chip}>
                    <MapPinIcon /> {job.location}
                  </span>
                )}
                {job.type && (
                  <span className={styles.chip}>
                    <BriefcaseIcon /> {job.type}
                  </span>
                )}
                {job.salary && (
                  <span className={styles.chip}>
                    <DollarIcon /> {job.salary}
                  </span>
                )}
                {job.remote && (
                  <span className={`${styles.chip} ${styles.chipRemote}`}>Remote</span>
                )}
              </div>

              {/* Description */}
              <div className={styles.descSection}>
                <h2 className={styles.descHeading}>Job Description</h2>
                <pre className={styles.descText}>{job.description}</pre>
              </div>
            </div>

            {/* ── Applicants section ──────────────────────────── */}
            <div className={styles.applicantsSection}>
              <div className={styles.applicantsHeader}>
                <div className={styles.applicantsTitle}>
                  <UsersIcon />
                  <h2>Applicants</h2>
                  {!appLoading && (
                    <span className={styles.applicantCount}>{applications.length}</span>
                  )}
                </div>
              </div>

              {appLoading && (
                <div className={styles.appSkeletons}>
                  {[1, 2, 3].map((i) => <div key={i} className={styles.appSkeleton} />)}
                </div>
              )}

              {!appLoading && applications.length === 0 && (
                <div className={styles.noApplicants}>
                  <UsersIcon />
                  <p>No applicants yet.</p>
                  <span>Applications will appear here once candidates apply.</span>
                </div>
              )}

              {!appLoading && applications.length > 0 && (
                <div className={styles.appList}>
                  {applications.map((app) => (
                    <ApplicantCard
                      key={app._id}
                      app={app}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
