import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ResumePreview from './ResumePreview';
import styles from './TemplatePreviewModal.module.css';

export default function TemplatePreviewModal({ template, templates, onClose, onNavigate, isPremiumUser, onUpgrade }) {
  const navigate   = useNavigate();
  const modalRef   = useRef(null);
  const currentIdx = templates ? templates.findIndex((t) => t._id === template._id) : -1;
  const hasPrev    = currentIdx > 0;
  const hasNext    = currentIdx < (templates?.length ?? 0) - 1;

  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /* Click outside */
  const handleBackdrop = (e) => { if (e.target === modalRef.current) onClose(); };

  const handleCustomize = () => {
    if (template.isPremium && !isPremiumUser) { onClose(); onUpgrade?.(); return; }
    localStorage.setItem('selectedTemplate', JSON.stringify(template));
    onClose();
    navigate('/resume-builder/template-selection');
  };

  const levelColor = (level) => {
    const map = { Entry: '#16a34a', 'Mid-Level': '#2563eb', Senior: '#7c3aed', Executive: '#dc2626', 'All Levels': '#6b7280' };
    return map[level] || '#6b7280';
  };

  return (
    <div className={styles.backdrop} ref={modalRef} onClick={handleBackdrop} role="dialog" aria-modal="true" aria-label={`Preview: ${template.name}`}>
      <div className={styles.modal}>

        {/* Close */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close preview">✕</button>

        {/* Left — large preview */}
        <div className={styles.previewSide}>

          {/* Prev arrow */}
          {hasPrev && (
            <button className={`${styles.navArrow} ${styles.navArrowLeft}`} onClick={() => onNavigate(templates[currentIdx - 1])} aria-label="Previous template">‹</button>
          )}

          {/* Scaled resume preview */}
          <div className={styles.previewOuter}>
            <div className={styles.previewScaler}>
              <ResumePreview template={template} useSample />
            </div>
          </div>

          {/* Next arrow */}
          {hasNext && (
            <button className={`${styles.navArrow} ${styles.navArrowRight}`} onClick={() => onNavigate(templates[currentIdx + 1])} aria-label="Next template">›</button>
          )}

          {/* Template counter */}
          {templates && (
            <div className={styles.counter}>{currentIdx + 1} / {templates.length}</div>
          )}
        </div>

        {/* Right — details */}
        <div className={styles.detailSide}>
          <h2 className={styles.templateName}>{template.name} Resume Template</h2>

          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Color Name</span>
              <span className={styles.detailValue}>
                {template.colorName}
                <span className={styles.colorDot} style={{ background: template.accentColor }} />
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Font Family</span>
              <span className={styles.detailValue}>{template.fontFamily?.split(',')[0] || '—'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Layout</span>
              <span className={styles.detailValue}>{layoutLabel(template.layout)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Style</span>
              <span className={styles.detailValue}>{template.style}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Experience Level</span>
              <span className={styles.detailValue} style={{ color: levelColor(template.experienceLevel), fontWeight: 700 }}>
                {template.experienceLevel}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Career Category</span>
              <span className={styles.detailValue}>{template.category?.slice(0, 2).join(', ')}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>ATS Score</span>
              <span className={styles.detailValue}>
                <span className={styles.atsScore}>{template.atsScore}%</span>
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Plan</span>
              <span className={styles.detailValue}>
                {template.isPremium
                  ? <span className={styles.premiumBadge}>Premium</span>
                  : <span className={styles.freeBadge}>Free</span>}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.customizeBtn} onClick={handleCustomize}>
              Customize This Template
            </button>
            <button className={styles.secondaryBtn} onClick={() => window.print()}>
              ↓ Download Sample PDF
            </button>
          </div>

          {/* Tags */}
          {template.tags?.length > 0 && (
            <div className={styles.tagRow}>
              {template.tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function layoutLabel(layout) {
  const map = {
    'classic':      'One Column',
    'modern-left':  'Two Column (Left Sidebar)',
    'modern-right': 'Two Column (Right Sidebar)',
    'header-band':  'Header Band',
  };
  return map[layout] || layout || '—';
}
