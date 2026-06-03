import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './CandidateProfile.module.css';

/* ── Helpers ─────────────────────────────────────────────────────── */
function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'today';
  if (d === 1) return '1d ago';
  if (d < 30)  return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

function initials(str) {
  if (!str) return '?';
  return str.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

/* ── SVG icons ───────────────────────────────────────────────────── */
function PencilIcon() {
  return (
    <svg className={styles.pencilIcon} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className={styles.trashIcon} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

function CloudDownloadIcon() {
  return (
    <svg className={styles.downloadIcon} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="8 17 12 21 16 17"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/>
    </svg>
  );
}

/* ── Candidate sub-navigation ────────────────────────────────────── */
const SUB_NAV_ITEMS = [
  // ── Active / working links first ── always visible without scrolling
  {
    label: 'My Profile', path: '/profile', active: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    label: 'My Blogs', path: '/my-blogs',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>,
  },
  {
    label: 'Job Tracker', path: '/my-applications',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    label: 'Find Jobs', path: '/jobs',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  },
  {
    label: 'Home', path: '/',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  // ── Coming-soon stubs (scroll to find) ──
  {
    label: 'Skill Tools', path: '#',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
  {
    label: 'Job Alerts', path: '#',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  },
  {
    label: 'Settings', path: '#',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
];

function CandidateSubNav() {
  return (
    <nav className={styles.subNav} aria-label="Candidate navigation">
      <div className={styles.subNavInner}>
        {SUB_NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`${styles.subNavItem} ${item.active ? styles.subNavActive : ''}`}
            aria-current={item.active ? 'page' : undefined}
          >
            <span className={styles.subNavIcon}>{item.icon}</span>
            <span className={styles.subNavLabel}>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

/* ── Card wrapper used by every section ──────────────────────────── */
function SectionCard({ title, onEdit, onAdd, onDelete, children, noPad }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>{title}</span>
        <div className={styles.cardActions}>
          {onAdd  && <button className={styles.addBtn}  onClick={onAdd}  aria-label={`Add ${title}`}>ADD</button>}
          {onEdit && <button className={styles.iconActionBtn} onClick={onEdit} aria-label={`Edit ${title}`}><PencilIcon /></button>}
          {onDelete && <button className={styles.iconActionBtn} onClick={onDelete} aria-label={`Delete ${title}`}><TrashIcon /></button>}
        </div>
      </div>
      <div className={noPad ? styles.cardBodyNoPad : styles.cardBody}>
        {children}
      </div>
    </div>
  );
}

/* ── Empty section placeholder ───────────────────────────────────── */
function EmptySection({ label, onAction }) {
  return (
    <div className={styles.emptySection}>
      {onAction
        ? <button className={styles.emptySectionBtn} onClick={onAction}>{label}</button>
        : <span className={styles.emptySectionText}>{label}</span>
      }
    </div>
  );
}

/* ── Page component ──────────────────────────────────────────────── */
export default function CandidateProfile() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const c   = user?.contactInfo;
  const v   = user?.resumeVisibility;
  const jp  = user?.jobPreferences;
  const r   = user?.resume;
  const sum = user?.summary || '';
  const skills = user?.skills || [];
  const workExp = user?.workExperience || [];
  const edu  = user?.education || [];

  const displayName = c ? `${c.firstName} ${c.lastName}` : user?.name || '';
  const avatarText  = c
    ? `${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`.toUpperCase()
    : initials(user?.name);

  return (
    <div className={styles.pageWrapper}>

      {/* ── Candidate sub-nav ──────────────────────────────────── */}
      <CandidateSubNav />

      <div className={styles.container}>
        <h1 className={styles.pageTitle}>My Profile</h1>

        <div className={styles.layout}>

          {/* ── Left sidebar ─────────────────────────────────── */}
          <aside className={styles.sidebar}>
            <div className={styles.identityCard}>
              <button
                className={styles.identityEdit}
                onClick={() => navigate('/onboarding/contact-info')}
                aria-label="Edit profile"
              >
                <PencilIcon />
              </button>
              <div className={styles.avatarSquare} aria-hidden="true">
                {avatarText}
              </div>
              <div className={styles.identityInfo}>
                <p className={styles.identityGreeting}>Hi, {c?.firstName || user?.name}</p>
                {jp?.preferredJobTitle && (
                  <p className={styles.identityTitle}>{jp.preferredJobTitle}</p>
                )}
                {(c?.city || c?.country) && (
                  <p className={styles.identityLocation}>
                    {[c.city, c.country].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────── */}
          <main className={styles.main}>

            {/* Contact Info + Location row */}
            <div className={styles.twoColRow}>

              <SectionCard
                title="Contact Information"
                onEdit={() => navigate('/onboarding/contact-info')}
              >
                {c ? (
                  <div className={styles.contactBlock}>
                    <p className={styles.contactLine}>{displayName}</p>
                    <p className={styles.contactLine}>{user?.email}</p>
                    {c.phone && (
                      <p className={styles.contactLine}>
                        {c.phoneCountryCode}{c.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <EmptySection label="Add contact information" onAction={() => navigate('/onboarding/contact-info')} />
                )}
              </SectionCard>

              <SectionCard
                title="Location"
                onEdit={() => navigate('/onboarding/contact-info')}
              >
                {c?.city || c?.country ? (
                  <div className={styles.contactBlock}>
                    {c.city && c.zipCode && (
                      <p className={styles.contactLine}>{c.city}, {c.zipCode}</p>
                    )}
                    {c.country && (
                      <p className={styles.contactLine}>{c.country}</p>
                    )}
                  </div>
                ) : (
                  <EmptySection label="Add location" onAction={() => navigate('/onboarding/contact-info')} />
                )}
              </SectionCard>

            </div>

            {/* My Resume */}
            <SectionCard
              title="My Resume"
              onEdit={() => navigate('/resume-upload')}
              onDelete={r ? () => navigate('/resume-upload') : undefined}
            >
              {r ? (
                <>
                  <div className={styles.resumeChip}>
                    <span className={styles.resumeFilename}>{r.originalName}</span>
                    <CloudDownloadIcon />
                  </div>
                  <p className={styles.resumeUpdated}>
                    Last updated {timeAgo(r.uploadedAt)}
                  </p>
                </>
              ) : (
                <EmptySection label="Upload your resume" onAction={() => navigate('/resume-upload')} />
              )}
            </SectionCard>

            {/* Summary */}
            <SectionCard title="Summary" onEdit={() => navigate('/resume-builder')}>
              {sum ? (
                <p className={styles.summaryText}>{sum}</p>
              ) : (
                <EmptySection label="Add a professional summary" onAction={() => navigate('/resume-builder')} />
              )}
            </SectionCard>

            {/* Skills */}
            <SectionCard title="Skills" onEdit={skills.length ? () => navigate('/resume-builder') : undefined} onAdd={!skills.length ? () => navigate('/resume-builder') : undefined}>
              {skills.length ? (
                <div className={styles.skillsWrap}>
                  {skills.map((s) => (
                    <span key={s} className={styles.skillChip}>{s}</span>
                  ))}
                </div>
              ) : (
                <EmptySection label="Add your skills" onAction={() => navigate('/resume-builder')} />
              )}
            </SectionCard>

            {/* Work Experience */}
            <SectionCard title="Work Experience" onAdd={() => navigate('/resume-builder')}>
              {workExp.length ? (
                <div className={styles.expList}>
                  {workExp.map((ex, i) => (
                    <div key={i} className={styles.expEntry}>
                      <div className={styles.expHeader}>
                        <span className={styles.expTitle}>{ex.title}</span>
                        <span className={styles.expDates}>
                          {ex.startDate}{ex.startDate && (ex.endDate || ex.isCurrent) ? ' – ' : ''}{ex.isCurrent ? 'Present' : ex.endDate}
                        </span>
                      </div>
                      {ex.company && <p className={styles.expCompany}>{ex.company}{ex.location ? ` · ${ex.location}` : ''}</p>}
                      {ex.description && <p className={styles.expDesc}>{ex.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySection label="No work experience added yet." />
              )}
            </SectionCard>

            {/* Education */}
            <SectionCard title="Education" onAdd={() => navigate('/resume-builder')}>
              {edu.length ? (
                <div className={styles.expList}>
                  {edu.map((ed, i) => (
                    <div key={i} className={styles.expEntry}>
                      <div className={styles.expHeader}>
                        <span className={styles.expTitle}>{ed.degree}</span>
                        <span className={styles.expDates}>
                          {ed.startYear}{ed.startYear && ed.endYear ? ' – ' : ''}{ed.endYear}
                        </span>
                      </div>
                      {ed.institution && <p className={styles.expCompany}>{ed.institution}{ed.location ? ` · ${ed.location}` : ''}</p>}
                      {ed.fieldOfStudy && <p className={styles.expDesc}>{ed.fieldOfStudy}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySection label="No education added yet." />
              )}
            </SectionCard>

            {/* Work Authorization */}
            <SectionCard
              title="Work Authorization"
              onEdit={c ? () => navigate('/onboarding/contact-info') : undefined}
              onAdd={!c ? () => navigate('/onboarding/contact-info') : undefined}
            >
              {c?.authorizedToWork !== undefined && c?.authorizedToWork !== null ? (
                <div className={styles.authBadge} data-auth={String(c.authorizedToWork)}>
                  {c.authorizedToWork
                    ? `Authorized to work in ${c.country || 'this country'}`
                    : `Not authorized to work in ${c.country || 'this country'}`}
                </div>
              ) : (
                <EmptySection label="Add work authorization" onAction={() => navigate('/onboarding/contact-info')} />
              )}
            </SectionCard>

            {/* Languages */}
            <SectionCard title="Languages" onEdit={() => {}}>
              <EmptySection label="Add languages you speak" />
            </SectionCard>

            {/* Certifications */}
            <SectionCard title="Certifications" onAdd={() => {}}>
              <EmptySection label="No certifications added yet." />
            </SectionCard>

            {/* Awards */}
            <SectionCard title="Awards" onAdd={() => {}}>
              <EmptySection label="No awards added yet." />
            </SectionCard>

            {/* Extracurriculars */}
            <SectionCard title="Extracurriculars" onAdd={() => {}}>
              <EmptySection label="No extracurriculars added yet." />
            </SectionCard>

            {/* Additional Information */}
            <div className={styles.additionalRow}>
              <SectionCard
                title="Profile Visibility"
                onEdit={() => navigate('/onboarding/visibility')}
              >
                {v ? (
                  <p className={styles.visLabel} data-vis={v}>
                    {{ hide_contact: 'Hide contact details', visible: 'Visible to employers', not_visible: 'Not visible to employers' }[v]}
                  </p>
                ) : (
                  <EmptySection label="Set visibility" onAction={() => navigate('/onboarding/visibility')} />
                )}
              </SectionCard>

              <SectionCard
                title="Job Preferences"
                onEdit={() => navigate('/onboarding/job-preferences')}
              >
                {jp?.preferredJobTitle ? (
                  <div className={styles.contactBlock}>
                    <p className={styles.contactLine}>{jp.preferredJobTitle}</p>
                    <p className={styles.contactLine}>{[jp.city, jp.country].filter(Boolean).join(', ')}</p>
                    {jp.remoteInterested && <p className={styles.contactLine}>Open to remote</p>}
                  </div>
                ) : (
                  <EmptySection label="Set job preferences" onAction={() => navigate('/onboarding/job-preferences')} />
                )}
              </SectionCard>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
