import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import styles from './CareerAdvice.module.css';

// ── Category chip config ─────────────────────────────────────────
// label shown to user → internal category value (null = no filter)
const CATEGORY_CHIPS = [
  { label: 'All Articles',                     value: null },
  { label: 'Resume Guides',                    value: 'Resume' },
  { label: 'Cover Letter Guides',              value: 'Cover Letter' },
  { label: 'Interviewing',                     value: 'Interviews' },
  { label: 'Job Search Strategy',              value: 'Job Search' },
  { label: 'Salary & Benefits',               value: 'Salary' },
  { label: 'Career Advancement & Management', value: null },
  { label: 'Career Paths & Skills',           value: null },
  { label: 'Career Transitions & Quitting',   value: null },
  { label: 'Job & Company Lists',             value: null },
  { label: 'News & Insights',                 value: 'News & Market Insights' },
  { label: 'Workplace Culture & Life',        value: null },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatShortDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Search icon SVG ──────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

// ── Mic icon placeholder ─────────────────────────────────────────
function MicIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

// ── Carousel ─────────────────────────────────────────────────────
function FeaturedCarousel({ articles }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  const go = useCallback((next) => {
    setIdx(next);
    // reset auto-advance on manual interaction
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIdx((i) => (i + 1) % articles.length);
    }, 7000);
  }, [articles.length]);

  // auto-advance
  useEffect(() => {
    if (articles.length < 2) return;
    timerRef.current = setTimeout(() => {
      setIdx((i) => (i + 1) % articles.length);
    }, 7000);
    return () => clearTimeout(timerRef.current);
  }, [idx, articles.length]);

  if (!articles.length) return null;
  const current = articles[idx];

  return (
    <section className={styles.carousel} aria-label="Featured articles">
      <div className={styles.carouselInner}>

        {/* Left: image */}
        <Link
          to={`/career-advice/${current.slug}`}
          className={styles.carouselImgWrap}
          tabIndex={-1}
          aria-hidden="true"
        >
          <div
            className={styles.carouselImg}
            style={{ backgroundImage: `url(${current.imageUrl})` }}
          />
        </Link>

        {/* Right: content */}
        <div className={styles.carouselContent}>
          <span className={styles.carouselCategory}>{current.category.toUpperCase()}</span>
          <h2 className={styles.carouselTitle}>
            <Link to={`/career-advice/${current.slug}`} className={styles.carouselTitleLink}>
              {current.title}
            </Link>
          </h2>
          <p className={styles.carouselExcerpt}>{current.excerpt}</p>

          <div className={styles.carouselMeta}>
            <div className={styles.carouselAvatar}>
              <img
                src={current.authorAvatar}
                alt={current.author}
                className={styles.carouselAvatarImg}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span className={styles.carouselAvatarFallback}>{current.author.charAt(0)}</span>
            </div>
            <div>
              <span className={styles.carouselAuthor}>{current.author}</span>
              <span className={styles.carouselMetaSep}> · </span>
              <span className={styles.carouselDate}>
                Updated {formatShortDate(current.updatedAt || current.publishedAt)}
              </span>
              <span className={styles.carouselMetaSep}> · </span>
              <span className={styles.carouselReadTime}>{current.readTime}</span>
            </div>
          </div>

          {/* Arrow + dots */}
          <div className={styles.carouselControls}>
            <button
              className={styles.carouselArrow}
              onClick={() => go((idx - 1 + articles.length) % articles.length)}
              aria-label="Previous article"
            >
              ‹
            </button>
            <div className={styles.carouselDots} role="tablist" aria-label="Carousel position">
              {articles.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === idx}
                  aria-label={`Article ${i + 1}`}
                  className={`${styles.dot} ${i === idx ? styles.dotActive : ''}`}
                  onClick={() => go(i)}
                />
              ))}
            </div>
            <button
              className={styles.carouselArrow}
              onClick={() => go((idx + 1) % articles.length)}
              aria-label="Next article"
            >
              ›
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

