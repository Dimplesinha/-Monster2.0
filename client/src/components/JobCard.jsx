import { Link } from 'react-router-dom';
import styles from './JobCard.module.css';

export default function JobCard({ job }) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.logo} aria-hidden="true">
          {job.company?.charAt(0) ?? '?'}
        </div>
        <div>
          <h3 className={styles.title}>
            <Link to={`/jobs/${job._id}`}>{job.title}</Link>
          </h3>
          <p className={styles.company}>{job.company}</p>
        </div>
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
