import { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import styles from './Home.module.css';

/* ── Data ────────────────────────────────────────────────────── */
const POPULAR_SEARCHES = [
  'Work from home', 'Part-time', 'Customer Service', 'Data Analyst',
  'Delivery Driver', 'Engineering', 'IT', 'Marketing', 'Medical',
  'Nurse', 'Project Manager', 'Sales', 'Warehouse', 'Welder',
];

const ADVICE_FILTERS = ['Resume', 'Cover Letter', 'News & Market Insights', 'Interviews'];

const ARTICLES = [
  {
    id: 1,
    category: 'RESUME',
    title: '7 Resume Mistakes That Cost You the Interview',
    author: 'Career Editor',
    date: 'May 2025',
  },
  {
    id: 2,
    category: 'INTERVIEWS',
    title: 'How to Answer "Tell Me About Yourself" Confidently',
    author: 'Career Editor',
    date: 'April 2025',
  },
  {
    id: 3,
    category: 'COVER LETTER',
    title: 'Write a Cover Letter That Gets Read — and Responded To',
    author: 'Career Editor',
    date: 'March 2025',
  },
];

const JOB_CATEGORIES = [
  'Administrative', 'Customer Service', 'Engineering', 'Healthcare',
  'Information Technology', 'Marketing', 'Sales', 'Warehouse & Logistics',
];
const JOB_TITLES = [
  'Data Analyst', 'Delivery Driver', 'HR Manager', 'Marketing Manager',
  'Registered Nurse', 'Project Manager', 'Sales Associate', 'Web Developer',
];
const JOB_LOCATIONS = [
  'Chicago, IL', 'Dallas, TX', 'Houston, TX', 'Los Angeles, CA',
  'Miami, FL', 'New York, NY', 'San Francisco, CA', 'Seattle, WA',
];

/* ── Search chip icon ────────────────────────────────────────── */
function ChipIcon() {
  return (
    <svg
      aria-hidden="true"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

/* ── Component ───────────────────────────────────────────────── */
export default function Home() {
  const [activeFilter, setActiveFilter] = useState('Resume');

  return (
    <main>

      {/* ── 1 & 2 Hero (dark purple) ────────────────────────────── */}
      <section className={styles.hero} aria-label="Job search hero">
        <div className={styles.heroInner}>
          <h1 className={styles.headline}>
            Find your <em className={styles.headlineEm}>next</em> job.
          </h1>

          <div className={styles.searchWrap}>
            <SearchBar />
          </div>

          <div className={styles.uploadPrompt}>
            <svg aria-hidden="true" className={styles.uploadIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
            <Link to="/register" className={styles.uploadLink}>Upload Your Resume</Link>
            <span className={styles.uploadText}> — Get noticed by top employers!</span>
          </div>

          <div className={styles.popularRow}>
            <span className={styles.popularLabel}>Popular Searches</span>
            <div className={styles.chips} role="list">
              {POPULAR_SEARCHES.map((term) => (
                <Link
                  key={term}
                  to={`/jobs?q=${encodeURIComponent(term)}`}
                  className={styles.chip}
                  role="listitem"
                >
                  <span className={styles.chipIcon}><ChipIcon /></span>
                  <span>{term}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 Resume Templates promo ────────────────────────────── */}
      <section id="resume-templates" className={styles.promoSection} aria-labelledby="resume-tpl-heading">
        <div className={styles.promoInner}>

          {/* CSS illustration */}
          <div className={styles.resumeStack} aria-hidden="true">
            <div className={styles.rCard3} />
            <div className={styles.rCard2} />
            <div className={styles.rCard1}>
              <div className={styles.rNameLine} />
              <div className={styles.rRoleLine} />
              <div className={styles.rDivider} />
              <div className={styles.rSection} />
              <div className={`${styles.rLine} ${styles.rLineL}`} />
              <div className={`${styles.rLine} ${styles.rLineM}`} />
              <div className={`${styles.rLine} ${styles.rLineS}`} />
              <div className={styles.rSection} style={{ marginTop: '0.5rem' }} />
              <div className={`${styles.rLine} ${styles.rLineL}`} />
              <div className={`${styles.rLine} ${styles.rLineM}`} />
            </div>
          </div>

          <div className={styles.promoText}>
            <h2 id="resume-tpl-heading" className={styles.promoHeading}>
              Professional Resume Templates
            </h2>
            <p className={styles.promoBody}>
              Choose from dozens of recruiter-approved designs. Land more interviews
              with a resume that makes you stand out from the crowd.
            </p>
            <a href="#resume-templates" className={styles.promoLink}>
              Browse Resume Templates →
            </a>
          </div>
        </div>
      </section>

      {/* ── 4 Resume Builder promo (reversed) ───────────────────── */}
      <section id="resume-builder" className={`${styles.promoSection} ${styles.promoSectionAlt}`} aria-labelledby="resume-build-heading">
        <div className={`${styles.promoInner} ${styles.promoInnerReverse}`}>

          <div className={styles.promoText}>
            <h2 id="resume-build-heading" className={styles.promoHeading}>
              Free Resume Builder
            </h2>
            <p className={styles.promoBody}>
              Answer a few questions and our builder writes your resume for you.
              No design skills needed — just land the interview.
            </p>
            <a href="#resume-builder" className={styles.promoLink}>
              Build Your Resume Free →
            </a>
          </div>

          {/* CSS builder illustration */}
          <div className={styles.builderIllustration} aria-hidden="true">
            <div className={styles.builderCard}>
              <div className={styles.builderBar}>
                <div className={styles.builderBarFill} />
              </div>
              <div className={styles.builderField} />
              <div className={styles.builderField} />
              <div className={styles.builderFieldHalf} />
              <div className={styles.builderActions}>
                <div className={styles.builderSkip} />
                <div className={styles.builderNext} />
              </div>
            </div>
            <div className={styles.builderPreview}>
              <div className={styles.rNameLine} />
              <div className={styles.rRoleLine} />
              <div className={styles.rDivider} />
              {[95, 80, 70, 90, 60].map((w, i) => (
                <div key={i} className={styles.rLine} style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5 Career advice ─────────────────────────────────────── */}
      <section id="advice" className={styles.adviceSection} aria-labelledby="advice-heading">
        <div className={styles.adviceInner}>
          <h2 id="advice-heading" className={styles.adviceHeading}>
            Career Advice to Win Your Job Search
          </h2>

          <div className={styles.adviceFilters} role="tablist" aria-label="Article categories">
            {ADVICE_FILTERS.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={activeFilter === f}
                className={`${styles.filterPill} ${activeFilter === f ? styles.filterPillActive : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className={styles.adviceGrid}>
            {ARTICLES.map((a) => (
              <article key={a.id} className={styles.adviceCard}>
                <div className={styles.adviceCardImg} aria-hidden="true" />
                <div className={styles.adviceCardBody}>
                  <span className={styles.adviceCategory}>{a.category}</span>
                  <h3 className={styles.adviceTitle}>{a.title}</h3>
                  <div className={styles.adviceMeta}>
                    <span>{a.author}</span>
                    <span className={styles.adviceDot}>·</span>
                    <span>{a.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.adviceCta}>
            <Link to="/jobs" className={styles.adviceCtaBtn}>
              See All Career Advice
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6 Get the app banner ────────────────────────────────── */}
      <section className={styles.appSection} aria-labelledby="app-heading">
        <div className={styles.appInner}>
          <div className={styles.appText}>
            <h2 id="app-heading" className={styles.appHeading}>Get the app.</h2>
            <p className={styles.appSub}>
              Search and apply for jobs wherever you are.
              Available on iOS and Android.
            </p>
            <div className={styles.appBtns}>
              <a href="#" className={styles.appBtn} aria-label="Download on the App Store">
                <span className={styles.appBtnMark}>&#9670;</span>
                <span className={styles.appBtnWords}>
                  <span className={styles.appBtnLine1}>Download on the</span>
                  <span className={styles.appBtnLine2}>App Store</span>
                </span>
              </a>
              <a href="#" className={styles.appBtn} aria-label="Get it on Google Play">
                <span className={styles.appBtnMark}>&#9654;</span>
                <span className={styles.appBtnWords}>
                  <span className={styles.appBtnLine1}>Get it on</span>
                  <span className={styles.appBtnLine2}>Google Play</span>
                </span>
              </a>
            </div>
          </div>

          {/* CSS phone mockup */}
          <div className={styles.phoneMockup} aria-hidden="true">
            <div className={styles.phoneNotch} />
            <div className={`${styles.phoneLine} ${styles.phoneLineLg}`} />
            <div className={`${styles.phoneLine} ${styles.phoneLineMd}`} />
            <div className={styles.phoneCard}>
              <div className={styles.phoneCardLine} />
              <div className={`${styles.phoneCardLine} ${styles.phoneCardLineSm}`} />
            </div>
            <div className={styles.phoneCard}>
              <div className={styles.phoneCardLine} />
              <div className={`${styles.phoneCardLine} ${styles.phoneCardLineSm}`} />
            </div>
            <div className={`${styles.phoneLine} ${styles.phoneLineSm}`} />
          </div>
        </div>
      </section>

      {/* ── 7 Popular & trending jobs ────────────────────────────── */}
      <section className={styles.trendingSection} aria-labelledby="trending-heading">
        <div className={styles.trendingInner}>
          <h2 id="trending-heading" className={styles.trendingHeading}>
            Browse Popular &amp; Trending Jobs
          </h2>

          <div className={styles.trendingGrid}>
            <div className={styles.trendingCol}>
              <h3 className={styles.trendingColTitle}>Jobs by Categories</h3>
              <ul className={styles.trendingList}>
                {JOB_CATEGORIES.map((c) => (
                  <li key={c}>
                    <Link to={`/jobs?q=${encodeURIComponent(c)}`} className={styles.trendingLink}>
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.trendingCol}>
              <h3 className={styles.trendingColTitle}>Jobs by Titles</h3>
              <ul className={styles.trendingList}>
                {JOB_TITLES.map((t) => (
                  <li key={t}>
                    <Link to={`/jobs?q=${encodeURIComponent(t)}`} className={styles.trendingLink}>
                      {t}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.trendingCol}>
              <h3 className={styles.trendingColTitle}>Jobs by Locations</h3>
              <ul className={styles.trendingList}>
                {JOB_LOCATIONS.map((l) => (
                  <li key={l}>
                    <Link
                      to={`/jobs?location=${encodeURIComponent(l)}`}
                      className={styles.trendingLink}
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8 Student / help section ─────────────────────────────── */}
      <section className={styles.studentSection} aria-labelledby="student-heading">
        <div className={styles.studentInner}>

          {/* CSS placeholder illustration */}
          <div className={styles.studentIllustration} aria-hidden="true">
            <div className={styles.studentFigure}>
              <div className={styles.studentHead} />
              <div className={styles.studentBody}>
                <div className={styles.studentBodyLine} />
                <div className={`${styles.studentBodyLine} ${styles.studentBodyLineShort}`} />
              </div>
            </div>
            <div className={styles.studentDeco1} />
            <div className={styles.studentDeco2} />
          </div>

          <div className={styles.studentCtas}>
            <h2 id="student-heading" className={styles.studentHeading}>
              Tools to Launch Your Career
            </h2>
            <a href="#" className={styles.studentCta}>
              <span className={styles.studentCtaTitle}>Visit the Student Career Center</span>
              <span className={styles.studentCtaArrow}>→</span>
            </a>
            <Link to="/jobs?q=salary" className={styles.studentCta}>
              <span className={styles.studentCtaTitle}>Search Salaries</span>
              <span className={styles.studentCtaArrow}>→</span>
            </Link>
            <Link to="/jobs?q=entry+level" className={styles.studentCta}>
              <span className={styles.studentCtaTitle}>Search Entry-Level Jobs</span>
              <span className={styles.studentCtaArrow}>→</span>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
