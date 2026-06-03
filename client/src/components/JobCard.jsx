import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSavedJobs } from '../context/SavedJobsContext';
import styles from './JobCard.module.css';

function HeartIcon({ filled }) {
  return filled ? (
    <svg viewBox="0 0 24 24" fill="#e11d48" stroke="#e11d48" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

export default function JobCard({ job }) {
  const { user }        = useAuth();
  const { isSaved, toggleSave } = useSavedJobs();
  const isJobseeker = user?.role === 'jobseeker';
  const saved       = isSaved(job._id);

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.logo} aria-hidden="true">
          {job.company?.charAt(0) ?? '?'}
        </div>
        <div className={styles.headerText}>
          <h3 className={styles.title}>
            <Link to={`/jobs/${job._id}`}>{job.title}</Link>
          </h3>
          <p className={styles.company}>{job.company}</p>
        </div>
        {isJobseeker && (
          <button
            className={`${styles.saveBtn} ${saved ? styles.saveBtnActive : ''}`}
            onClick={() => toggleSave(job._id)}
            aria-label={saved ? 'Unsave job' : 'Save job'}
            title={saved ? 'Remove from saved' : 'Save job'}
          >
            <HeartIcon filled={saved} />
          </button>
        )}
      </div>

      <div className={styles.meta}>
        <span className={styles.tag}>{job.location}</span>
        <span className={styles.tag}>{job.type}</span>
        {job.remote && <span className={styles.tagGreen}>Remote</span>}
      </div>

      <p className={styles.snippet}>
        {job.description?.slice(0, 120)}
        {job.description?.length > 120 ? '…' : ''}
      </p>

      <div className={styles.footer}>
        {job.salary && <span className={styles.salary}>{job.salary}</span>}
        <Link to={`/jobs/${job._id}`} className={styles.cta}>
          View Job
        </Link>
      </div>
    </article>
  );
}
