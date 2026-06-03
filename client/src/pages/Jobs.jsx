import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import QuickApplyModal from '../components/QuickApplyModal';
import styles from './Jobs.module.css';

/* ── tiny helpers ──────────────────────────────────────────────────── */
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return '1d ago';
  if (d < 30)  return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

/* ── SVG Icons ─────────────────────────────────────────────────────── */
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

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
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

function WifiIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <line x1="12" y1="20" x2="12.01" y2="20"/>
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

/* ── Left-panel job card ───────────────────────────────────────────── */
function JobListCard({ job, selected, saved, applied, onSelect, onSave, onQuickApply, isLoggedIn }) {
  return (
    <article
      className={`${styles.listCard} ${selected ? styles.listCardSelected : ''}`}
      onClick={() => onSelect(job)}
    >
      {/* Top row: avatar + icons */}
      <div className={styles.listCardTop}>
        <div className={styles.listAvatar}>{job.company?.charAt(0) ?? '?'}</div>
        <div className={styles.listCardIcons}>
          <button
            className={`${styles.iconBtn} ${saved ? styles.iconBtnSaved : ''}`}
            onClick={(e) => { e.stopPropagation(); if (isLoggedIn) onSave(job._id); }}
            aria-label={saved ? 'Unsave job' : 'Save job'}
          >
            <HeartIcon filled={saved} />
          </button>
        </div>
      </div>

      {/* Title + company */}
      <h3 className={styles.listTitle}>{job.title}</h3>
      <p className={styles.listCompany}>{job.company}</p>

      {/* Meta row */}
      <div className={styles.listMeta}>
        <span className={styles.listMetaItem}>
          <span className={styles.metaIcon}><MapPinIcon /></span>
          {job.location}
        </span>
        {job.remote && (
          <span className={`${styles.listMetaItem} ${styles.remoteBadge}`}>
            <span className={styles.metaIcon}><WifiIcon /></span>
            Remote
          </span>
        )}
        <span className={styles.listDate}>{timeAgo(job.createdAt)}</span>
      </div>

      {/* Salary */}
      {job.salary && (
        <div className={styles.salaryBadge}>
          <span className={styles.metaIcon}><DollarIcon /></span>
          {job.salary}
        </div>
      )}

      {/* Snippet */}
      <p className={styles.listSnippet}>
        {job.description?.slice(0, 140)}{job.description?.length > 140 ? '…' : ''}
      </p>

      {/* Actions */}
      <div className={styles.listActions}>
        {applied ? (
          <span className={styles.appliedBadge}>✓ Applied</span>
        ) : (
          <button
            className={styles.quickApplyBtn}
            onClick={(e) => { e.stopPropagation(); onQuickApply(job); }}
          >
            ⚡ Quick Apply
          </button>
        )}
      </div>
    </article>
  );
}

