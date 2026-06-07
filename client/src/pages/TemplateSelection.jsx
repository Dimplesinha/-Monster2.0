import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ResumePreview from '../components/ResumePreview';
import styles from './TemplateSelection.module.css';

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

export default function TemplateSelection() {
  const navigate  = useNavigate();
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('selectedTemplate');
      if (stored) setTemplate(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const handleNext = () => navigate('/resume-builder/upload');

  const steps = [
    { num: 1, done: true,  text: "You've already chosen a resume template!" },
    { num: 2, done: false, text: 'Next, build your resume with our industry-specific bullet points' },
    { num: 3, done: false, text: 'Download your resume, print it out and get it ready to send!' },
  ];

  return (
    <div className={styles.page}>
      {/* ── Top bar ───────────────────────────────────────────────── */}
      <header className={styles.topBar}>
        <Link to="/" className={styles.wordmark}>Monster</Link>
        <Link to="/resume/templates" className={styles.backLink}>← Back to Templates</Link>
      </header>

      <main className={styles.main}>
        {/* Left — Steps */}
        <div className={styles.stepsCol}>
          <h1 className={styles.stepsTitle}>Just two more easy steps</h1>
          <ol className={styles.stepsList}>
            {steps.map((step) => (
              <li key={step.num} className={styles.stepItem}>
                <div className={`${styles.stepCircle} ${step.done ? styles.stepCircleDone : ''}`}>
                  {step.done ? <CheckIcon /> : step.num}
                </div>
                <span className={`${styles.stepText} ${step.done ? styles.stepTextDone : ''}`}>{step.text}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Right — Selected template preview */}
        <div className={styles.previewCol}>
          {template ? (
            <>
              <div className={styles.previewOuter}>
                <div className={styles.previewScaler}>
                  <ResumePreview template={template} useSample />
                </div>
              </div>
              <button
                className={styles.changeLink}
                onClick={() => navigate('/resume/templates')}
              >
                Change template
              </button>
              <button className={styles.nextBtn} onClick={handleNext}>Next</button>
              <p className={styles.legal}>
                By clicking "Next" or "Change template", you agree to our{' '}
                <Link to="/terms">Terms of Use</Link> and <Link to="/privacy">Privacy Policy</Link>.
              </p>
            </>
          ) : (
            <div className={styles.noTemplate}>
              <p>No template selected.</p>
              <Link to="/resume/templates" className={styles.nextBtn}>Browse Templates</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
