import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import ResumePreview from '../components/ResumePreview';
import styles from './ResumeBuilderEditor.module.css';

/* ── Section list ────────────────────────────────────────────────── */
const SECTIONS = [
  { key: 'personalInfo', label: 'Personal Details' },
  { key: 'summary',      label: 'Professional Summary' },
  { key: 'experience',   label: 'Work Experience' },
  { key: 'education',    label: 'Education' },
  { key: 'skills',       label: 'Skills' },
  { key: 'projects',     label: 'Projects' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'languages',    label: 'Languages' },
  { key: 'awards',       label: 'Awards' },
];

/* ── Small reusable form components ─────────────────────────────── */
function Field({ label, value, onChange, type = 'text', placeholder, hint }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {type === 'textarea' ? (
        <textarea className={styles.textarea} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} />
      ) : (
        <input className={styles.input} type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}

function Row({ children }) { return <div className={styles.row}>{children}</div>; }

/* ── Personal Info Section ───────────────────────────────────────── */
function PersonalInfoForm({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });
  return (
    <div className={styles.sectionForm}>
      <Row>
        <Field label="Full Name *"  value={data.name}    onChange={(v) => set('name', v)}    placeholder="Alex Johnson" />
        <Field label="Job Title"    value={data.jobTitle} onChange={(v) => set('jobTitle', v)} placeholder="Software Engineer" />
      </Row>
      <Row>
        <Field label="Email *"      value={data.email}   onChange={(v) => set('email', v)}   placeholder="alex@example.com" type="email" />
        <Field label="Phone"        value={data.phone}   onChange={(v) => set('phone', v)}   placeholder="+91 98765 43210" />
      </Row>
      <Row>
        <Field label="City"         value={data.city}    onChange={(v) => set('city', v)}    placeholder="Bangalore" />
        <Field label="State"        value={data.state}   onChange={(v) => set('state', v)}   placeholder="Karnataka" />
      </Row>
      <Row>
        <Field label="LinkedIn URL" value={data.linkedin} onChange={(v) => set('linkedin', v)} placeholder="linkedin.com/in/yourprofile" />
        <Field label="Website"      value={data.website}  onChange={(v) => set('website', v)}  placeholder="yourportfolio.com" />
      </Row>
    </div>
  );
}

/* ── Summary Section ─────────────────────────────────────────────── */
function SummaryForm({ data, onChange }) {
  return (
    <div className={styles.sectionForm}>
      <Field
        label="Professional Summary"
        value={data?.summary || ''}
        onChange={(v) => onChange({ ...data, summary: v })}
        type="textarea"
        placeholder="Experienced professional with X+ years driving results across..."
        hint="3-5 sentences describing your expertise, key skills, and career objective."
      />
    </div>
  );
}

