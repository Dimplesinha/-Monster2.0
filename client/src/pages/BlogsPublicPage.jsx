import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import styles from './BlogsPublicPage.module.css';

/* ── helpers ─────────────────────────────────────────────────────── */
function readTime(content = '') {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* ── Card ────────────────────────────────────────────────────────── */
function BlogCard({ blog }) {
  const authorName = blog.owner?.name || 'Author';
  const authorRole = blog.ownerRole === 'employer' ? 'Company Blog' : 'Community Member';

  return (
    <Link to={`/blogs/${blog.slug}`} className={styles.card}>
      {/* Author chip */}
      <div className={styles.cardAuthor}>
        <span className={styles.cardAvatar}>{initials(authorName)}</span>
        <span className={styles.cardAuthorName}>{authorName}</span>
        <span className={styles.cardAuthorRole}>{authorRole}</span>
      </div>

      <h2 className={styles.cardTitle}>{blog.title}</h2>

      {blog.description && (
        <p className={styles.cardDesc}>{blog.description}</p>
      )}

      {/* Tags */}
      {blog.tags?.length > 0 && (
        <div className={styles.cardTags}>
          {blog.tags.slice(0, 4).map((t) => (
            <span key={t} className={styles.cardTag}>#{t}</span>
          ))}
        </div>
      )}

      <div className={styles.cardMeta}>
        <span>{fmtDate(blog.publishedAt)}</span>
        <span className={styles.cardDot}>·</span>
        <span>{readTime(blog.description)} min read</span>
      </div>
    </Link>
  );
}

/* ── Skeleton ────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className={styles.skeleton}>
      <div className={`${styles.skBone} ${styles.skAuthor}`} />
      <div className={`${styles.skBone} ${styles.skTitle}`} />
      <div className={`${styles.skBone} ${styles.skDesc}`} />
      <div className={`${styles.skBone} ${styles.skMeta}`} />
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function BlogsPublicPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tagFilter = searchParams.get('tag') || '';

  const [blogs,   setBlogs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [total,   setTotal]   = useState(0);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = { limit: 24 };
    if (tagFilter) params.tag = tagFilter;

    api.get('/blogs/public', { params })
      .then(({ data }) => {
        setBlogs(data.blogs || []);
        setTotal(data.total || 0);
      })
      .catch(() => setError('Could not load articles. Please try again.'))
      .finally(() => setLoading(false));
  }, [tagFilter]);

  const clearTag = () => setSearchParams({});

  return (
    <div className={styles.page}>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroBadge}>✦ Community</span>
          <h1 className={styles.heroTitle}>Career Insights &amp; Articles</h1>
          <p className={styles.heroSub}>
            Real advice from job seekers and employers — tips, stories, and industry know-how.
          </p>
          <Link to="/career-advice" className={styles.heroLink}>
            Browse curated articles →
          </Link>
        </div>
      </section>

      {/* ── Active tag filter banner ────────────────────────── */}
      {tagFilter && (
        <div className={styles.tagBanner}>
          Showing articles tagged <strong>#{tagFilter}</strong>
          <button className={styles.tagBannerClear} onClick={clearTag}>× Clear</button>
        </div>
      )}

      {/* ── Grid ──────────────────────────────────────────────── */}
      <div className={styles.container}>
        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className={styles.empty}>
            <p>{error}</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📝</div>
            <h2 className={styles.emptyTitle}>
              {tagFilter ? `No articles tagged #${tagFilter}` : 'No articles yet'}
            </h2>
            <p className={styles.emptySub}>
              {tagFilter
                ? 'Try removing the tag filter to see all articles.'
                : 'Be the first to share your career insights with the community.'}
            </p>
            {tagFilter && (
              <button className={styles.emptyBtn} onClick={clearTag}>Show all articles</button>
            )}
          </div>
        ) : (
          <>
            <p className={styles.resultCount}>
              {tagFilter
                ? `${total} article${total !== 1 ? 's' : ''} tagged #${tagFilter}`
                : `${total} article${total !== 1 ? 's' : ''} from the community`}
            </p>
            <div className={styles.grid}>
              {blogs.map((b) => <BlogCard key={b._id} blog={b} />)}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
