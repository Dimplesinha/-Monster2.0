import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import styles from './BlogsListPage.module.css';

/* ── Icons ────────────────────────────────────────────────────────── */
function PenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
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

function BookOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/* ── Status pill ──────────────────────────────────────────────────── */
function StatusPill({ status }) {
  return (
    <span className={`${styles.statusPill} ${status === 'published' ? styles.statusPublished : styles.statusDraft}`}>
      <span className={styles.statusDot} />
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  );
}

/* ── Single blog row ──────────────────────────────────────────────── */
function BlogRow({ blog, editBase, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this blog? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/blogs/${blog._id}`);
      onDelete(blog._id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <p className={styles.rowTitle}>{blog.title}</p>
        <p className={styles.rowMeta}>
          Updated {formatDate(blog.updatedAt)}
          {blog.tags?.length > 0 && (
            <> &middot; {blog.tags.slice(0, 3).join(', ')}</>
          )}
        </p>
      </div>

      <StatusPill status={blog.status} />

      <div className={styles.rowActions}>
        {blog.status === 'published' && blog.slug && (
          <Link
            to={`/blogs/${blog.slug}`}
            className={styles.actionBtn}
            title="View published post"
          >
            <EyeIcon />
          </Link>
        )}
        <Link
          to={`${editBase}/${blog._id}/edit`}
          className={styles.actionBtn}
          title="Edit"
        >
          <PenIcon />
        </Link>
        <button
          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
          onClick={handleDelete}
          disabled={deleting}
          title="Delete"
          aria-label="Delete blog"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */
export default function BlogsListPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const isEmployer = user?.role === 'employer' || user?.role === 'admin';
  const newPath    = isEmployer ? '/employer/blogs/new'  : '/my-blogs/new';
  const editBase   = isEmployer ? '/employer/blogs'      : '/my-blogs';

  const [blogs,   setBlogs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');  // all | draft | published

  useEffect(() => {
    const params = filter !== 'all' ? `?status=${filter}` : '';
    api
      .get(`/blogs${params}`)
      .then(({ data }) => setBlogs(data.blogs || []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleDelete = (id) => setBlogs((prev) => prev.filter((b) => b._id !== id));

  const countFor = (key) =>
    key === 'all' ? blogs.length : blogs.filter((b) => b.status === key).length;

  const FILTERS = [
    { key: 'all',       label: 'All' },
    { key: 'draft',     label: 'Drafts' },
    { key: 'published', label: 'Published' },
  ];

  return (
    <div className={styles.page}>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Blogs</h1>
          <p className={styles.pageSub}>Create, manage, and publish your articles.</p>
        </div>
        <button className={styles.newBtn} onClick={() => navigate(newPath)}>
          <PenIcon /> New Blog
        </button>
      </div>

      {/* ── Filter tabs ──────────────────────────────────────────── */}
      <div className={styles.filterBar} role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            className={`${styles.filterTab} ${filter === f.key ? styles.filterTabActive : ''}`}
            onClick={() => { setLoading(true); setFilter(f.key); }}
          >
            {f.label}
            <span className={`${styles.filterCount} ${filter === f.key ? styles.filterCountActive : ''}`}>
              {countFor(f.key)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Table header ─────────────────────────────────────────── */}
      {!loading && blogs.length > 0 && (
        <div className={styles.tableHead}>
          <span>Title</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
      )}

      {/* ── Loading skeletons ─────────────────────────────────────── */}
      {loading && (
        <div className={styles.skeletons}>
          {[1, 2, 3].map((i) => <div key={i} className={styles.skeleton} />)}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────── */}
      {!loading && blogs.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><BookOpenIcon /></div>
          <h2 className={styles.emptyTitle}>
            {filter === 'all' ? "You haven't written any blogs yet" : `No ${filter} blogs`}
          </h2>
          <p className={styles.emptySub}>
            {filter === 'all'
              ? 'Share your expertise, career tips, or industry insights. Your first blog is one click away.'
              : 'Change the filter above to see your other blogs.'}
          </p>
          {filter === 'all' && (
            <button className={styles.emptyBtn} onClick={() => navigate(newPath)}>
              Write Your First Blog
            </button>
          )}
        </div>
      )}

      {/* ── Blog rows ────────────────────────────────────────────── */}
      {!loading && blogs.length > 0 && (
        <div className={styles.rowList}>
          {blogs.map((blog) => (
            <BlogRow
              key={blog._id}
              blog={blog}
              editBase={editBase}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

    </div>
  );
}
