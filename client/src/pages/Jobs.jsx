import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import styles from './Jobs.module.css';

export default function Jobs() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const keyword = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = { page, limit: 12 };
    if (keyword) params.q = keyword;
    if (location) params.location = location;

    api
      .get('/jobs', { params })
      .then(({ data }) => {
        setJobs(data.jobs);
        setTotalPages(data.totalPages);
      })
      .catch(() => setError('Failed to load jobs. Please try again.'))
      .finally(() => setLoading(false));
  }, [keyword, location, page]);

  return (
    <main className={styles.page}>
      <div className={styles.searchWrap}>
        <SearchBar initialKeyword={keyword} initialLocation={location} />
      </div>

      <div className={styles.layout}>
        {/* Filters sidebar placeholder */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Filters</h2>
          <p className={styles.sidebarNote}>Coming soon: job type, salary range, date posted.</p>
        </aside>

        <section className={styles.results}>
          {loading && <p className={styles.state}>Loading jobs…</p>}
          {error && <p className={styles.stateError}>{error}</p>}
          {!loading && !error && jobs.length === 0 && (
            <p className={styles.state}>No jobs found. Try different keywords.</p>
          )}
          <div className={styles.grid}>
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