/* ── Right-panel: Job detail ───────────────────────────────────────── */
function JobDetail({ job, applied, onQuickApply, isLoggedIn }) {
  if (!job) {
    return (
      <div className={styles.detailPlaceholder}>
        <div className={styles.placeholderIllo}>
          <BriefcaseIcon />
        </div>
        <h2 className={styles.placeholderHeading}>
          We have found jobs that could be the right fit
        </h2>
        <p className={styles.placeholderSub}>Your results are listed on the left</p>
      </div>
    );
  }

  return (
    <div className={styles.detail}>
      {/* Header */}
      <div className={styles.detailHeader}>
        <div className={styles.detailAvatar}>{job.company?.charAt(0) ?? '?'}</div>
        <div>
          <h1 className={styles.detailTitle}>{job.title}</h1>
          <p className={styles.detailCompany}>{job.company}</p>
        </div>
      </div>

      {/* Meta */}
      <div className={styles.detailMeta}>
        <span className={styles.detailMetaItem}>
          <span className={styles.metaIcon}><MapPinIcon /></span>{job.location}
        </span>
        <span className={styles.detailMetaItem}>
          <span className={styles.metaIcon}><BriefcaseIcon /></span>{job.type}
        </span>
        {job.remote && (
          <span className={`${styles.detailMetaItem} ${styles.remoteBadge}`}>
            <span className={styles.metaIcon}><WifiIcon /></span>Remote
          </span>
        )}
        {job.salary && (
          <span className={styles.detailMetaItem}>
            <span className={styles.metaIcon}><DollarIcon /></span>{job.salary}
          </span>
        )}
      </div>

      {/* Apply CTA */}
      <div className={styles.detailApplyBar}>
        {!isLoggedIn ? (
          <Link to="/login" className={styles.detailApplyBtn}>Log in to Apply</Link>
        ) : applied ? (
          <span className={styles.detailAppliedBadge}>✓ Application Submitted</span>
        ) : (
          <button className={styles.detailApplyBtn} onClick={() => onQuickApply(job)}>
            ⚡ Quick Apply
          </button>
        )}
        <p className={styles.detailPosted}>Posted {timeAgo(job.createdAt)}</p>
      </div>

      {/* Description */}
      <div className={styles.detailBody}>
        <h2 className={styles.detailBodyTitle}>About the Role</h2>
        <p className={styles.detailDesc}>{job.description}</p>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────────── */
export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const keyword  = searchParams.get('q')        || '';
  const location = searchParams.get('location') || '';
  const typeFilter = searchParams.get('type')   || '';
  const remoteFilter = searchParams.get('remote') || '';

  const [jobs, setJobs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyJob, setApplyJob]       = useState(null);   // job to open modal for
  const [savedIds, setSavedIds]       = useState(new Set());
  const [appliedIds, setAppliedIds]   = useState(new Set());

  // ── Fetch jobs ──────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = { page, limit: 10 };
    if (keyword)      params.q        = keyword;
    if (location)     params.location = location;
    if (typeFilter)   params.type     = typeFilter;
    if (remoteFilter) params.remote   = remoteFilter;

    api
      .get('/jobs', { params })
      .then(({ data }) => {
        setJobs(data.jobs);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages);
        setSelectedJob(null);
      })
      .catch(() => setError('Failed to load jobs. Please try again.'))
      .finally(() => setLoading(false));
  }, [keyword, location, typeFilter, remoteFilter, page]);

  // ── Fetch applied job IDs (for logged-in jobseekers) ────────
  useEffect(() => {
    if (!user || user.role !== 'jobseeker') return;
    api.get('/jobs/applied-ids').then(({ data }) => {
      setAppliedIds(new Set(data.jobIds || []));
    }).catch(() => {});
  }, [user]);

  // ── Handlers ────────────────────────────────────────────────
  const handleSave = useCallback((jobId) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId); else next.add(jobId);
      return next;
    });
  }, []);

  const handleApplySuccess = useCallback((jobId) => {
    setAppliedIds((prev) => new Set([...prev, jobId]));
  }, []);

  const handleFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
    setPage(1);
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (keyword)  next.set('q', keyword);
    if (location) next.set('location', location);
    setSearchParams(next);
    setPage(1);
  };

  const hasFilters = typeFilter || remoteFilter;

  return (
    <div className={styles.page}>
      {/* ── Search bar ──────────────────────────────────────── */}
      <div className={styles.searchWrap}>
        <SearchBar initialKeyword={keyword} initialLocation={location} />
      </div>

      {/* ── Results count + tip ──────────────────────────────── */}
      <div className={styles.resultsBar}>
        <span className={styles.resultCount}>
          {loading ? 'Loading…' : `${total.toLocaleString()} Result${total !== 1 ? 's' : ''}${keyword ? ` for "${keyword}"` : ''}${location ? ` in ${location}` : ''}`}
        </span>
      </div>

      {/* ── Filter pills ─────────────────────────────────────── */}
      <div className={styles.filterBar}>
        <select
          className={`${styles.filterPill} ${remoteFilter ? styles.filterPillActive : ''}`}
          value={remoteFilter}
          onChange={(e) => handleFilter('remote', e.target.value)}
        >
          <option value="">All Locations</option>
          <option value="true">Remote</option>
        </select>

        <select
          className={`${styles.filterPill} ${typeFilter ? styles.filterPillActive : ''}`}
          value={typeFilter}
          onChange={(e) => handleFilter('type', e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
          <option value="Freelance">Freelance</option>
        </select>

        {hasFilters && (
          <button className={styles.clearAll} onClick={clearFilters}>Clear All</button>
        )}
      </div>

      {/* ── Two-panel layout ─────────────────────────────────── */}
      <div className={styles.layout}>

        {/* ── Left: job list ─────────────────────────────────── */}
        <section className={styles.leftPanel} aria-label="Job listings">
          {error && <p className={styles.stateError}>{error}</p>}
          {loading && (
            <div className={styles.loadingList}>
              {[1,2,3,4].map((i) => <div key={i} className={styles.skeleton} />)}
            </div>
          )}
          {!loading && !error && jobs.length === 0 && (
            <p className={styles.emptyState}>No jobs found. Try different keywords.</p>
          )}

          {!loading && jobs.map((job) => (
            <JobListCard
              key={job._id}
              job={job}
              selected={selectedJob?._id === job._id}
              saved={savedIds.has(job._id)}
              applied={appliedIds.has(job._id)}
              onSelect={setSelectedJob}
              onSave={handleSave}
              onQuickApply={setApplyJob}
              isLoggedIn={!!user}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
              >
                <ChevronLeftIcon />
              </button>
              <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button
                className={styles.pageBtn}
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                <ChevronRightIcon />
              </button>
            </div>
          )}
        </section>

        {/* ── Right: job detail / placeholder ────────────────── */}
        <section className={styles.rightPanel} aria-label="Job detail">
          <JobDetail
            job={selectedJob}
            applied={selectedJob ? appliedIds.has(selectedJob._id) : false}
            onQuickApply={setApplyJob}
            isLoggedIn={!!user}
          />
        </section>

      </div>

      {/* ── Quick Apply modal ─────────────────────────────────── */}
      {applyJob && (
        <QuickApplyModal
          job={applyJob}
          user={user}
          onClose={() => setApplyJob(null)}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
}
