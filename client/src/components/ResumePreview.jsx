/**
 * ResumePreview — renders a resume with a selected template applied.
 * Used at full size in the editor and scaled via CSS transform for thumbnails.
 */

const SAMPLE = {
  personalInfo: {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '(555) 000-1234',
    city: 'San Francisco',
    state: 'CA',
    linkedin: 'linkedin.com/in/alexjohnson',
    website: 'alexjohnson.dev',
    summary:
      'Experienced professional with 8+ years driving results. Proven track record of leading high-impact projects and cross-functional teams to deliver exceptional outcomes in dynamic environments.',
  },
  experience: [
    {
      _id: '1',
      title: 'Senior Product Manager',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      startDate: 'Jan 2021',
      endDate: '',
      current: true,
      bullets: ['Led team to 40% revenue increase YoY', 'Managed $5M annual product roadmap', 'Launched 3 successful products across APAC'],
    },
    {
      _id: '2',
      title: 'Project Lead',
      company: 'Innovation Labs',
      location: 'Austin, TX',
      startDate: 'Jun 2018',
      endDate: 'Dec 2020',
      current: false,
      bullets: ['Delivered 12 projects on time and 8% under budget', 'Grew client satisfaction scores by 25%'],
    },
  ],
  education: [
    { _id: '1', degree: 'MBA — Business Administration', school: 'Stanford University', endDate: '2018', gpa: '3.9' },
    { _id: '2', degree: 'B.S. Computer Science', school: 'UC Berkeley', endDate: '2016' },
  ],
  skills: [
    { _id: '1', name: 'Strategic Planning' },
    { _id: '2', name: 'Team Leadership' },
    { _id: '3', name: 'Product Management' },
    { _id: '4', name: 'Data Analysis' },
    { _id: '5', name: 'Agile / Scrum' },
    { _id: '6', name: 'Stakeholder Communication' },
    { _id: '7', name: 'Budget Management' },
    { _id: '8', name: 'Market Research' },
  ],
  certifications: [
    { _id: '1', name: 'PMP Certification', issuer: 'PMI', date: '2022' },
    { _id: '2', name: 'AWS Solutions Architect', issuer: 'Amazon', date: '2021' },
  ],
  languages: [
    { _id: '1', name: 'English', proficiency: 'Native' },
    { _id: '2', name: 'Spanish', proficiency: 'Professional' },
  ],
  projects: [],
  awards: [],
};

/* ── Helpers ──────────────────────────────────────────────────────── */
function merge(sample, real) {
  if (!real) return sample;
  const out = { ...sample };
  Object.keys(sample).forEach((k) => {
    const v = real[k];
    if (Array.isArray(v) && v.length > 0) out[k] = v;
    else if (!Array.isArray(v) && v && typeof v === 'object' && Object.keys(v).some((kk) => v[kk])) out[k] = { ...sample[k], ...v };
  });
  return out;
}

/* ── Section heading component ────────────────────────────────────── */
function SectionHeading({ title, accent, border }) {
  return (
    <div style={{
      borderBottom: `2px solid ${border || accent}`,
      marginBottom: 8,
      paddingBottom: 2,
      marginTop: 14,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: accent, textTransform: 'uppercase' }}>
        {title}
      </span>
    </div>
  );
}

