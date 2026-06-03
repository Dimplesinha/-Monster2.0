import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './EmployerPricing.module.css';

/* ── Employer Navbar ────────────────────────────────────────── */
function EmployerNav() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handlePostJob = () => {
    if (user?.role === 'employer' || user?.role === 'admin') {
      navigate('/post-job');
    } else {
      navigate('/employer/register');
    }
  };

  const handleSignIn = () => navigate('/employer/register?tab=login');

  return (
    <header className={styles.empNav}>
      <div className={styles.empNavInner}>
        {/* Logo */}
        <Link to="/employer/pricing" className={styles.empNavLogo}>
          Monster<span className={styles.empNavLogoPlus}>+</span>
        </Link>

        {/* Center links */}
        <nav className={`${styles.empNavLinks} ${mobileOpen ? styles.empNavLinksOpen : ''}`}>
          <a href="#pricing" className={styles.empNavLink} onClick={() => setMobileOpen(false)}>Pricing</a>
          <a href="#features" className={styles.empNavLink} onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#" className={styles.empNavLink} onClick={() => setMobileOpen(false)}>Help Center</a>
        </nav>

        {/* Right actions */}
        <div className={styles.empNavActions}>
          {user?.role === 'employer' || user?.role === 'admin' ? (
            <>
              <Link to="/dashboard" className={styles.empNavSignIn}>Dashboard</Link>
              <button onClick={() => navigate('/post-job')} className={styles.empNavPostBtn}>
                Post a Job
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSignIn} className={styles.empNavSignIn}>Sign In</button>
              <button onClick={handlePostJob} className={styles.empNavPostBtn}>
                Post a Job
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={styles.empNavHamburger}
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}

/* ── Feature check icon ─────────────────────────────────────── */
function CheckCircle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      className={styles.checkIcon}>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="9 12 11 14.5 15 10"/>
    </svg>
  );
}

/* ── Data ───────────────────────────────────────────────────── */
const PRO_FEATURES = [
  'Promoted job postings',
  'Published across our partner network of 500+ job sites',
  'View all applicants',
  'Automatically sent to relevant candidates',
  'Access Resume Search ($2/2 credits per resume view)',
  'Proactively message qualified candidates',
  'Unlimited user access',
  'Receive 299 credits each month used when candidates click your postings and/or when you view resumes',
];

const FEATURE_CARDS = [
  {
    title: 'Efficient Recruiting Process',
    desc: 'Promote your job posting and reach the most qualified job seekers. We\'ll share your job on our site, mobile app, and extensive network of job boards and partners.',
  },
  {
    title: 'Robust Resume Search',
    desc: 'Our Resume Builder helps job seekers create ATS-friendly resumes, making it easier for you to find the right fit. We\'ll notify you when your ideal candidate enters the database.',
  },
  {
    title: 'Effective Candidate Management',
    desc: 'Our easy-to-use dashboard helps you quickly review applications, provide a rating, and connect with candidates. We\'ll automatically send your jobs to candidates looking for similar roles.',
  },
  {
    title: 'Flexible, Performance-based Solution',
    desc: 'Our performance-based platform helps you find and evaluate candidates faster. Promote your jobs to reach the right candidates and proactively reach out to top prospects.',
  },
];

const VALUE_CARDS = [
  {
    title: 'Quality',
    desc: 'Discover top-tier candidates with ease. Quickly reach active, engaged candidates on our site, mobile app, and extensive partner network.',
  },
  {
    title: 'Flexibility',
    desc: 'Pick a monthly budget that fits your hiring needs and with Pro, use your credits to promote your job or search our expansive resume database.',
  },
  {
    title: 'Ease',
    desc: 'Easily post a job and expand your reach to active candidates. Our process is quick but effective, with tips to help you create a powerful posting along the way.',
  },
];