/* ── Experience Section ──────────────────────────────────────────── */
function ExperienceForm({ items, onChange }) {
  const addItem = () => onChange([...items, { _id: Date.now().toString(), title: '', company: '', location: '', startDate: '', endDate: '', current: false, bullets: [''] }]);
  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));
  const updateItem = (idx, key, val) => onChange(items.map((it, i) => i === idx ? { ...it, [key]: val } : it));
  const updateBullet = (idx, bi, val) => {
    const bullets = [...(items[idx].bullets || [])];
    bullets[bi] = val;
    updateItem(idx, 'bullets', bullets);
  };
  const addBullet    = (idx) => updateItem(idx, 'bullets', [...(items[idx].bullets || []), '']);
  const removeBullet = (idx, bi) => updateItem(idx, 'bullets', (items[idx].bullets || []).filter((_, i) => i !== bi));

  return (
    <div className={styles.sectionForm}>
      {items.map((exp, idx) => (
        <div key={exp._id || idx} className={styles.entryCard}>
          <div className={styles.entryHeader}>
            <span className={styles.entryNum}>Position {idx + 1}</span>
            <button className={styles.removeBtn} onClick={() => removeItem(idx)} aria-label="Remove">✕</button>
          </div>
          <Row>
            <Field label="Job Title *"   value={exp.title}    onChange={(v) => updateItem(idx, 'title', v)}    placeholder="Software Engineer" />
            <Field label="Company *"     value={exp.company}  onChange={(v) => updateItem(idx, 'company', v)}  placeholder="Tech Corp" />
          </Row>
          <Row>
            <Field label="Location"      value={exp.location} onChange={(v) => updateItem(idx, 'location', v)} placeholder="Bangalore, IN" />
          </Row>
          <Row>
            <Field label="Start Date"    value={exp.startDate} onChange={(v) => updateItem(idx, 'startDate', v)} placeholder="Jan 2022" />
            <Field label="End Date"      value={exp.current ? 'Present' : exp.endDate}
                   onChange={(v) => updateItem(idx, 'endDate', v)} placeholder="Dec 2024" />
          </Row>
          <div className={styles.checkRow}>
            <input type="checkbox" id={`current-${idx}`} checked={!!exp.current} onChange={(e) => updateItem(idx, 'current', e.target.checked)} />
            <label htmlFor={`current-${idx}`} className={styles.checkLabel}>Currently working here</label>
          </div>

          {/* Bullet points */}
          <div className={styles.bulletsWrap}>
            <label className={styles.label}>Key Achievements / Responsibilities</label>
            {(exp.bullets || ['']).map((b, bi) => (
              <div key={bi} className={styles.bulletRow}>
                <span className={styles.bulletDot}>•</span>
                <input className={styles.bulletInput} value={b} onChange={(e) => updateBullet(idx, bi, e.target.value)} placeholder="Describe an achievement..." />
                {bi > 0 && <button className={styles.removeBtn} onClick={() => removeBullet(idx, bi)}>✕</button>}
              </div>
            ))}
            <button className={styles.addBulletBtn} onClick={() => addBullet(idx)}>+ Add bullet point</button>
          </div>
        </div>
      ))}
      <button className={styles.addEntryBtn} onClick={addItem}>+ Add Work Experience</button>
    </div>
  );
}

/* ── Education Section ───────────────────────────────────────────── */
function EducationForm({ items, onChange }) {
  const addItem    = () => onChange([...items, { _id: Date.now().toString(), degree: '', school: '', location: '', startDate: '', endDate: '', gpa: '', honors: '' }]);
  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));
  const updateItem = (idx, key, val) => onChange(items.map((it, i) => i === idx ? { ...it, [key]: val } : it));

  return (
    <div className={styles.sectionForm}>
      {items.map((edu, idx) => (
        <div key={edu._id || idx} className={styles.entryCard}>
          <div className={styles.entryHeader}>
            <span className={styles.entryNum}>Education {idx + 1}</span>
            <button className={styles.removeBtn} onClick={() => removeItem(idx)}>✕</button>
          </div>
          <Row>
            <Field label="Degree / Qualification *" value={edu.degree} onChange={(v) => updateItem(idx, 'degree', v)} placeholder="B.Tech Computer Science" />
            <Field label="School / University *"    value={edu.school} onChange={(v) => updateItem(idx, 'school', v)} placeholder="IIT Bombay" />
          </Row>
          <Row>
            <Field label="Location"   value={edu.location}  onChange={(v) => updateItem(idx, 'location', v)}  placeholder="Mumbai, IN" />
            <Field label="GPA / %" value={edu.gpa}       onChange={(v) => updateItem(idx, 'gpa', v)}       placeholder="9.2 / 10" />
          </Row>
          <Row>
            <Field label="Start Year"  value={edu.startDate} onChange={(v) => updateItem(idx, 'startDate', v)} placeholder="2018" />
            <Field label="End Year"    value={edu.endDate}   onChange={(v) => updateItem(idx, 'endDate', v)}   placeholder="2022" />
          </Row>
        </div>
      ))}
      <button className={styles.addEntryBtn} onClick={addItem}>+ Add Education</button>
    </div>
  );
}