/* ── Layout: Classic (centered header, one-column) ────────────────── */
function ClassicLayout({ data, tpl }) {
  const p = data.personalInfo;
  const accent = tpl.accentColor || '#2b6cb0';
  const headerBg = tpl.headerBg || '#1a365d';
  const font = tpl.fontFamily || 'Georgia, serif';
  const contactLine = [p.email, p.phone, p.city && p.state ? `${p.city}, ${p.state}` : p.address].filter(Boolean).join(' | ');

  return (
    <div style={{ fontFamily: font, fontSize: 11, color: '#222', lineHeight: 1.45, padding: '32px 40px', minHeight: 1060, background: '#fff' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: `3px solid ${accent}`, paddingBottom: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: headerBg, letterSpacing: '0.02em' }}>{p.name}</div>
        <div style={{ fontSize: 10.5, color: '#555', marginTop: 4 }}>{contactLine}</div>
        {p.linkedin && <div style={{ fontSize: 9.5, color: accent, marginTop: 2 }}>{p.linkedin}{p.website ? ` • ${p.website}` : ''}</div>}
      </div>

      {/* Summary */}
      {p.summary && <>
        <SectionHeading title="Professional Summary" accent={accent} />
        <p style={{ fontSize: 10.5, color: '#333', lineHeight: 1.55, margin: '0 0 8px' }}>{p.summary}</p>
      </>}

      {/* Experience */}
      {data.experience?.length > 0 && <>
        <SectionHeading title="Work Experience" accent={accent} />
        {data.experience.map((exp, i) => (
          <div key={exp._id || i} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700, fontSize: 11 }}>{exp.title}</span>
              <span style={{ fontSize: 9.5, color: '#666' }}>{exp.startDate}{exp.startDate ? ' – ' : ''}{exp.current ? 'Present' : exp.endDate}</span>
            </div>
            <div style={{ fontSize: 10, color: accent, fontStyle: 'italic' }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
            {exp.bullets?.length > 0 && <>
              <div style={{ fontSize: 8.5, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4, marginBottom: 2 }}>Key Achievements &amp; Responsibilities</div>
              {exp.bullets.map((b, j) => <div key={j} style={{ fontSize: 10, color: '#444', paddingLeft: 12, marginTop: 2 }}>• {b}</div>)}
            </>}
          </div>
        ))}
      </>}

      {/* Education */}
      {data.education?.length > 0 && <>
        <SectionHeading title="Education" accent={accent} />
        {data.education.map((edu, i) => (
          <div key={edu._id || i} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700, fontSize: 10.5 }}>{edu.degree}</span>
              <span style={{ fontSize: 9.5, color: '#666' }}>{edu.endDate}</span>
            </div>
            <div style={{ fontSize: 10, color: '#555' }}>{edu.school}{edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</div>
          </div>
        ))}
      </>}

      {/* Skills */}
      {data.skills?.length > 0 && <>
        <SectionHeading title="Skills" accent={accent} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {data.skills.map((s, i) => (
            <span key={s._id || i} style={{ background: tpl.secondaryBg || '#f0f4ff', color: accent, fontSize: 9.5, padding: '2px 8px', borderRadius: 10, border: `1px solid ${accent}22` }}>
              {s.name}
            </span>
          ))}
        </div>
      </>}

      {/* Certifications */}
      {data.certifications?.length > 0 && <>
        <SectionHeading title="Certifications" accent={accent} />
        {data.certifications.map((c, i) => (
          <div key={c._id || i} style={{ fontSize: 10, marginBottom: 3 }}>• {c.name}{c.issuer ? ` — ${c.issuer}` : ''}{c.date ? ` (${c.date})` : ''}</div>
        ))}
      </>}

      {/* Languages */}
      {data.languages?.length > 0 && <>
        <SectionHeading title="Languages" accent={accent} />
        <div style={{ fontSize: 10, color: '#444' }}>{data.languages.map((l) => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ''}`).join(' • ')}</div>
      </>}
    </div>
  );
}

/* ── Layout: Modern-Left / Modern-Right (sidebar) ─────────────────── */
function SidebarLayout({ data, tpl, sidebarRight = false }) {
  const p = data.personalInfo;
  const accent    = tpl.accentColor || '#0d9488';
  const sidebarBg = tpl.headerBg   || '#0f766e';
  const lightBg   = tpl.secondaryBg || '#f0fdfa';
  const font      = tpl.fontFamily  || 'Inter, sans-serif';

  const Sidebar = (
    <div style={{ width: 210, minWidth: 210, background: sidebarBg, padding: '28px 16px', color: '#fff', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Name */}
      <div>
        <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2, marginBottom: 4, wordBreak: 'break-word' }}>{p.name}</div>
        <div style={{ fontSize: 9, opacity: 0.85, fontStyle: 'italic' }}>{data.experience?.[0]?.title}</div>
      </div>
      {/* Contact */}
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: 4, marginBottom: 6 }}>Contact</div>
        {p.email && <div style={{ fontSize: 8.5, marginBottom: 3, wordBreak: 'break-all' }}>✉ {p.email}</div>}
        {p.phone && <div style={{ fontSize: 8.5, marginBottom: 3 }}>📞 {p.phone}</div>}
        {(p.city || p.address) && <div style={{ fontSize: 8.5, marginBottom: 3 }}>📍 {p.city}{p.city && p.state ? `, ${p.state}` : p.address}</div>}
        {p.linkedin && <div style={{ fontSize: 8.5, marginBottom: 3 }}>in {p.linkedin}</div>}
      </div>
      {/* Skills */}
      {data.skills?.length > 0 && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: 4, marginBottom: 6 }}>Skills</div>
          {data.skills.map((s, i) => (
            <div key={s._id || i} style={{ fontSize: 8.5, marginBottom: 3, paddingLeft: 6 }}>• {s.name}</div>
          ))}
        </div>
      )}
      {/* Education */}
      {data.education?.length > 0 && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: 4, marginBottom: 6 }}>Education</div>
          {data.education.map((edu, i) => (
            <div key={edu._id || i} style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 8.5, fontWeight: 700 }}>{edu.degree}</div>
              <div style={{ fontSize: 8, opacity: 0.8 }}>{edu.school}</div>
              {edu.endDate && <div style={{ fontSize: 8, opacity: 0.7 }}>{edu.endDate}</div>}
            </div>
          ))}
        </div>
      )}
      {/* Languages */}
      {data.languages?.length > 0 && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: 4, marginBottom: 6 }}>Languages</div>
          {data.languages.map((l, i) => (
            <div key={l._id || i} style={{ fontSize: 8.5, marginBottom: 2 }}>{l.name}{l.proficiency ? ` — ${l.proficiency}` : ''}</div>
          ))}
        </div>
      )}
      {/* Certifications */}
      {data.certifications?.length > 0 && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: 4, marginBottom: 6 }}>Certifications</div>
          {data.certifications.map((c, i) => (
            <div key={c._id || i} style={{ fontSize: 8.5, marginBottom: 3 }}>{c.name}</div>
          ))}
        </div>
      )}
    </div>
  );

  const Main = (
    <div style={{ flex: 1, padding: '28px 24px 28px 20px', background: '#fff', fontFamily: font, fontSize: 11, color: '#222', lineHeight: 1.45 }}>
      {/* Summary */}
      {p.summary && <>
        <div style={{ borderBottom: `2px solid ${accent}`, marginBottom: 8, paddingBottom: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: accent, textTransform: 'uppercase' }}>Professional Summary</span>
        </div>
        <p style={{ fontSize: 10.5, color: '#333', lineHeight: 1.55, margin: '0 0 12px' }}>{p.summary}</p>
      </>}

      {/* Experience */}
      {data.experience?.length > 0 && <>
        <div style={{ borderBottom: `2px solid ${accent}`, marginBottom: 8, paddingBottom: 2, marginTop: 14 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: accent, textTransform: 'uppercase' }}>Work Experience</span>
        </div>
        {data.experience.map((exp, i) => (
          <div key={exp._id || i} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700, fontSize: 11 }}>{exp.title}</span>
              <span style={{ fontSize: 9.5, color: '#666' }}>{exp.startDate}{exp.startDate ? ' – ' : ''}{exp.current ? 'Present' : exp.endDate}</span>
            </div>
            <div style={{ fontSize: 10, color: accent, fontStyle: 'italic', marginBottom: 3 }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
            {exp.bullets?.length > 0 && <>
              <div style={{ fontSize: 8.5, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4, marginBottom: 2 }}>Key Achievements &amp; Responsibilities</div>
              {exp.bullets.map((b, j) => <div key={j} style={{ fontSize: 10, color: '#444', paddingLeft: 12, marginTop: 2 }}>• {b}</div>)}
            </>}
          </div>
        ))}
      </>}

      {/* Projects */}
      {data.projects?.length > 0 && <>
        <div style={{ borderBottom: `2px solid ${accent}`, marginBottom: 8, paddingBottom: 2, marginTop: 14 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: accent, textTransform: 'uppercase' }}>Projects</span>
        </div>
        {data.projects.map((proj, i) => (
          <div key={proj._id || i} style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 10.5 }}>{proj.name}</div>
            {proj.description && <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{proj.description}</div>}
            {proj.bullets?.map((b, j) => <div key={j} style={{ fontSize: 10, color: '#444', paddingLeft: 12, marginTop: 2 }}>• {b}</div>)}
          </div>
        ))}
      </>}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: sidebarRight ? 'row-reverse' : 'row', minHeight: 1060, fontFamily: font }}>
      {Sidebar}
      {Main}
    </div>
  );
}

/* ── Layout: Header Band (bold full-width header) ─────────────────── */
function HeaderBandLayout({ data, tpl }) {
  const p = data.personalInfo;
  const accent    = tpl.accentColor  || '#d97706';
  const headerBg  = tpl.headerBg    || '#1c1917';
  const lightBg   = tpl.secondaryBg || '#fffbeb';
  const font      = tpl.fontFamily  || 'Georgia, serif';
  const contactLine = [p.email, p.phone, p.city && p.state ? `${p.city}, ${p.state}` : p.address, p.linkedin].filter(Boolean).join('  •  ');

  return (
    <div style={{ fontFamily: font, fontSize: 11, color: '#222', minHeight: 1060, background: '#fff' }}>
      {/* Full-width header */}
      <div style={{ background: headerBg, color: '#fff', padding: '28px 40px 24px', position: 'relative' }}>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '0.03em', marginBottom: 4 }}>{p.name}</div>
        {data.experience?.[0]?.title && (
          <div style={{ fontSize: 12, color: accent, fontWeight: 600, marginBottom: 10 }}>{data.experience[0].title}</div>
        )}
        <div style={{ fontSize: 9.5, opacity: 0.85, borderTop: `1px solid ${accent}55`, paddingTop: 10 }}>{contactLine}</div>
      </div>

      {/* Body */}
      <div style={{ padding: '24px 40px', lineHeight: 1.5 }}>
        {/* Summary */}
        {p.summary && <>
          <SectionHeading title="Professional Summary" accent={accent} border={accent} />
          <p style={{ fontSize: 10.5, color: '#333', lineHeight: 1.6, margin: '0 0 8px', borderLeft: `3px solid ${accent}`, paddingLeft: 10 }}>{p.summary}</p>
        </>}

        {/* Experience */}
        {data.experience?.length > 0 && <>
          <SectionHeading title="Work Experience" accent={accent} border={accent} />
          {data.experience.map((exp, i) => (
            <div key={exp._id || i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: 11 }}>{exp.title} — {exp.company}</span>
                <span style={{ fontSize: 9.5, color: '#666' }}>{exp.startDate}{exp.startDate ? ' – ' : ''}{exp.current ? 'Present' : exp.endDate}</span>
              </div>
              {exp.location && <div style={{ fontSize: 9.5, color: '#777', marginBottom: 3 }}>{exp.location}</div>}
              {exp.bullets?.length > 0 && <>
                <div style={{ fontSize: 8.5, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4, marginBottom: 2 }}>Key Achievements &amp; Responsibilities</div>
                {exp.bullets.map((b, j) => <div key={j} style={{ fontSize: 10, color: '#444', paddingLeft: 12, marginTop: 2 }}>• {b}</div>)}
              </>}
            </div>
          ))}
        </>}

        {/* Two-column lower section: Education + Skills */}
        <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
          <div style={{ flex: 1 }}>
            {data.education?.length > 0 && <>
              <SectionHeading title="Education" accent={accent} border={accent} />
              {data.education.map((edu, i) => (
                <div key={edu._id || i} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 10.5 }}>{edu.degree}</div>
                  <div style={{ fontSize: 10, color: '#555' }}>{edu.school}{edu.endDate ? ` • ${edu.endDate}` : ''}</div>
                </div>
              ))}
            </>}

            {data.certifications?.length > 0 && <>
              <SectionHeading title="Certifications" accent={accent} border={accent} />
              {data.certifications.map((c, i) => (
                <div key={c._id || i} style={{ fontSize: 10, marginBottom: 3 }}>• {c.name}{c.date ? ` (${c.date})` : ''}</div>
              ))}
            </>}
          </div>

          <div style={{ flex: 1 }}>
            {data.skills?.length > 0 && <>
              <SectionHeading title="Skills" accent={accent} border={accent} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {data.skills.map((s, i) => (
                  <span key={s._id || i} style={{ background: lightBg, color: headerBg, fontSize: 9.5, padding: '2px 8px', borderRadius: 10, border: `1px solid ${accent}44` }}>
                    {s.name}
                  </span>
                ))}
              </div>
            </>}

            {data.languages?.length > 0 && <>
              <SectionHeading title="Languages" accent={accent} border={accent} />
              {data.languages.map((l, i) => (
                <div key={l._id || i} style={{ fontSize: 10, marginBottom: 2 }}>{l.name}{l.proficiency ? ` — ${l.proficiency}` : ''}</div>
              ))}
            </>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main export ──────────────────────────────────────────────────── */
export default function ResumePreview({ template, resume, useSample = false }) {
  const tpl  = template  || { layout: 'classic', accentColor: '#6b21a8', headerBg: '#3b0764', secondaryBg: '#faf5ff', fontFamily: 'Inter, sans-serif' };
  const data = useSample ? SAMPLE : merge(SAMPLE, resume);

  switch (tpl.layout) {
    case 'modern-left':  return <SidebarLayout data={data} tpl={tpl} sidebarRight={false} />;
    case 'modern-right': return <SidebarLayout data={data} tpl={tpl} sidebarRight={true}  />;
    case 'header-band':  return <HeaderBandLayout data={data} tpl={tpl} />;
    case 'classic':
    default:             return <ClassicLayout data={data} tpl={tpl} />;
  }
}

export { SAMPLE };
