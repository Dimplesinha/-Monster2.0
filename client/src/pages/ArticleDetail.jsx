import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import styles from './ArticleDetail.module.css';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function BodyBlock({ block }) {
  switch (block.type) {
    case 'heading':
      return <h2 className={styles.bodyHeading}>{block.text}</h2>;
    case 'list':
      return (
        <ul className={styles.bodyList}>
          {block.items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
    default:
      return <p className={styles.bodyParagraph}>{block.text}</p>;
  }
}

function RelatedCard({ article }) {
  return (
    <Link to={`/career-advice/${article.slug}`} className={styles.relatedCard}>
      <div
        className={styles.relatedImg}
        style={{ backgroundImage: `url(${article.imageUrl})` }}
      />
      <div className={styles.relatedBody}>
        <span className={styles.relatedCategory}>{article.category.toUpperCase()}</span>
        <p className={styles.relatedTitle}>{article.title}</p>
        <span className={styles.relatedRead}>{article.readTime}</span>
      </div>
    </Link>
  );
}

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const { data } = await api.get(`/articles/${slug}`);
        if (cancelled) return;
        setArticle(data);

        const { data: relData } = await api.get('/articles', {
          params: { category: data.category, limit: 4 },
        });
        if (cancelled) return;
        setRelated(relData.filter((a) => a.slug !== slug).slice(0, 3));
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.status === 404 ? 'notfound' : 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.stateBox} aria-live="polite" aria-busy="true">
          <div className={styles.spinner} aria-hidden="true" />
          <p>Loading article…</p>
        </div>
      </main>
    );
  }

  if (error === 'notfound') {
    return (
      <main className={styles.page}>
        <div className={styles.stateBox}>
          <h1 className={styles.notFoundHeading}>Article not found</h1>
          <p>That article may have moved or no longer exists.</p>
          <Link to="/career-advice" className={styles.backLink}>← Back to Career Advice</Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <div className={styles.stateBox}>
          <p className={styles.errorText}>Something went wrong. Please try again.</p>
          <Link to="/career-advice" className={styles.backLink}>← Back to Career Advice</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>

      {/* Hero */}
      <header className={styles.hero} style={{ backgroundImage: `url(${article.imageUrl})` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroInner}>
          <Link to="/career-advice" className={styles.breadcrumb}>← Career Advice</Link>
          <span className={styles.heroCategory}>{article.category.toUpperCase()}</span>
          <h1 className={styles.heroTitle}>{article.title}</h1>
          <div className={styles.heroMeta}>
            {article.authorAvatar && (
              <img
                src={article.authorAvatar}
                alt={article.author}
                className={styles.heroAvatar}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            <span>{article.author}</span>
            <span className={styles.dot}>·</span>
            <span>Updated {formatDate(article.updatedAt || article.publishedAt)}</span>
            <span className={styles.dot}>·</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className={styles.layout}>
        <article className={styles.body} aria-label="Article content">
          <p className={styles.lead}>{article.excerpt}</p>
          {article.body.map((block, i) => (
            <BodyBlock key={i} block={block} />
          ))}
        </article>

        {/* Sidebar CTA */}
        <aside className={styles.sidebar}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaHeading}>Ready to find your next role?</h2>
            <p className={styles.ctaBody}>Browse thousands of jobs matched to your skills and experience.</p>
            <Link to="/jobs" className={styles.ctaBtn}>Search Jobs →</Link>
          </div>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaHeading}>Upload your resume</h2>
            <p className={styles.ctaBody}>Let employers find you. Upload your resume and get noticed.</p>
            <Link to="/register" className={styles.ctaBtnAlt}>Get Started →</Link>
          </div>
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className={styles.related} aria-labelledby="related-heading">
          <div className={styles.relatedInner}>
            <h2 id="related-heading" className={styles.relatedHeading}>More in {article.category}</h2>
            <div className={styles.relatedGrid}>
              {related.map((a) => <RelatedCard key={a.slug} article={a} />)}
            </div>
            <div className={styles.relatedCta}>
              <Link to="/career-advice" className={styles.allAdviceBtn}>
                View All Career Advice →
              </Link>
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