/* ── Skills Section ──────────────────────────────────────────────── */
function SkillsForm({ items, onChange }) {
  const addItem    = () => onChange([...items, { _id: Date.now().toString(), name: '', level: '' }]);
  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));
  const updateItem = (idx, key, val) => onChange(items.map((it, i) => i === idx ? { ...it, [key]: val } : it));

  return (
    <div className={styles.sectionForm}>
      <div className={styles.skillsGrid}>
        {items.map((skill, idx) => (
          <div key={skill._id || idx} className={styles.skillItem}>
            <input
              className={styles.input}
              value={skill.name}
              onChange={(e) => updateItem(idx, 'name', e.target.value)}
              placeholder="e.g. React, Python..."
            />
            <select
              className={styles.select}
              value={skill.level || ''}
              onChange={(e) => updateItem(idx, 'level', e.target.value)}
            >
              <option value="">Level (optional)</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            <button className={styles.removeBtn} onClick={() => removeItem(idx)} aria-label="Remove skill">✕</button>
          </div>
        ))}
      </div>
      <button className={styles.addEntryBtn} onClick={addItem}>+ Add Skill</button>
    </div>
  );
}

/* ── Projects Section ────────────────────────────────────────────── */
function ProjectsForm({ items, onChange }) {
  const addItem    = () => onChange([...items, { _id: Date.now().toString(), name: '', description: '', url: '', bullets: [''] }]);
  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));
  const updateItem = (idx, key, val) => onChange(items.map((it, i) => i === idx ? { ...it, [key]: val } : it));
  const updateBullet = (idx, bi, val) => { const b = [...(items[idx].bullets || [])]; b[bi] = val; updateItem(idx, 'bullets', b); };
  const addBullet    = (idx) => updateItem(idx, 'bullets', [...(items[idx].bullets || []), '']);
  const removeBullet = (idx, bi) => updateItem(idx, 'bullets', (items[idx].bullets || []).filter((_, i) => i !== bi));

  return (
    <div className={styles.sectionForm}>
      {items.map((proj, idx) => (
        <div key={proj._id || idx} className={styles.entryCard}>
          <div className={styles.entryHeader}>
            <span className={styles.entryNum}>Project {idx + 1}</span>
            <button className={styles.removeBtn} onClick={() => removeItem(idx)}>✕</button>
          </div>
          <Row>
            <Field label="Project Name *" value={proj.name}        onChange={(v) => updateItem(idx, 'name', v)}        placeholder="E-commerce Platform" />
            <Field label="URL"            value={proj.url}         onChange={(v) => updateItem(idx, 'url', v)}         placeholder="github.com/you/project" />
          </Row>
          <Field label="Description" value={proj.description} onChange={(v) => updateItem(idx, 'description', v)} type="textarea" placeholder="Brief project overview..." />
          <div className={styles.bulletsWrap}>
            <label className={styles.label}>Key Points</label>
            {(proj.bullets || ['']).map((b, bi) => (
              <div key={bi} className={styles.bulletRow}>
                <span className={styles.bulletDot}>•</span>
                <input className={styles.bulletInput} value={b} onChange={(e) => updateBullet(idx, bi, e.target.value)} placeholder="Achievement or feature..." />
                {bi > 0 && <button className={styles.removeBtn} onClick={() => removeBullet(idx, bi)}>✕</button>}
              </div>
            ))}
            <button className={styles.addBulletBtn} onClick={() => addBullet(idx)}>+ Add point</button>
          </div>
        </div>
      ))}
      <button className={styles.addEntryBtn} onClick={addItem}>+ Add Project</button>
    </div>
  );
}

