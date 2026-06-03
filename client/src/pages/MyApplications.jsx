import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import styles from './MyApplications.module.css';

/* ── Icons ────────────────────────────────────────────────────────── */
function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
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

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

/* ── Status config ────────────────────────────────────────────────── */
const STATUS_MAP = {
  pending:     { label: 'Applied',      color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  reviewed:    { label: 'Under Review', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  shortlisted: { label: 'Shortlisted',  color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  rejected:    { label: 'Not Selected', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

/* ── Status timeline steps ────────────────────────────────────────── */
const TIMELINE = ['pending', 'reviewed', 'shortlisted'];

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span
      className={styles.statusBadge}
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  );
}

function StatusTimeline({ status }) {
  if (status === 'rejected') {
    return (
      <div className={styles.rejectedNote}>
        <span className={styles.rejectedDot} />
        This application was not selected. Keep applying — the right job is out there!
      </div>
    );
  }

  const currentIdx = TIMELINE.indexOf(status);

  return (
    <div className={styles.timeline}>
      {TIMELINE.map((s, i) => {
        const done   = i < currentIdx;
        const active = i === currentIdx;
        const cfg    = STATUS_MAP[s];
        return (
          <div key={s} className={styles.timelineStep}>
            {i > 0 && (
              <div className={`${styles.timelineLine} ${done || active ? styles.timelineLineDone : ''}`} />
            )}
            <div
              className={`${styles.timelineDot}
                ${done   ? styles.timelineDotDone   : ''}
                ${active ? styles.timelineDotActive : ''}
                ${!done && !active ? styles.timelineDotPending : ''}`}
              title={cfg.label}
            >
              {done && (
                <svg viewBox="0 0 10 8" fill="none" stroke="#fff" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="1 4 3.5 7 9 1"/>
                </svg>
              )}
            </div>
            <span className={`${styles.timelineLabel}
              ${active ? styles.timelineLabelActive : ''}
              ${done   ? styles.timelineLabelDone   : ''}`}
            >
              {cfg.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Time helper ──────────────────────────────────────────────────── */
function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return '1 day ago';
  if (d < 30)  return `${d} days ago`;
  if (d < 365) return `${Math.floor(d / 30)} mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

/* ── Application card ─────────────────────────────────────────────── */
function AppCard({ app }) {
  const job    = app.job || {};
  const status = app.status || 'pending';

  return (
    <div className={`${styles.card} ${status === 'rejected' ? styles.cardRejected : ''}`}>
      {/* Card header */}
      <div className={styles.cardHead}>
        <div className={styles.companyLogo} aria-hidden="true">
          {(job.company || '?').charAt(0).toUpperCase()}
        </div>

        <div className={styles.jobInfo}>
          <h2 className={styles.jobTitle}>{job.title || 'Unknown Role'}</h2>
          <p className={styles.jobCompany}>{job.company || '—'}</p>
          <div className={styles.jobMeta}>
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
            <span className={styles.metaChip}>
              <ClockIcon />Applied {timeAgo(app.createdAt)}
            </span>
          </div>
        </div>

        <div className={styles.cardRight}>
          <StatusBadge status={status} />
          {job._id && (
            <Link to={`/jobs/${job._id}`} className={styles.viewBtn} title="View job posting">
              <ExternalLinkIcon />
              <span>View Job</span>
            </Link>
          )}
        </div>
      </div>

      {/* Cover note preview */}
      {app.coverNote && (
        <div className={styles.coverNote}>
          <p className={styles.coverNoteLabel}>Your cover note</p>
          <p className={styles.coverNoteText}>{app.coverNote}</p>
        </div>
      )}

      {/* Status timeline */}
      <div className={styles.cardTimeline}>
        <StatusTimeline status={status} />
      </div>
    </div>
  );
}

/* ── Filter tabs ──────────────────────────────────────────────────── */
const FILTERS = [
  { key: 'all',         label: 'All' },
  { key: 'pending',     label: 'Applied' },
  { key: 'reviewed',    label: 'Under Review' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'rejected',    label: 'Not Selected' },
];

/* ── Page ─────────────────────────────────────────────────────────── */
export default function MyApplications() {
  const [apps,    setApps]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    api
      .get('/applications/mine')
      .then(({ data }) => setApps(data.applications || []))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? apps
    : apps.filter((a) => (a.status || 'pending') === filter);

  const countFor = (key) =>
    key === 'all' ? apps.length : apps.filter((a) => (a.status || 'pending') === key).length;

  return (
    <div className={styles.page}>

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Applications</h1>
          <p className={styles.pageSub}>
            Track the status of every job you've applied to.
          </p>
        </div>
        <Link to="/jobs" className={styles.browseBtn}>
          Browse More Jobs →
        </Link>
      </div>

      {/* ── Filter tabs ──────────────────────────────────────────── */}
      <div className={styles.filterBar} role="tablist" aria-label="Filter applications">
        {FILTERS.map((f) => {
          const count = countFor(f.key);
          return (
            <button
              key={f.key}
              role="tab"
              aria-selected={filter === f.key}
              className={`${styles.filterTab} ${filter === f.key ? styles.filterTabActive : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              {count > 0 && (
                <span className={`${styles.filterCount} ${filter === f.key ? styles.filterCountActive : ''}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className={styles.content}>

        {/* Loading skeleton */}
        {loading && (
          <div className={styles.skeletons}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        )}

        {/* Empty state — no applications at all */}
        {!loading && apps.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <BriefcaseIcon />
            </div>
            <h2 className={styles.emptyTitle}>No applications yet</h2>
            <p className={styles.emptySub}>
              Start applying to jobs and your applications will appear here so you can track every step.
            </p>
            <Link to="/jobs" className={styles.emptyBtn}>Find Jobs to Apply</Link>
          </div>
        )}

        {/* Empty state — no results for this filter */}
        {!loading && apps.length > 0 && filtered.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><BriefcaseIcon /></div>
            <h2 className={styles.emptyTitle}>No applications here</h2>
            <p className={styles.emptySub}>
              You don't have any applications with this status yet.
            </p>
            <button className={styles.emptyBtn} onClick={() => setFilter('all')}>
              View All Applications
            </button>
          </div>
        )}

        {/* Application cards */}
        {!loading && filtered.length > 0 && (
          <div className={styles.cardList}>
            {filtered.map((app) => (
              <AppCard key={app._id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
