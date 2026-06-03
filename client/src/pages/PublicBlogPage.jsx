import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import MarkdownContent from '../components/blog/MarkdownContent';
import styles from './PublicBlogPage.module.css';

/* ── helpers ─────────────────────────────────────────────────────── */
function readTime(text = '') {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
}

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

/* ── Back arrow icon ─────────────────────────────────────────────── */
function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className={styles.skeletonPage}>
      <div className={`${styles.skBone} ${styles.skHero}`} />
      <div className={styles.skBody}>
        {[100, 90, 75, 95, 60, 80].map((w, i) => (
          <div key={i} className={styles.skBone} style={{ height: 14, width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function PublicBlogPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [blog,    setBlog]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound,setNotFound]= useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/blogs/public/${slug}`)
      .then(({ data }) => setBlog(data.blog))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
        else navigate('/blogs');
      })
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) return <Skeleton />;

  /* ── 404 ──────────────────────────────────────────────────── */
  if (notFound) {
    return (
      <div className={styles.notFound}>
        <div className={styles.nfIcon}>🔍</div>
        <h1 className={styles.nfTitle}>Article not found</h1>
        <p className={styles.nfSub}>
          This article may have been removed or isn't published yet.
        </p>
        <Link to="/blogs" className={styles.nfBtn}>Browse all articles</Link>
      </div>
    );
  }

  const authorName = blog.owner?.name || 'Author';
  const authorRole = blog.ownerRole === 'employer' ? 'Company Blog' : 'Community Member';
  const mins       = readTime(blog.content);

  /* ── whether the logged-in user owns this blog ── */
  const isOwner = user && String(blog.owner?._id || blog.owner) === user.id;
  const editPath = user?.role === 'employer' || user?.role === 'admin'
    ? `/employer/blogs/${blog._id}/edit`
    : `/my-blogs/${blog._id}/edit`;

  return (
    <article className={styles.page}>

      {/* ── Hero ────────────────────────────────────────────── */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>

          {/* Back navigation */}
          <Link to="/blogs" className={styles.backLink}>
            <ArrowLeftIcon /> Community Articles
          </Link>

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className={styles.heroTags}>
              {blog.tags.map((t) => (
                <Link
                  key={t}
                  to={`/blogs?tag=${encodeURIComponent(t)}`}
                  className={styles.heroTag}
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className={styles.heroTitle}>{blog.title}</h1>

          {/* Description */}
          {blog.description && (
            <p className={styles.heroDesc}>{blog.description}</p>
          )}

          {/* Author + meta row */}
          <div className={styles.authorRow}>
            <span className={styles.authorAvatar}>{initials(authorName)}</span>
            <div className={styles.authorInfo}>
              <span className={styles.authorName}>{authorName}</span>
              <span className={styles.authorMeta}>{authorRole}</span>
            </div>
            <div className={styles.metaDivider} />
            <div className={styles.metaRight}>
              <span>{fmtDate(blog.publishedAt)}</span>
              <span className={styles.metaDot}>·</span>
              <span>{mins} min read</span>
            </div>
          </div>

          {/* Owner edit link */}
          {isOwner && (
            <Link to={editPath} className={styles.editLink}>
              ✎ Edit this article
            </Link>
          )}
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className={styles.bodyWrap}>
        <div className={styles.body}>
          <MarkdownContent content={blog.content} />
        </div>

        {/* ── Footer CTA ──────────────────────────────────── */}
        <aside className={styles.cta}>
          <div className={styles.ctaCard}>
            {user ? (
              <>
                <p className={styles.ctaTitle}>Share your story</p>
                <p className={styles.ctaSub}>
                  Join the community and publish your own career insights.
                </p>
                <Link
                  to={user.role === 'employer' || user.role === 'admin'
                    ? '/employer/blogs/new'
                    : '/my-blogs/new'}
                  className={styles.ctaBtn}
                >
                  ✦ Write an Article
                </Link>
              </>
            ) : (
              <>
                <p className={styles.ctaTitle}>Want to write for the community?</p>
                <p className={styles.ctaSub}>
                  Create a free account and share your career experience.
                </p>
                <Link to="/register" className={styles.ctaBtn}>Get started free</Link>
              </>
            )}
          </div>

          <Link to="/blogs" className={styles.browseLink}>
            ← More community articles
          </Link>
        </aside>
      </div>

    </article>
  );
}