/* ── Certifications Section ──────────────────────────────────────── */
function CertificationsForm({ items, onChange }) {
  const addItem    = () => onChange([...items, { _id: Date.now().toString(), name: '', issuer: '', date: '', url: '' }]);
  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));
  const updateItem = (idx, key, val) => onChange(items.map((it, i) => i === idx ? { ...it, [key]: val } : it));

  return (
    <div className={styles.sectionForm}>
      {items.map((cert, idx) => (
        <div key={cert._id || idx} className={styles.entryCard}>
          <div className={styles.entryHeader}>
            <span className={styles.entryNum}>Certification {idx + 1}</span>
            <button className={styles.removeBtn} onClick={() => removeItem(idx)}>✕</button>
          </div>
          <Row>
            <Field label="Certification Name *" value={cert.name}   onChange={(v) => updateItem(idx, 'name', v)}   placeholder="AWS Solutions Architect" />
            <Field label="Issuing Organization" value={cert.issuer} onChange={(v) => updateItem(idx, 'issuer', v)} placeholder="Amazon Web Services" />
          </Row>
          <Row>
            <Field label="Date"       value={cert.date} onChange={(v) => updateItem(idx, 'date', v)} placeholder="Jun 2023" />
            <Field label="URL"        value={cert.url}  onChange={(v) => updateItem(idx, 'url', v)}  placeholder="cert-url.com" />
          </Row>
        </div>
      ))}
      <button className={styles.addEntryBtn} onClick={addItem}>+ Add Certification</button>
    </div>
  );
}

/* ── Languages Section ───────────────────────────────────────────── */
function LanguagesForm({ items, onChange }) {
  const addItem    = () => onChange([...items, { _id: Date.now().toString(), name: '', proficiency: '' }]);
  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));
  const updateItem = (idx, key, val) => onChange(items.map((it, i) => i === idx ? { ...it, [key]: val } : it));

  return (
    <div className={styles.sectionForm}>
      <div className={styles.skillsGrid}>
        {items.map((lang, idx) => (
          <div key={lang._id || idx} className={styles.skillItem}>
            <input className={styles.input} value={lang.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} placeholder="Language..." />
            <select className={styles.select} value={lang.proficiency || ''} onChange={(e) => updateItem(idx, 'proficiency', e.target.value)}>
              <option value="">Proficiency</option>
              <option value="Native">Native</option>
              <option value="Fluent">Fluent</option>
              <option value="Professional">Professional</option>
              <option value="Conversational">Conversational</option>
              <option value="Basic">Basic</option>
            </select>
            <button className={styles.removeBtn} onClick={() => removeItem(idx)}>✕</button>
          </div>
        ))}
      </div>
      <button className={styles.addEntryBtn} onClick={addItem}>+ Add Language</button>
    </div>
  );
}