// ── Article card ─────────────────────────────────────────────────
function ArticleCard({ article }) {
  return (
    <Link to={`/career-advice/${article.slug}`} className={styles.card}>
      <div
        className={styles.cardImg}
        style={{ backgroundImage: `url(${article.imageUrl})` }}
        role="img"
        aria-label={article.title}
      />
      <div className={styles.cardBody}>
        <span className={styles.cardCategory}>{article.category.toUpperCase()}</span>
        <h3 className={styles.cardTitle}>{article.title}</h3>
        <p className={styles.cardExcerpt}>{article.excerpt}</p>
        <div className={styles.cardDivider} aria-hidden="true" />
        <div className={styles.cardAuthorRow}>
          <div className={styles.cardAvatar}>
            <img
              src={article.authorAvatar}
              alt={article.author}
              className={styles.cardAvatarImg}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className={styles.cardAvatarFallback}>{article.author.charAt(0)}</span>
          </div>
          <div className={styles.cardAuthorInfo}>
            <span className={styles.cardAuthorName}>{article.author}</span>
            <span className={styles.cardMeta}>
              {formatDate(article.publishedAt)} · {article.readTime}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Main page ────────────────────────────────────────────────────
export default function CareerAdvice() {
  const [allArticles, setAllArticles]     = useState([]);
  const [featuredArticles, setFeatured]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [activeChip, setActiveChip]       = useState(CATEGORY_CHIPS[0]);
  const [searchInput, setSearchInput]     = useState('');
  const [searchQuery, setSearchQuery]     = useState('');

  // Load all articles once; carousel uses featured subset
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get('/articles'),
      api.get('/articles', { params: { featured: 'true' } }),
    ])
      .then(([{ data: all }, { data: featured }]) => {
        if (cancelled) return;
        setAllArticles(all);
        setFeatured(featured);
      })
      .catch(() => { if (!cancelled) setError('Failed to load articles. Please try again.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  // Client-side filter — category then keyword
  const displayed = allArticles.filter((a) => {
    const catOk = activeChip.value == null || a.category === activeChip.value;
    if (!catOk) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const handleChip = (chip) => {
    setActiveChip(chip);
    setSearchQuery('');
    setSearchInput('');
  };

  const clearFilters = () => {
    setActiveChip(CATEGORY_CHIPS[0]);
    setSearchQuery('');
    setSearchInput('');
  };

  return (
    <main className={styles.page}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="ca-hero-heading">
        <div className={styles.heroInner}>
          <h1 id="ca-hero-heading" className={styles.heroHeading}>
            Career Advice &amp; Resources
          </h1>
          <p className={styles.heroSub}>
            The latest trends, expert advice, and top tips to help you land the job faster.
          </p>
        </div>
      </section>

      {/* ── Featured carousel ────────────────────────────────── */}
      {!loading && !error && featuredArticles.length > 0 && (
        <FeaturedCarousel articles={featuredArticles} />
      )}

      {/* ── Search bar ───────────────────────────────────────── */}
      <section className={styles.searchSection} aria-label="Search articles">
        <div className={styles.searchInner}>
          <form className={styles.searchForm} onSubmit={handleSearch} role="search">
            <span className={styles.searchIconLeft} aria-hidden="true"><SearchIcon /></span>
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Search career advice"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search career advice articles"
            />
            <button type="button" className={styles.micBtn} aria-label="Voice search (placeholder)">
              <MicIcon />
            </button>
          </form>
        </div>
      </section>

      {/* ── Category chips grid ──────────────────────────────── */}
      <section className={styles.chipsSection} aria-label="Browse by category">
        <div className={styles.chipsInner}>
          <div className={styles.chipsGrid} role="group" aria-label="Article categories">
            {CATEGORY_CHIPS.map((chip) => (
              <button
                key={chip.label}
                className={`${styles.chip} ${activeChip.label === chip.label ? styles.chipActive : ''}`}
                onClick={() => handleChip(chip)}
                aria-pressed={activeChip.label === chip.label}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Article grid ─────────────────────────────────────── */}
      <section className={styles.grid_section} aria-label="Articles">
        <div className={styles.gridInner}>

          {loading && (
            <div className={styles.stateBox} aria-live="polite" aria-busy="true">
              <div className={styles.spinner} aria-hidden="true" />
              <p>Loading articles…</p>
            </div>
          )}

          {!loading && error && (
            <div className={styles.stateBox} role="alert">
              <p className={styles.errorText}>{error}</p>
              <button className={styles.retryBtn} onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          )}

          {!loading && !error && displayed.length === 0 && (
            <div className={styles.stateBox}>
              <p className={styles.emptyText}>
                {searchQuery
                  ? `No articles found for "${searchQuery}".`
                  : `No articles in "${activeChip.label}" yet.`}
              </p>
              <button className={styles.retryBtn} onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}

          {!loading && !error && displayed.length > 0 && (
            <div className={styles.grid}>
              {displayed.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          )}

        </div>
      </section>

    </main>
  );
}
