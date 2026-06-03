import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import styles from './SalaryResult.module.css';

/* ── Helpers ─────────────────────────────────────────────────────── */
const HOURS_PER_YEAR = 2080; // 52 weeks × 40 hours

function formatCurrency(amount, currency = 'INR', isHourly = false) {
  const val    = isHourly ? Math.round(amount / HOURS_PER_YEAR) : amount;
  const symbol = currency === 'INR' ? '₹' : '$';
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return `${symbol}${val.toLocaleString(locale)}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

/* ── Salary Range Bar ────────────────────────────────────────────── */
function SalaryRangeBar({ min, median, avg, max, estimated, currency, isHourly }) {
  const span = max - min || 1;

  const avgPct      = ((avg       - min) / span) * 100;
  const medianPct   = ((median    - min) / span) * 100;
  const estimatedPct = estimated != null ? Math.min(Math.max(((estimated - min) / span) * 100, 0), 100) : null;

  return (
    <div className={styles.rangeWrap} aria-label="Salary range visualization">
      {/* Track */}
      <div className={styles.track}>
        {/* Filled range (min → max) */}
        <div className={styles.fill} />

        {/* Average marker (diamond) */}
        <div
          className={styles.avgMarker}
          style={{ left: `${avgPct}%` }}
          title={`Average: ${formatCurrency(avg, currency, isHourly)}`}
        >
          <div className={styles.avgDiamond} />
          <div className={styles.avgLabel}>Avg</div>
        </div>

        {/* Median tick */}
        <div
          className={styles.medianTick}
          style={{ left: `${medianPct}%` }}
          title={`Median: ${formatCurrency(median, currency, isHourly)}`}
        />

        {/* Estimated salary marker (amber triangle) */}
        {estimatedPct != null && (
          <div
            className={styles.estimatedMarker}
            style={{ left: `${estimatedPct}%` }}
            title={`Your Estimate: ${formatCurrency(estimated, currency, isHourly)}`}
          >
            <div className={styles.estimatedTriangle} />
            <div className={styles.estimatedLabel}>You</div>
          </div>
        )}
      </div>

      {/* Scale labels */}
      <div className={styles.scaleRow}>
        <span className={styles.scaleLabel} style={{ left: '0%' }}>
          {formatCurrency(min, currency, isHourly)}
        </span>
        <span className={styles.scaleLabel} style={{ left: `${medianPct}%`, transform: 'translateX(-50%)' }}>
          {formatCurrency(median, currency, isHourly)}
        </span>
        <span className={styles.scaleLabel} style={{ right: '0%' }}>
          {formatCurrency(max, currency, isHourly)}
        </span>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDiamond} /> Average salary
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendTick} /> Median salary
        </span>
        {estimatedPct != null && (
          <span className={styles.legendItem}>
            <span className={styles.legendTriangle} /> Your estimate
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Metric card ─────────────────────────────────────────────────── */
function MetricCard({ label, value, highlight }) {
  return (
    <div className={`${styles.metricCard} ${highlight ? styles.metricCardHighlight : ''}`}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>{value}</p>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function SalaryResult() {
  const [searchParams]     = useSearchParams();
  const navigate           = useNavigate();
  const jobTitle   = searchParams.get('jobTitle')   || '';
  const location   = searchParams.get('location')   || '';
  const experience = Number(searchParams.get('experience') ?? 3);

  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [isHourly, setIsHourly] = useState(false);

  useEffect(() => {
    if (!jobTitle || !location) { navigate('/salary-calculator', { replace: true }); return; }

    setLoading(true);
    setError('');

    api.post('/salary/search', { jobTitle, location })
      .then(({ data: d }) => setData(d))
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load salary data. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [jobTitle, location, navigate]);

  /* ── Loading state ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className={styles.statePage}>
        <div className={styles.spinner} aria-label="Loading…" />
        <p className={styles.stateText}>Fetching salary data…</p>
      </div>
    );
  }

  /* ── Error / not found ─────────────────────────────────────────── */
  if (error || !data) {
    return (
      <div className={styles.statePage}>
        <div className={styles.errorIcon}>!</div>
        <h2 className={styles.stateHeading}>No salary data found</h2>
        <p className={styles.stateText}>{error || 'No results for that search.'}</p>
        <div className={styles.stateActions}>
          <Link to="/salary-calculator" className={styles.btnPrimary}>
            Try a New Search
          </Link>
          <Link to="/jobs" className={styles.btnOutline}>Browse Jobs</Link>
        </div>
      </div>
    );
  }

  const { averageSalary, minSalary, medianSalary, maxSalary, currency, source, lastUpdated,
          fallback, requestedLocation } = data;
  const fmt = (v) => formatCurrency(v, currency, isHourly);

  // Formula interpolation: t = min(years/15, 1), estimated = min + (max - min) * t
  const t         = Math.min(experience / 15, 1);
  const estimated = Math.round(minSalary + (maxSalary - minSalary) * t);
  const expLabel  = experience === 0 ? 'Fresher' : `${experience} yr${experience === 1 ? '' : 's'}`;

  return (
    <div className={styles.page}>

      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/salary-calculator">Salary Calculator</Link>
        <span aria-hidden="true"> / </span>
        <span>{data.jobTitle}</span>
      </nav>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>
          Salary of a <span className={styles.titleHighlight}>{data.jobTitle}</span>{' '}
          in <span className={styles.titleHighlight}>{data.location}</span>
        </h1>
        <p className={styles.dataMeta}>
          Source: {source} &nbsp;·&nbsp; Last updated: {formatDate(lastUpdated)}
        </p>
      </header>

      {/* ── Location fallback notice ────────────────────────────── */}
      {fallback && (
        <div className={styles.fallbackNotice} role="alert">
          <span className={styles.fallbackIcon}>ℹ️</span>
          <p className={styles.fallbackText}>
            No salary data found specifically for <strong>{requestedLocation}</strong>.
            Showing data for <strong>{data.location}</strong> as the closest available market.
            {' '}<Link to="/salary-calculator" className={styles.fallbackLink}>Try a different city →</Link>
          </p>
        </div>
      )}

      {/* ── Yearly / Hourly toggle ───────────────────────────────── */}
      <div className={styles.toggleWrap} role="group" aria-label="Salary period">
        <button
          className={`${styles.toggleBtn} ${!isHourly ? styles.toggleBtnActive : ''}`}
          onClick={() => setIsHourly(false)}
          aria-pressed={!isHourly}
        >
          Per Year
        </button>
        <button
          className={`${styles.toggleBtn} ${isHourly ? styles.toggleBtnActive : ''}`}
          onClick={() => setIsHourly(true)}
          aria-pressed={isHourly}
        >
          Per Hour
        </button>
      </div>

      {/* ── Estimated salary highlight ───────────────────────────── */}
      <div className={styles.estimatedBanner}>
        <div className={styles.estimatedBannerLeft}>
          <span className={styles.estimatedBannerTag}>Your Estimated Salary</span>
          <p className={styles.estimatedBannerSub}>Based on {expLabel} of experience</p>
        </div>
        <div className={styles.estimatedBannerRight}>
          <span className={styles.estimatedBannerAmount}>{fmt(estimated)}</span>
          <span className={styles.estimatedBannerPeriod}>{isHourly ? '/hr' : '/yr'}</span>
        </div>
      </div>

      {/* ── Metric cards ────────────────────────────────────────── */}
      <div className={styles.metricsGrid}>
        <MetricCard label="Average Salary" value={fmt(averageSalary)} highlight />
        <MetricCard label="Minimum Salary" value={fmt(minSalary)} />
        <MetricCard label="Median Salary"  value={fmt(medianSalary)} />
        <MetricCard label="Maximum Salary" value={fmt(maxSalary)} />
      </div>

      {/* ── Range bar ───────────────────────────────────────────── */}
      <div className={styles.rangeCard}>
        <h2 className={styles.rangeTitle}>Salary Range</h2>
        <SalaryRangeBar
          min={minSalary}
          median={medianSalary}
          avg={averageSalary}
          max={maxSalary}
          estimated={estimated}
          currency={currency}
          isHourly={isHourly}
        />
      </div>

      {/* ── Insight note ────────────────────────────────────────── */}
      <div className={styles.insightBox}>
        <p>
          With <strong>{expLabel}</strong> of experience, your estimated salary as a{' '}
          {data.jobTitle} in {data.location} is{' '}
          <strong>{fmt(estimated)}{isHourly ? '/hr' : '/yr'}</strong>.
          The market average is <strong>{fmt(averageSalary)}{isHourly ? '/hr' : '/yr'}</strong>, with top
          earners making up to <strong>{fmt(maxSalary)}{isHourly ? '/hr' : '/yr'}</strong>.
          {isHourly && ` Hourly rates are estimated from annual salary ÷ ${HOURS_PER_YEAR.toLocaleString()} hours.`}
        </p>
      </div>

      {/* ── Actions ─────────────────────────────────────────────── */}
      <div className={styles.actions}>
        <button className={styles.btnOutline} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <Link to="/salary-calculator" className={styles.btnPrimary}>
          New Search
        </Link>
        <Link to="/jobs" className={styles.btnSecondary}>
          Find Jobs →
        </Link>
      </div>
    </div>
  );
}
