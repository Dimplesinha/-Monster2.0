import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './ResumeUpload.module.css';

/* ── Constants ──────────────────────────────────────────────────── */
const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.rtf', '.txt'];
const ACCEPTED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
  'text/rtf',
  'text/plain',
];
const MAX_BYTES = 5 * 1024 * 1024;

/* ── Cloud provider config ───────────────────────────────────────── */
const CLOUD_PROVIDERS = [
  {
    id: 'google',
    label: 'Upload From Google Drive',
    envKey: 'VITE_GOOGLE_DRIVE_PICKER_KEY',
    icon: (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 87.3 78">
        <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L44 51 26.3 20l-19.7 34.1c-.7 1.2-1.1 2.5-1.1 3.9 0 2.8 1.4 5.4 3.85 7.2-.85 1.7-.85 1.7-.75 1.65z" fill="#0066da"/>
        <path d="M43.65 27l-17.35 30H78.9L61.6 27H43.65z" fill="#00ac47"/>
        <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.7-1.2 1.1-2.5 1.1-3.85 0-1.35-.4-2.65-1.1-3.85L66.95 20H43.65L61.6 51l17.95 25.8z" fill="#ea4335"/>
        <path d="M43.65 27H26.3L6.6 61.1c.7-1.2 1.1-2.5 1.1-3.85 0-1.35-.4-2.65-1.1-3.85L3.15 47.15c-.7 1.2-1.1 2.5-1.1 3.85 0 1.35.4 2.65 1.1 3.85L24.1 91.65c.7 1.2 1.85 2.05 3.1 2.05H60.2c1.25 0 2.4-.85 3.1-2.05L84.15 54.85c.7-1.2 1.1-2.5 1.1-3.85 0-1.35-.4-2.65-1.1-3.85L43.65 27z" fill="#00832d"/>
      </svg>
    ),
  },
  {
    id: 'dropbox',
    label: 'Upload From Dropbox',
    envKey: 'VITE_DROPBOX_APP_KEY',
    icon: (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 43.9 40">
        <path d="M11 0 0 7.1l11 7.1 11-7.1zm22 0-11 7.1 11 7.1 11-7.1zm-22 14.2L0 21.3l11 7.1 11-7.1zm22 0-11 7.1 11 7.1 11-7.1zM11 28.6 0 35.7l11 4.3 11-4.3zm22 0-11 7.1 11 4.3 11-4.3z" fill="#0061ff"/>
      </svg>
    ),
  },
  {
    id: 'onedrive',
    label: 'Upload From Microsoft OneDrive',
    envKey: 'VITE_ONEDRIVE_CLIENT_ID',
    icon: (
      <svg aria-hidden="true" width="22" height="16" viewBox="0 0 22 16">
        <path d="M13.2 6.8A5.5 5.5 0 0 0 8 3.5 5.5 5.5 0 0 0 2.6 7C1.1 7.4 0 8.7 0 10.3 0 12 1.3 13.4 3 13.5h15.8c1.5 0 2.7-1.2 2.7-2.7 0-1.4-1-2.5-2.3-2.7A4.6 4.6 0 0 0 13.2 6.8z" fill="#0078d4"/>
      </svg>
    ),
  },
];

/* ── Helpers ─────────────────────────────────────────────────────── */
function fileExtension(name) {
  return name.slice(name.lastIndexOf('.')).toLowerCase();
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

/* ── Cloud Upload illustration (CSS/SVG) ──────────────────────────  */
function CloudIllustration() {
  return (
    <svg
      className={styles.cloudIllustration}
      viewBox="0 0 120 80"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cloud shape */}
      <ellipse cx="60" cy="46" rx="40" ry="24" fill="#e9d5ff" />
      <circle cx="38" cy="50" r="18" fill="#e9d5ff" />
      <circle cx="82" cy="52" r="16" fill="#e9d5ff" />
      <circle cx="60" cy="36" r="22" fill="#ddd6fe" />
      {/* Upload arrow */}
      <line x1="60" y1="68" x2="60" y2="30" stroke="#6b21a8" strokeWidth="3" strokeLinecap="round"/>
      <polyline points="50,40 60,30 70,40" stroke="#6b21a8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Document lines */}
      <rect x="45" y="55" width="30" height="22" rx="3" fill="#7c3aed" opacity="0.15" />
      <line x1="50" y1="62" x2="70" y2="62" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <line x1="50" y1="67" x2="65" y2="67" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}

/* ── Upload dropzone ─────────────────────────────────────────────── */
function Dropzone({ onFile, disabled }) {
  const fileRef  = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const pick = (files) => {
    const file = files?.[0];
    if (file) onFile(file);
  };

  return (
    <div
      className={`${styles.dropzone} ${dragOver ? styles.dropzoneOver : ''} ${disabled ? styles.dropzoneDisabled : ''}`}
      onClick={() => !disabled && fileRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click(); }}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); if (!disabled) pick(e.dataTransfer.files); }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload resume — click or drop file here"
      aria-disabled={disabled}
    >
      <svg aria-hidden="true" className={styles.dropzoneIcon} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <span className={styles.dropzoneText}>
        Upload My Resume{' '}
        <span className={styles.dropzoneDim}>or drop files here</span>
      </span>
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(',')}
        className={styles.hiddenInput}
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => pick(e.target.files)}
        disabled={disabled}
      />
    </div>
  );
}

