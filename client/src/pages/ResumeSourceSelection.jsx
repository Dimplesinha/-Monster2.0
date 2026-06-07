import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import styles from './ResumeSourceSelection.module.css';

function UploadCloudIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  );
}

function DocumentPenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

export default function ResumeSourceSelection() {
  const navigate   = useNavigate();
  const fileRef    = useRef(null);
  const [selected, setSelected] = useState(''); // 'upload' | 'scratch'
  const [file,     setFile]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const template = (() => {
    try { return JSON.parse(localStorage.getItem('selectedTemplate') || 'null'); } catch { return null; }
  })();

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      setError(`Unsupported format. Please upload ${allowed.join(', ')}`);
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10 MB.');
      return;
    }
    setFile(f);
    setSelected('upload');
    setError('');
  };

  const handleNext = async () => {
    if (!selected) { setError('Please choose an option.'); return; }
    setError('');
    setLoading(true);

    try {
      if (selected === 'scratch') {
        const { data } = await api.post('/resumes', { templateId: template?._id });
        navigate(`/resume-builder/edit/${data.resume._id}`);
      } else {
        const form = new FormData();
        form.append('resume', file);
        if (template?._id) form.append('templateId', template._id);
        const { data } = await api.post('/resumes/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        navigate(`/resume-builder/edit/${data.resume._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* ── Top bar ───────────────────────────────────────────────── */}
      <header className={styles.topBar}>
        <Link to="/" className={styles.wordmark}>Monster</Link>
        <Link to="/resume-builder/template-selection" className={styles.backLink}>← Back</Link>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Are you uploading an existing resume?</h1>
        <p className={styles.sub}>Just review, edit, and update it with new information</p>

        <div className={styles.cards}>
          {/* Upload card */}
          <div
            className={`${styles.card} ${selected === 'upload' ? styles.cardSelected : ''}`}
            onClick={() => { setSelected('upload'); fileRef.current?.click(); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
            aria-pressed={selected === 'upload'}
          >
            {selected === 'upload' && file && <div className={styles.recommended}>✓ FILE READY</div>}
            {selected !== 'upload' && <div className={styles.recommended}>RECOMMENDED OPTION TO SAVE YOU TIME</div>}

            <div className={styles.cardIcon}><UploadCloudIcon /></div>
            <h2 className={styles.cardTitle}>Yes, upload from my resume</h2>
            <p className={styles.cardDesc}>
              We'll give you expert guidance to fill out your info and enhance your resume, from start to finish
            </p>
            {file && selected === 'upload' && (
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>({(file.size / 1024).toFixed(0)} KB)</span>
              </div>
            )}
          </div>

          {/* Scratch card */}
          <div
            className={`${styles.card} ${selected === 'scratch' ? styles.cardSelected : ''}`}
            onClick={() => setSelected('scratch')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setSelected('scratch')}
            aria-pressed={selected === 'scratch'}
          >
            <div className={styles.cardIcon}><DocumentPenIcon /></div>
            <h2 className={styles.cardTitle}>No, start from scratch</h2>
            <p className={styles.cardDesc}>
              We'll guide you through the whole process so your skills can shine
            </p>
          </div>
        </div>

        {/* Supported formats */}
        <p className={styles.formats}>Supported formats: PDF, DOCX, DOC, TXT · Max 10 MB</p>

        {error && <p className={styles.errorMsg} role="alert">{error}</p>}

        {/* Next button */}
        <div className={styles.actions}>
          <button
            className={styles.nextBtn}
            onClick={handleNext}
            disabled={!selected || loading}
          >
            {loading ? 'Processing…' : 'Next →'}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </main>
    </div>
  );
}
