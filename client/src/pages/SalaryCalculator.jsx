import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './SalaryCalculator.module.css';

/* ── Static content sections ──────────────────────────────────────── */
const CONTENT_SECTIONS = [
  {
    id: 'potential',
    heading: 'Use Our Salary Calculator to Check Your Earning Potential',
    body: [
      'From the moment you build a resume to the final stages of interviewing and negotiation, knowing your earning potential ensures you\'re advocating for your true worth.',
      'When your salary aligns with your worth, it boosts both your job satisfaction and commitment to your company\'s goals. But how do you know if you\'re earning what you deserve?',
      'Talking about money can feel uncomfortable, but in the quest for the right job we all have to do it. Empowering yourself with market knowledge gives you the confidence to advocate for your worth. That\'s where our simple salary comparison calculator comes in.',
      'Simply enter your job title to discover the average salary and range for your role – nationally or in your region, whether you need to:',
    ],
    bullets: [
      'answer the dreaded "what are your salary expectations?" question',
      'know if your current or proposed salary reflects industry standards',
      'prepare for salary negotiations for a promotion or new job',
    ],
  },
  {
    id: 'highest-paying',
    heading: 'Discover the Highest Paying Jobs',
    body: [
      'Understanding salary comparison data isn\'t just about the raw numbers. Your skills, experience and qualifications also play a significant role in how you\'re compensated. If you\'re targeting higher-paying roles, updating your resume with role-specific resume templates can help highlight the skills and qualifications employers expect at that level.',
      'Knowing your top earning potential can help you negotiate as well as plan for future progression. Perhaps you need to invest in further training, build some soft skills, or learn new technology to target that higher end salary. Take this opportunity to explore the roles that pay top dollar to help you set career goals.',
    ],
  },
  {
    id: 'negotiation',
    heading: 'The Importance of Salary Negotiation',
    body: [
      'If the salary calculator indicates that you\'re earning less than what your skills and experience justify, it may be time for a salary negotiation. Never go in blind though. Instead, do your research to strengthen your case.',
      'Explore job salaries in your industry with our salary comparison tool to see how your pay stacks up against others in similar roles. Take this, along with evidence that quantifies your impact on your company\'s objectives, into negotiations.',
    ],
  },
  {
    id: 'negotiate-offer',
    heading: 'How to Negotiate a Salary Offer',
    body: [
      'When you receive a job offer, take note of the salary. If you don\'t negotiate at this stage, you could be leaving money on the table. Come back to our salary calculator to research pay ranges for similar roles. After expressing gratitude for the offer, present your research and highlight your experience to justify a higher salary.',
      'Be specific about your desired salary range while remaining flexible. Aim for a fair and mutually beneficial agreement. If the salary offer doesn\'t align with your expectations, it may be best to continue your job search.',
    ],
  },
  {
    id: 'current-job',
    heading: 'How to Negotiate Salary in Your Current Job',
    body: [
      'If you\'re happy in your current job but feel you deserve a raise, you still need to come with a compelling case based on factual salary data. If you\'ve taken on additional duties without an official promotion, search for salaries for jobs that reflect your responsibilities. Add this to your achievements, contributions, and performance metrics to strengthen your position.',
      'Consider waiting until after a major accomplishment, such as completing a big project or receiving excellent performance feedback. Your annual performance review or after a successful fiscal year are also perfect opportunities to enter negotiations since companies are typically more open to adjusting salaries at these times.',
    ],
  },
  {
    id: 'expectations',
    heading: 'How to Answer: "What are Your Salary Expectations?"',
    body: [
      'When asked about salary expectations, you need to be strategic. Answer with specifics instead of allowing the employer to choose the figure. Use your research from our salary comparison tool to provide a range.',
      'Think about where you fit in that range considering your unique skills and experience. Then offer your own band to the employer. Now you can confidently enter negotiations prepared to ask for fair compensation.',
    ],
    footer: 'Start your salary search today and take control of your earning potential!',
  },
];

/* ── Icons ─────────────────────────────────────────────────────────── */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

