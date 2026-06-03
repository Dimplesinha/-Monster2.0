import styles from './Footer.module.css';

const SEEKERS = [
  { label: 'Find Jobs', href: '/jobs' },
  { label: 'Career Advice', href: '/career-advice' },
  { label: 'Community Blogs', href: '/blogs' },
  { label: 'Resume Templates', href: '#resume-templates' },
  { label: 'Resume Builder', href: '#resume-builder' },
  { label: 'Salary Tools', href: '#salary' },
  { label: 'Entry-Level Jobs', href: '/jobs?q=entry+level' },
];

const EMPLOYERS = [
  { label: 'Post a Job', href: '/post-job' },
  { label: 'Create Account', href: '/register?role=employer' },
  { label: 'Employer Dashboard', href: '/dashboard' },
  { label: 'Recruitment Plans', href: '#' },
  { label: 'Hiring Resources', href: '#' },
];

const RESOURCES = [
  { label: 'About Monster', href: '#' },
  { label: 'Help Centre', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Use', href: '#' },
  { label: 'Accessibility', href: '#' },
  { label: 'Sitemap', href: '#' },
];

const SOCIAL = [
  { label: 'LinkedIn', char: 'in' },
  { label: 'Facebook', char: 'f' },
  { label: 'X', char: 'X' },
  { label: 'Instagram', char: '◻' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>

      {/* Locale row */}
      <div className={styles.locale}>
        <div className={styles.localeInner}>
          <span className={styles.localeIcon}>🌐</span>
          <span className={styles.localeText}>United States</span>
          <span className={styles.localeChevron}>▾</span>
        </div>
      </div>

      {/* Main columns */}
      <div className={styles.columns}>

        <div className={styles.col}>
          <p className={styles.colHead}>For Job Seekers</p>
          <ul className={styles.colList}>
            {SEEKERS.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className={styles.colLink}>{label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <p className={styles.colHead}>For Employers</p>
          <ul className={styles.colList}>
            {EMPLOYERS.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className={styles.colLink}>{label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <p className={styles.colHead}>Helpful Resources</p>
          <ul className={styles.colList}>
            {RESOURCES.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className={styles.colLink}>{label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Social + app column */}
        <div className={styles.col}>
          <p className={styles.colHead}>Follow Us</p>
          <div className={styles.social}>
            {SOCIAL.map(({ label, char }) => (
              <a key={label} href="#" className={styles.socialIcon} aria-label={label}>
                {char}
              </a>
            ))}
          </div>

          <p className={styles.colHead} style={{ marginTop: '1.75rem' }}>Get the App</p>
          <div className={styles.appBtns}>
            <a href="#" className={styles.appBtn} aria-label="Download on the App Store">
              <span className={styles.appBtnLogo}>&#9670;</span>
              <span className={styles.appBtnText}>
                <span className={styles.appBtnSub}>Download on the</span>
                <span className={styles.appBtnStore}>App Store</span>
              </span>
            </a>
            <a href="#" className={styles.appBtn} aria-label="Get it on Google Play">
              <span className={styles.appBtnLogo}>&#9654;</span>
              <span className={styles.appBtnText}>
                <span className={styles.appBtnSub}>Get it on</span>
                <span className={styles.appBtnStore}>Google Play</span>
              </span>
            </a>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <p className={styles.copy}>
          &copy; {new Date().getFullYear()} Monster. All rights reserved.
        </p>
        <nav className={styles.bottomLinks} aria-label="Legal navigation">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Accessibility</a>
          <a href="#">Do Not Sell My Info</a>
        </nav>
      </div>

    </footer>
  );
}