/* ── Success state ───────────────────────────────────────────────── */
function SuccessState({ resume, onReplace }) {
  const navigate = useNavigate();
  return (
    <div className={styles.successBox}>
      <div className={styles.successIcon} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>
      <div className={styles.checkCircle} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
          strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <p className={styles.successName}>{resume.originalName}</p>
      <p className={styles.successDate}>Uploaded {formatDate(resume.uploadedAt)}</p>
      <div className={styles.successBtns}>
        <button className={styles.continueBtn} onClick={() => navigate('/onboarding/contact-info')}>
          Continue →
        </button>
        <button className={styles.replaceBtn} onClick={onReplace}>
          Replace Resume
        </button>
      </div>
    </div>
  );
}

/* ── Cloud "not configured" modal ────────────────────────────────── */
function CloudModal({ provider, onClose }) {
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true"
      aria-label="Cloud import not configured" onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalIcon} aria-hidden="true">☁</div>
        <h2 className={styles.modalHeading}>Cloud import not configured</h2>
        <p className={styles.modalBody}>
          {provider} import is not set up yet. Upload your resume directly from your device instead.
        </p>
        <button className={styles.modalClose} onClick={onClose} autoFocus>
          Got it
        </button>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function ResumeUpload() {
  const { user } = useAuth();

  // Use resume already on account if present
  const [uploadedResume, setUploadedResume] = useState(
    user?.resume?.originalName ? user.resume : null
  );
  const [uploading, setUploading]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [error, setError]           = useState('');
  const [cloudModal, setCloudModal] = useState(null); // provider label string

  /* ── File validation (client-side guard) ───────────────────────── */
  const validateFile = (file) => {
    const ext = fileExtension(file.name);
    if (!ACCEPTED_EXTENSIONS.includes(ext) || !ACCEPTED_MIME.includes(file.type)) {
      return `Unsupported file type (${ext}). Accepted: ${ACCEPTED_EXTENSIONS.join(' ')}`;
    }
    if (file.size > MAX_BYTES) {
      return `File too large (${formatBytes(file.size)}). Maximum size is 5 MB.`;
    }
    return null;
  };

  /* ── Upload ────────────────────────────────────────────────────── */
  const handleFile = useCallback(async (file) => {
    const validationError = validateFile(file);
    if (validationError) { setError(validationError); return; }

    setError('');
    setProgress(0);
    setUploading(true);

    try {
      const form = new FormData();
      form.append('resume', file);

      const { data } = await api.post('/users/me/resume', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
        onUploadProgress: (evt) => {
          if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });

      setUploadedResume(data.resume);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Upload failed. Please try again.'
      );
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, []);

  /* ── Cloud button click ────────────────────────────────────────── */
  const handleCloudClick = (provider) => {
    // In future: check import.meta.env[provider.envKey] here and launch picker
    // For now: always show the "not configured" modal
    setCloudModal(provider.label.replace('Upload From ', ''));
  };

  const handleReplace = () => {
    setUploadedResume(null);
    setError('');
  };

  return (
    <div className={styles.pageWrapper}>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className={styles.topBar}>
        <Link to="/" className={styles.logo} aria-label="Monster home">Monster</Link>
        <span className={styles.topBarTitle}>Add Your Resume</span>
      </header>

      {/* ── Main card ───────────────────────────────────────────── */}
      <main className={styles.main}>
        <div className={styles.card}>

          {/* Illustration */}
          <CloudIllustration />

          <h1 className={styles.heading}>Add Your Resume</h1>
          <p className={styles.subtext}>
            Upload your resume to ensure employers can easily find you
          </p>

          {/* ── Success state ──────────────────────────────────── */}
          {uploadedResume ? (
            <SuccessState resume={uploadedResume} onReplace={handleReplace} />
          ) : (
            <>
              {/* Error banner */}
              {error && (
                <div className={styles.errorBanner} role="alert">{error}</div>
              )}

              {/* Upload progress */}
              {uploading && (
                <div className={styles.progressWrap} aria-live="polite">
                  <div className={styles.progressBar} style={{ width: `${progress}%` }} />
                  <span className={styles.progressLabel}>Uploading… {progress}%</span>
                </div>
              )}

              {/* Dropzone */}
              <Dropzone onFile={handleFile} disabled={uploading} />

              {/* Cloud options */}
              <div className={styles.cloudSection}>
                <span className={styles.orDivider} aria-hidden="true">— or —</span>
                <div className={styles.cloudBtns}>
                  {CLOUD_PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      className={styles.cloudBtn}
                      onClick={() => handleCloudClick(p)}
                      disabled={uploading}
                    >
                      <span className={styles.cloudBtnIcon}>{p.icon}</span>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Build My Resume */}
              <Link to="/resume-builder" className={styles.builderBtn}>
                Build My Resume
              </Link>

              {/* Footer hint */}
              <p className={styles.fileHint}>
                Supported file types are .doc, .docx, .pdf, .rtf, .txt&nbsp;&nbsp;(Max size: 5 MB)
              </p>
            </>
          )}
        </div>
      </main>

      {/* ── Cloud modal ─────────────────────────────────────────── */}
      {cloudModal && (
        <CloudModal provider={cloudModal} onClose={() => setCloudModal(null)} />
      )}
    </div>
  );
}