/* ── Toggle ─────────────────────────────────────────────────── */
function BillingToggle({ annual, onToggle }) {
  return (
    <div className={styles.toggleWrap}>
      <span className={`${styles.toggleLabel} ${!annual ? styles.toggleLabelActive : ''}`}>
        Monthly
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={annual}
        onClick={onToggle}
        className={`${styles.toggleSwitch} ${annual ? styles.toggleSwitchOn : ''}`}
      >
        <span className={styles.toggleThumb} />
      </button>
      <span className={`${styles.toggleLabel} ${annual ? styles.toggleLabelActive : ''}`}>
        Annually
        {!annual && <span className={styles.freeHint}> 2 Months Free*</span>}
      </span>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function EmployerPricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);

  const monthlyPrice = annual ? Math.round(299 * 10 / 12) : 299;

  const handleCta = () => {
    if (user?.role === 'employer' || user?.role === 'admin') {
      navigate('/post-job');
    } else {
      navigate('/employer/register');
    }
  };

  return (
    <div className={styles.page}>

      {/* ── Employer Navbar ───────────────────────────────────── */}
      <EmployerNav />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles.hero} aria-label="Employer hero">
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Make your next hire<br />with Monster+
          </h1>
          <p className={styles.heroSub}>
            Reach millions of job seekers across our network of top job sites and partners.
          </p>
          <button onClick={handleCta} className={styles.heroBtn}>
            POST A JOB
          </button>
        </div>
      </section>

      {/* ── Features (purple bg) ─────────────────────────────── */}
      <section id="features" className={styles.featuresSection} aria-labelledby="features-heading">
        <h2 id="features-heading" className={styles.featuresSectionTitle}>
          Hire the right candidates, faster.
        </h2>
        <div className={styles.featureGrid}>
          {FEATURE_CARDS.map((card) => (
            <div key={card.title} className={styles.featureCard}>
              <h3 className={styles.featureCardTitle}>{card.title}</h3>
              <p className={styles.featureCardDesc}>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Reach section ────────────────────────────────────── */}
      <section className={styles.reachSection}>
        <div className={styles.reachBanner}>
          <div className={styles.reachBannerOverlay} />
          <h2 className={styles.reachBannerTitle}>
            Promote your job and<br />expand your reach
          </h2>
        </div>
        <div className={styles.valueGrid}>
          {VALUE_CARDS.map((card) => (
            <div key={card.title} className={styles.valueCard}>
              <h3 className={styles.valueCardTitle}>{card.title}</h3>
              <div className={styles.valueCardLine} />
              <p className={styles.valueCardDesc}>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing card ─────────────────────────────────────── */}
      <section id="pricing" className={styles.pricingSection} aria-labelledby="pricing-heading">
        <h2 id="pricing-heading" className={styles.pricingHeading}>Choose your plan</h2>
        <div className={styles.planCard}>
          <div className={styles.popularBanner}>Most Popular</div>
          <div className={styles.planBody}>
            <h3 className={styles.planName}>Monster+ Pro</h3>
            <p className={styles.planTagline}>Promoted Jobs + Resume Search</p>
            <hr className={styles.planDivider} />
            <BillingToggle annual={annual} onToggle={() => setAnnual((v) => !v)} />
            <div className={styles.planPrice}>
              <span className={styles.priceAmount}>${monthlyPrice}</span>
              <span className={styles.pricePer}> /Monthly Subscription</span>
            </div>
            <div className={styles.planAccent} />
            <ul className={styles.featureList}>
              {PRO_FEATURES.map((f) => (
                <li key={f} className={styles.featureItem}>
                  <CheckCircle />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button onClick={handleCta} className={styles.planBtn}>
              Get Started Now
            </button>
          </div>
        </div>
        <p className={styles.pricingDisclaimer}>
          * Annual billing saves you 2 months compared to monthly. Prices shown in USD.
          Cancel anytime. No setup fees.
        </p>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Ready to find your next great hire?</h2>
        <p className={styles.ctaSub}>
          Join thousands of employers who trust Monster+ to connect with top talent.
        </p>
        <div className={styles.ctaBtns}>
          <button onClick={handleCta} className={styles.ctaBtnPrimary}>
            Post a Job Now
          </button>
          <button onClick={() => navigate('/employer/register')} className={styles.ctaBtnSecondary}>
            Create Free Account
          </button>
        </div>
      </section>

      {/* ── Employer footer ───────────────────────────────────── */}
      <footer className={styles.empFooter}>
        <span className={styles.empFooterLogo}>
          Monster<span className={styles.empFooterPlus}>+</span>
        </span>
        <p className={styles.empFooterText}>
          © {new Date().getFullYear()} Monster+. All rights reserved. Employer Portal.
        </p>
      </footer>

    </div>
  );
}
