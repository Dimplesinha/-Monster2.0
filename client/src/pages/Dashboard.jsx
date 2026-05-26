import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import styles from './Dashboard.module.css';

export default function Dashboard() {
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

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1>Employer Dashboard</h1>
        <Link to="/post-job" className={styles.btnPrimary}>+ Post a Job</Link>
      </div>

      {loading && <p>Loading your jobs…</p>}

      {!loading && jobs.length === 0 && (
        <div className={styles.empty}>
          <p>You haven't posted any jobs yet.</p>
          <Link to="/post-job" className={styles.btnPrimary}>Post Your First Job</Link>
        </div>
      )}

      <div className={styles.table}>
        {jobs.map((job) => (
          <div key={job._id} className={styles.row}>
            <div>
              <p className={styles.jobTitle}>{job.title}</p>
              <p className={styles.jobMeta}>{job.location} · {job.type} · {job.applicantCount ?? 0} applicants</p>
            </div>
            <div className={styles.rowActions}>
              <Link to={`/jobs/${job._id}`} className={styles.btnOutline}>View</Link>
              <button onClick={() => handleDelete(job._id)} className={styles.btnDanger}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
