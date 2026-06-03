import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import styles from './Dashboard.module.css';

/* ── Icons ─────────────────────────────────────────────────── */
function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
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

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}

function PenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
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

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

/* ── Stat card ─────────────────────────────────────────────── */
function StatCard({ icon, label, value, accent }) {
  return (
    <div className={styles.statCard} style={{ '--accent': accent }}>
      <div className={styles.statIcon}>{icon}</div>
      <div>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/jobs/mine')
      .then(({ data }) => setJobs(data.jobs))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    await api.delete(`/jobs/${id}`);
    setJobs((prev) => prev.filter((j) => j._id !== id));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantCount ?? 0), 0);
  const activeJobs = jobs.length;

  // Employer initials for avatar fallback
  const companyName = user?.companyProfile?.companyName || user?.name || 'Your Company';

  return (
    <div className={styles.page}>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <Link to="/dashboard" className={styles.sidebarLogo}>
          Monster<span className={styles.logoPlus}>+</span>
        </Link>

        {/* Profile area */}
        <div className={styles.profileArea}>
          <div className={styles.avatarWrap}>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=6d28d9&color=fff&size=128&bold=true`}
              alt={`${companyName} avatar`}
              className={styles.avatar}
            />
            <div className={styles.avatarBadge} aria-hidden="true" />
          </div>
          <p className={styles.profileName}>{companyName}</p>
          <p className={styles.profileRole}>Employer Account</p>
          {user?.companyProfile?.plan && (
            <span className={styles.planBadge}>
              {user.companyProfile.plan === 'standard' ? 'Standard Plan' :
               user.companyProfile.plan === 'plus'     ? 'Monster+ Plan' : 'Premium Plan'}
            </span>
          )}
        </div>

        {/* Nav links */}
        <nav className={styles.sideNav}>
          <Link to="/dashboard" className={`${styles.navItem} ${styles.navItemActive}`}>
            <BriefcaseIcon /> My Jobs
          </Link>
          <Link to="/post-job" className={styles.navItem}>
            <PlusIcon /> Post a Job
          </Link>
          <Link to="/employer/blogs" className={styles.navItem}>
            <PenIcon /> My Blogs
          </Link>
          <Link to="/employer/pricing" className={styles.navItem}>
            <ActivityIcon /> Pricing
          </Link>
        </nav>

        <button className={styles.sideLogout} onClick={handleLogout}>
          Sign Out
        </button>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className={styles.main}>

        {/* Header */}
        <div className={styles.mainHeader}>
          <div>
            <h1 className={styles.mainTitle}>Employer Dashboard</h1>
            <p className={styles.mainSub}>Manage your job postings and track applicants.</p>
          </div>
          <Link to="/post-job" className={styles.postJobBtn}>
            <PlusIcon /> Post a Job
          </Link>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <StatCard
            icon={<BriefcaseIcon />}
            label="Active Postings"
            value={activeJobs}
            accent="#6d28d9"
          />
          <StatCard
            icon={<UsersIcon />}
            label="Total Applicants"
            value={totalApplicants}
            accent="#0d9488"
          />
          <StatCard
            icon={<ActivityIcon />}
            label="Credits Remaining"
            value={user?.companyProfile?.plan === 'plus' ? '299' : '0'}
            accent="#f59e0b"
          />
        </div>

        {/* Jobs table */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Job Postings</h2>
          </div>

          {loading && (
            <div className={styles.loadingRows}>
              {[1,2,3].map((i) => <div key={i} className={styles.skeletonRow} />)}
            </div>
          )}

          {!loading && jobs.length === 0 && (
            <div className={styles.empty}>
              <BriefcaseIcon />
              <p className={styles.emptyTitle}>No jobs posted yet</p>
              <p className={styles.emptySub}>Create your first job posting to start attracting candidates.</p>
              <Link to="/post-job" className={styles.emptyBtn}>Post Your First Job</Link>
            </div>
          )}

          {!loading && jobs.length > 0 && (
            <div className={styles.jobTable}>
              <div className={styles.tableHead}>
                <span>Job Title</span>
                <span>Location</span>
                <span>Type</span>
                <span>Applicants</span>
                <span>Actions</span>
              </div>
              {jobs.map((job) => (
                <div key={job._id} className={styles.tableRow}>
                  <div className={styles.jobTitleCell}>
                    <p className={styles.jobTitle}>{job.title}</p>
                    <p className={styles.jobCompany}>{job.company}</p>
                  </div>
                  <span className={styles.jobMeta}>{job.location || '—'}</span>
                  <span className={styles.jobMeta}>{job.type || '—'}</span>
                  <span className={styles.applicantCount}>
                    {job.applicantCount ?? 0}
                  </span>
                  <div className={styles.rowActions}>
                    <Link to={`/employer/jobs/${job._id}`} className={styles.viewBtn} title="View posting">
                      <EyeIcon />
                    </Link>
                    <button
                      onClick={() => handleDelete(job._id)}
                      className={styles.deleteBtn}
                      title="Delete posting"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
