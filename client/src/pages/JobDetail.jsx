import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSavedJobs } from '../context/SavedJobsContext';
import styles from './JobDetail.module.css';

function HeartIcon({ filled }) {
  return filled ? (
    <svg viewBox="0 0 24 24" fill="#e11d48" stroke="#e11d48" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 20, height: 20 }}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 20, height: 20 }}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedJobs();
  const isJobseeker = user?.role === 'jobseeker';
  const saved = isSaved(id);
  const [job,        setJob]        = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [applied,    setApplied]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');

  // Fetch job and check if already applied
  useEffect(() => {
    const fetchJob = api.get(`/jobs/${id}`).then(({ data }) => setJob(data.job));

    // Check existing applications only when logged in as jobseeker
    const checkApplied = user?.role === 'jobseeker'
      ? api.get('/applications/mine').then(({ data }) => {
          const already = (data.applications || []).some(
            (a) => a.job?._id === id || a.job === id
          );
          setApplied(already);
        }).catch(() => {})
      : Promise.resolve();

    Promise.all([fetchJob, checkApplied]).finally(() => setLoading(false));
  }, [id, user]);

  const handleApply = async () => {
    if (!user) return;
    setApplyError('');
    setSubmitting(true);
    try {
      await api.post(`/jobs/${id}/apply`);
      setApplied(true);
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Could not submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.state}>Loading…</div>;
  if (!job)    return <div className={styles.state}>Job not found.</div>;

  return (
    <main className={styles.page}>
      <Link to="/jobs" className={styles.back}>← Back to Jobs</Link>

      <article className={styles.card}>
        <header className={styles.header}>
          <div className={styles.logo}>{job.company?.charAt(0)}</div>
          <div className={styles.headerText}>
            <h1 className={styles.title}>{job.title}</h1>
            <p className={styles.company}>{job.company}</p>
          </div>
          {isJobseeker && (
            <button
              className={`${styles.saveBtn} ${saved ? styles.saveBtnActive : ''}`}
              onClick={() => toggleSave(id)}
              aria-label={saved ? 'Unsave job' : 'Save job'}
              title={saved ? 'Remove from saved jobs' : 'Save this job'}
            >
              <HeartIcon filled={saved} />
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
          )}
        </header>

        <div className={styles.meta}>
          {job.location && <span>{job.location}</span>}
          {job.type     && <span>{job.type}</span>}
          {job.remote   && <span className={styles.remote}>Remote</span>}
          {job.salary   && <span>{job.salary}</span>}
        </div>

        <section className={styles.body}>
          <h2>About the role</h2>
          <p>{job.description}</p>
        </section>

        <div className={styles.actions}>
          {!user ? (
            <Link to="/login" className={styles.btnPrimary}>Log in to Apply</Link>
          ) : applied ? (
            <div className={styles.appliedWrap}>
              <span className={styles.appliedBadge}>
                ✓ Application Submitted
              </span>
              <Link to="/my-applications" className={styles.trackLink}>
                Track your application →
              </Link>
            </div>
          ) : (
            <>
              <button
                className={styles.btnPrimary}
                onClick={handleApply}
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Apply Now'}
              </button>
              {applyError && (
                <p className={styles.applyError}>{applyError}</p>
              )}
            </>
          )}
        </div>
      </article>
    </main>
  );
}
