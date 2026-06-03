import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useSavedJobs } from '../context/SavedJobsContext';
import styles from './SavedJobsPage.module.css';

/* ── Icons ─────────────────────────────────────────────────────────── */
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

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────── */
function timeAgo(iso) {
  if (!iso) return '';
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return '1d ago';
  if (d < 30)  return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const DATE_FILTERS = [
  { label: 'Any time', value: '' },
  { label: 'Last 24h', value: '1' },
  { label: 'Last 3 days', value: '3' },
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days', value: '30' },
];
const PAGE_SIZE = 10;

/* ── Saved Job Card ─────────────────────────────────────────────────── */
function SavedJobCard({ saved, onRemove }) {
  const { job, savedAt } = saved;
  const navigate = useNavigate();

  const handleApply = () => navigate(`/jobs/${job._id}`);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.logo} aria-hidden="true">
          {(job.company || '?').charAt(0).toUpperCase()}
        </div>

        <div className={styles.jobInfo}>
          <h2 className={styles.jobTitle}>
            <Link to={`/jobs/${job._id}`}>{job.title}</Link>
          </h2>
          <p className={styles.jobCompany}>{job.company}</p>

          <div className={styles.metaRow}>
            {job.location && (
              <span className={styles.metaChip}>
                <MapPinIcon />{job.location}
              </span>
            )}
            {job.type && (
              <span className={styles.metaChip}>
                <BriefcaseIcon />{job.type}
              </span>
            )}
            {job.salary && (
              <span className={`${styles.metaChip} ${styles.metaChipSalary}`}>
                {job.salary}
              </span>
            )}
          </div>

          <div className={styles.dateRow}>
            <span className={styles.dateChip}>
              <ClockIcon />Posted {timeAgo(job.createdAt)}
            </span>
            <span className={styles.dateChip}>
              Saved {timeAgo(savedAt)}
            </span>
          </div>
        </div>

        <div className={styles.cardActions}>
          <button
            className={styles.unsaveBtn}
            onClick={() => onRemove(job._id)}
            aria-label="Remove from saved jobs"
            title="Remove from saved"
          >
            <HeartIcon filled />
          </button>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <Link to={`/jobs/${job._id}`} className={styles.viewBtn}>
          View Job
        </Link>
        <button className={styles.applyBtn} onClick={handleApply}>
          Apply Now
        </button>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────── */
export default function SavedJobsPage() {
  const { toggleSave, refresh: refreshContext } = useSavedJobs();

  const [savedJobs,   setSavedJobs]   = useState([]);
  const [pagination,  setPagination]  = useState({ total: 0, page: 1, pages: 1 });
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  // Filters
  const [search,    setSearch]    = useState('');
  const [jobType,   setJobType]   = useState('');
  const [location,  setLocation]  = useState('');
  const [days,      setDays]      = useState('');
  const [page,      setPage]      = useState(1);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, jobType, location, days]);

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: PAGE_SIZE };
      if (debouncedSearch) params.search   = debouncedSearch;
      if (jobType)          params.type     = jobType;
      if (location)         params.location = location;
      if (days)             params.days     = days;

      const { data } = await api.get('/saved-jobs', { params });
      setSavedJobs(data.savedJobs || []);
      setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load saved jobs.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, jobType, location, days]);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  const handleRemove = async (jobId) => {
    await toggleSave(jobId);  // optimistic update in context
    refreshContext();
    // remove from local list immediately
    setSavedJobs((prev) => prev.filter((s) => String(s.job._id) !== String(jobId)));
    setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }));
  };

  const hasFilters = debouncedSearch || jobType || location || days;

  return (
    <div className={styles.page}>

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <HeartIcon filled />
            Saved Jobs
          </h1>
          <p className={styles.pageSub}>
            {pagination.total > 0
              ? `${pagination.total} saved job${pagination.total !== 1 ? 's' : ''}`
              : 'Your saved jobs appear here.'}
          </p>
        </div>
        <Link to="/jobs" className={styles.browseBtn}>
          Browse Jobs →
        </Link>
      </div>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <SearchIcon />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search by title or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search saved jobs"
          />
        </div>

        <select
          className={styles.select}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          aria-label="Filter by location"
        >
          <option value="">All Locations</option>
          {/* Unique locations extracted from current result-set */}
          {[...new Set(savedJobs.map((s) => s.job.location).filter(Boolean))].map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          aria-label="Filter by job type"
        >
          <option value="">All Types</option>
          {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          className={styles.select}
          value={days}
          onChange={(e) => setDays(e.target.value)}
          aria-label="Filter by date posted"
        >
          {DATE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            className={styles.clearBtn}
            onClick={() => { setSearch(''); setJobType(''); setLocation(''); setDays(''); }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      {error && <p className={styles.errorMsg}>{error}</p>}

      {/* Loading skeletons */}
      {loading && (
        <div className={styles.skeletons}>
          {[1, 2, 3].map((i) => <div key={i} className={styles.skeleton} />)}
        </div>
      )}

      {/* Empty state — no saved jobs at all */}
      {!loading && !error && pagination.total === 0 && !hasFilters && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <HeartIcon filled={false} />
          </div>
          <h2 className={styles.emptyTitle}>No saved jobs yet</h2>
          <p className={styles.emptySub}>
            Hit the heart icon on any job listing to save it here for later.
          </p>
          <Link to="/jobs" className={styles.emptyBtn}>Browse Jobs</Link>
        </div>
      )}

      {/* Empty state — filters returned nothing */}
      {!loading && !error && savedJobs.length === 0 && hasFilters && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><SearchIcon /></div>
          <h2 className={styles.emptyTitle}>No results found</h2>
          <p className={styles.emptySub}>Try adjusting your filters or search term.</p>
          <button
            className={styles.emptyBtn}
            onClick={() => { setSearch(''); setJobType(''); setLocation(''); setDays(''); }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Job cards */}
      {!loading && savedJobs.length > 0 && (
        <div className={styles.cardList}>
          {savedJobs.map((saved) => (
            <SavedJobCard
              key={saved._id}
              saved={saved}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            aria-label="Previous page"
          >
            <ChevronLeftIcon />
          </button>

          {Array.from({ length: pagination.pages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2)
            .map((p) => (
              <button
                key={p}
                className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                onClick={() => setPage(p)}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            ))}

          <button
            className={styles.pageBtn}
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}
    </div>
  );
}