/* ── Awards Section ──────────────────────────────────────────────── */
function AwardsForm({ items, onChange }) {
  const addItem    = () => onChange([...items, { _id: Date.now().toString(), title: '', issuer: '', date: '', description: '' }]);
  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));
  const updateItem = (idx, key, val) => onChange(items.map((it, i) => i === idx ? { ...it, [key]: val } : it));

  return (
    <div className={styles.sectionForm}>
      {items.map((award, idx) => (
        <div key={award._id || idx} className={styles.entryCard}>
          <div className={styles.entryHeader}>
            <span className={styles.entryNum}>Award {idx + 1}</span>
            <button className={styles.removeBtn} onClick={() => removeItem(idx)}>✕</button>
          </div>
          <Row>
            <Field label="Award Title *"  value={award.title}  onChange={(v) => updateItem(idx, 'title', v)}  placeholder="Employee of the Year" />
            <Field label="Issuing Body"   value={award.issuer} onChange={(v) => updateItem(idx, 'issuer', v)} placeholder="TechCorp Inc." />
          </Row>
          <Row>
            <Field label="Date" value={award.date} onChange={(v) => updateItem(idx, 'date', v)} placeholder="Dec 2023" />
          </Row>
          <Field label="Description" value={award.description} onChange={(v) => updateItem(idx, 'description', v)} type="textarea" placeholder="Brief description..." />
        </div>
      ))}
      <button className={styles.addEntryBtn} onClick={addItem}>+ Add Award</button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*                    MAIN EDITOR PAGE                               */
/* ══════════════════════════════════════════════════════════════════ */
export default function ResumeBuilderEditor() {
  const { resumeId } = useParams();
  const navigate     = useNavigate();

  const [resume,      setResume]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saveStatus,  setSaveStatus]  = useState(''); // '' | 'saved' | 'error'
  const [activeSection, setActiveSection] = useState('personalInfo');
  const [zoom,        setZoom]        = useState(0.65);
  const [error,       setError]       = useState('');
  const [downloading, setDownloading] = useState(''); // '' | 'pdf' | 'docx'

  const autoSaveTimer = useRef(null);
  const previewRef    = useRef(null);

  /* ── Load resume ──────────────────────────────────────────────── */
  useEffect(() => {
    api.get(`/resumes/${resumeId}`)
      .then(({ data }) => setResume(data))
      .catch(() => setError('Resume not found.'))
      .finally(() => setLoading(false));
  }, [resumeId]);

  /* ── Auto-save with 2s debounce ───────────────────────────────── */
  const saveResume = useCallback(async (data) => {
    if (!data) return;
    setSaving(true);
    try {
      await api.put(`/resumes/${resumeId}`, {
        title: data.title,
        personalInfo: data.personalInfo,
        experience: data.experience,
        education: data.education,
        skills: data.skills,
        projects: data.projects,
        certifications: data.certifications,
        languages: data.languages,
        awards: data.awards,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }, [resumeId]);

  const updateResume = useCallback((updater) => {
    setResume((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => saveResume(next), 2000);
      return next;
    });
  }, [saveResume]);

  /* ── Update helpers ───────────────────────────────────────────── */
  const setPersonalInfo   = (pi)   => updateResume((r) => ({ ...r, personalInfo: pi }));
  const setSummaryInInfo  = (pi)   => updateResume((r) => ({ ...r, personalInfo: pi }));
  const setSection        = (key, val) => updateResume((r) => ({ ...r, [key]: val }));

  /* ── Download PDF (browser print) ────────────────────────────── */
  const downloadPdf = () => {
    setDownloading('pdf');
    const prev = document.title;
    document.title = `${resume?.personalInfo?.name || 'Resume'}_Resume`;
    setTimeout(() => {
      window.print();
      document.title = prev;
      setDownloading('');
    }, 50);
  };

  /* ── Download DOCX ────────────────────────────────────────────── */
  const downloadDocx = async () => {
    setDownloading('docx');
    try {
      const { data } = await api.post(`/resumes/${resumeId}/download/docx`, {}, {
        responseType: 'blob',
        timeout: 30000,
      });
      const url = URL.createObjectURL(data);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `${resume?.personalInfo?.name || 'resume'}_resume.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('DOCX download failed. Please try again.');
    } finally {
      setDownloading('');
    }
  };

  /* ── Render active section form ───────────────────────────────── */
  const renderForm = () => {
    if (!resume) return null;
    switch (activeSection) {
      case 'personalInfo':
        return <PersonalInfoForm data={resume.personalInfo || {}} onChange={setPersonalInfo} />;
      case 'summary':
        return <SummaryForm data={resume.personalInfo || {}} onChange={setSummaryInInfo} />;
      case 'experience':
        return <ExperienceForm     items={resume.experience     || []} onChange={(v) => setSection('experience', v)} />;
      case 'education':
        return <EducationForm      items={resume.education      || []} onChange={(v) => setSection('education', v)} />;
      case 'skills':
        return <SkillsForm         items={resume.skills         || []} onChange={(v) => setSection('skills', v)} />;
      case 'projects':
        return <ProjectsForm       items={resume.projects       || []} onChange={(v) => setSection('projects', v)} />;
      case 'certifications':
        return <CertificationsForm items={resume.certifications || []} onChange={(v) => setSection('certifications', v)} />;
      case 'languages':
        return <LanguagesForm      items={resume.languages      || []} onChange={(v) => setSection('languages', v)} />;
      case 'awards':
        return <AwardsForm         items={resume.awards         || []} onChange={(v) => setSection('awards', v)} />;
      default: return null;
    }
  };

  /* ── Loading / error states ───────────────────────────────────── */
  if (loading) {
    return (
      <div className={styles.loadPage}>
        <div className={styles.spinner} />
        <p>Loading your resume…</p>
      </div>
    );
  }

  if (error && !resume) {
    return (
      <div className={styles.loadPage}>
        <p className={styles.errText}>{error}</p>
        <Link to="/resume/templates" className={styles.backBtn}>Back to Templates</Link>
      </div>
    );
  }

  return (
    <div className={styles.editor}>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className={styles.topBar}>
        <Link to="/" className={styles.wordmark}>Monster</Link>

        <div className={styles.titleWrap}>
          <input
            className={styles.titleInput}
            value={resume?.title || ''}
            onChange={(e) => updateResume((r) => ({ ...r, title: e.target.value }))}
            aria-label="Resume title"
          />
          <span className={styles.saveStatus}>
            {saving ? '⟳ Saving…' : saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'error' ? '⚠ Save failed' : 'Auto-saves'}
          </span>
        </div>

        <div className={styles.topActions}>
          <button
            className={styles.downloadBtn}
            onClick={downloadPdf}
            disabled={!!downloading}
            aria-label="Download PDF"
          >
            {downloading === 'pdf' ? '…' : '↓ PDF'}
          </button>
          <button
            className={`${styles.downloadBtn} ${styles.downloadBtnDocx}`}
            onClick={downloadDocx}
            disabled={!!downloading}
            aria-label="Download DOCX"
          >
            {downloading === 'docx' ? '…' : '↓ DOCX'}
          </button>
          <Link to="/resume/templates" className={styles.templateLink}>Change Template</Link>
        </div>
      </header>

      <div className={styles.body}>
        {/* ── LEFT: Section Nav + Form ─────────────────────────── */}
        <aside className={styles.leftPanel}>
          <nav className={styles.sectionNav} aria-label="Resume sections">
            {SECTIONS.map((sec) => (
              <button
                key={sec.key}
                className={`${styles.sectionNavBtn} ${activeSection === sec.key ? styles.sectionNavBtnActive : ''}`}
                onClick={() => setActiveSection(sec.key)}
                aria-current={activeSection === sec.key ? 'step' : undefined}
              >
                {sec.label}
              </button>
            ))}
          </nav>

          <div className={styles.formPanel}>
            <h2 className={styles.formHeading}>
              {SECTIONS.find((s) => s.key === activeSection)?.label}
            </h2>
            {renderForm()}
          </div>
        </aside>

        {/* ── RIGHT: Live Preview ──────────────────────────────── */}
        <div className={styles.rightPanel}>
          <div className={styles.zoomBar}>
            <button className={styles.zoomBtn} onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))} aria-label="Zoom out">−</button>
            <span className={styles.zoomVal}>{Math.round(zoom * 100)}%</span>
            <button className={styles.zoomBtn} onClick={() => setZoom((z) => Math.min(1.2, z + 0.1))} aria-label="Zoom in">+</button>
          </div>

          <div className={styles.previewArea} id="resume-preview-area">
            <div
              ref={previewRef}
              className={styles.previewPage}
              id="resume-print-target"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            >
              <ResumePreview template={resume?.template} resume={resume} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Print CSS — only shows resume when printing ─────────── */}
      <style>{`
        @media print {
          * { visibility: hidden !important; }
          #resume-print-target,
          #resume-print-target * { visibility: visible !important; }
          #resume-print-target {
            position: fixed !important;
            inset: 0 !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
            width: 794px !important;
            margin: 0 auto !important;
            z-index: 99999 !important;
          }
          @page { margin: 0; size: A4 portrait; }
        }
      `}</style>
    </div>
  );
}