/* ── Page ───────────────────────────────────────────────────────────── */
export default function SalaryCalculator() {
  const navigate = useNavigate();
  const [jobTitle,    setJobTitle]    = useState('');
  const [location,    setLocation]    = useState('');
  const [experience,  setExperience]  = useState(3);
  const [errors,      setErrors]      = useState({});

  const validate = () => {
    const e = {};
    if (!jobTitle.trim())  e.jobTitle  = 'Please enter a job title.';
    if (!location.trim())  e.location  = 'Please enter a location.';
    return e;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({});
    const params = new URLSearchParams({
      jobTitle: jobTitle.trim(),
      location: location.trim(),
      experience: String(experience),
    });
    navigate(`/salary-calculator/result?${params}`);
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleSearch(e); };

  const expLabel = experience === 0 ? 'Fresher (< 1 year)' : `${experience} year${experience === 1 ? '' : 's'} experience`;

  return (
    <div className={styles.page}>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroLeft}>
          <h1 id="hero-heading" className={styles.heroTitle}>Calculate Your Salary</h1>
          <p className={styles.heroSub}>Get paid what you're worth<br />in today's job market</p>
        </div>

        <div className={styles.heroRight}>
          <form className={styles.searchForm} onSubmit={handleSearch} noValidate>
            <div className={styles.fieldWrap}>
              <span className={styles.fieldIcon}><SearchIcon /></span>
              <input
                type="text"
                className={`${styles.field} ${errors.jobTitle ? styles.fieldError : ''}`}
                placeholder="Job Title"
                value={jobTitle}
                onChange={(e) => { setJobTitle(e.target.value); setErrors((v) => ({ ...v, jobTitle: '' })); }}
                onKeyDown={handleKey}
                aria-label="Job title"
                aria-describedby={errors.jobTitle ? 'err-title' : undefined}
              />
              {errors.jobTitle && <span id="err-title" className={styles.errMsg}>{errors.jobTitle}</span>}
            </div>

            <div className={styles.fieldWrap}>
              <span className={styles.fieldIcon}><MapPinIcon /></span>
              <input
                type="text"
                className={`${styles.field} ${errors.location ? styles.fieldError : ''}`}
                placeholder="Location (city, state)"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setErrors((v) => ({ ...v, location: '' })); }}
                onKeyDown={handleKey}
                aria-label="Location"
                aria-describedby={errors.location ? 'err-loc' : undefined}
              />
              {errors.location && <span id="err-loc" className={styles.errMsg}>{errors.location}</span>}
            </div>

            {/* ── Experience slider ──────────────────────────── */}
            <div className={styles.sliderWrap}>
              <div className={styles.sliderHeader}>
                <label htmlFor="exp-slider" className={styles.sliderLabel}>Years of Experience</label>
                <span className={styles.sliderValue}>{expLabel}</span>
              </div>
              <input
                id="exp-slider"
                type="range"
                min="0"
                max="20"
                step="1"
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                className={styles.slider}
                aria-label={`Years of experience: ${expLabel}`}
              />
              <div className={styles.sliderTicks}>
                <span>0</span>
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn}>
              Find Salary
            </button>
          </form>
        </div>
      </section>

      {/* ── Content sections ──────────────────────────────────── */}
      <article className={styles.contentWrap}>
        {CONTENT_SECTIONS.map((sec) => (
          <section key={sec.id} className={styles.contentSection} id={sec.id}>
            <h2 className={styles.sectionHeading}>{sec.heading}</h2>
            {sec.body.map((para, i) => (
              <p key={i} className={styles.sectionPara}>{para}</p>
            ))}
            {sec.bullets && (
              <ul className={styles.sectionList}>
                {sec.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            )}
            {sec.footer && <p className={styles.sectionFooter}>{sec.footer}</p>}
          </section>
        ))}

        <div className={styles.ctaBlock}>
          <Link to="/jobs" className={styles.ctaLink}>Browse Open Jobs →</Link>
        </div>
      </article>
    </div>
  );
}
