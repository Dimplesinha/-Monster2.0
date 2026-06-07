const path    = require('path');
const fs      = require('fs');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
        BorderStyle, Table, TableRow, TableCell, WidthType } = require('docx');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const Resume         = require('../models/Resume');
const ResumeTemplate = require('../models/ResumeTemplate');

/* ── Helpers ─────────────────────────────────────────────────────── */

/** Optional Gemini enhancement — single attempt, no retries, no waiting.
 *  Throws immediately on any error so the caller can fall back to regex. */
async function parseResumeWithGemini(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model  = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are a resume parser. Extract structured data from the resume text below and return ONLY valid JSON — no markdown fences, no explanation, no extra text.

RESUME TEXT:
---
${text}
---

Return exactly this JSON structure (use empty strings/arrays for missing fields, never null):
{
  "personalInfo": {
    "name": "candidate full name",
    "email": "email address",
    "phone": "phone number",
    "address": "",
    "city": "city name",
    "state": "state or region",
    "zip": "",
    "linkedin": "linkedin URL or profile path",
    "website": "personal website URL if any",
    "summary": "professional summary or objective if present, else empty string"
  },
  "experience": [
    {
      "title": "job title only (no dates, no company name)",
      "company": "company name only (no location)",
      "location": "city, state of company",
      "startDate": "Month Year (e.g. June 2023)",
      "endDate": "Month Year or Present",
      "current": true or false,
      "bullets": ["achievement or responsibility 1", "achievement 2"]
    }
  ],
  "education": [
    {
      "degree": "degree name and field (e.g. Bachelor of Technology in Computer Science)",
      "school": "institution name only (no location)",
      "location": "city, state of institution",
      "startDate": "Month Year or Year",
      "endDate": "Month Year or Year",
      "gpa": "GPA value if listed, else empty string",
      "honors": "honors or distinctions if listed, else empty string"
    }
  ],
  "skills": [
    { "name": "individual skill name (not a category, not a comma-separated list)", "level": "" }
  ],
  "projects": [
    {
      "name": "project name only",
      "description": "tech stack or brief description (no dates)",
      "startDate": "Month Year",
      "endDate": "Month Year or Present",
      "bullets": ["detail 1", "detail 2"],
      "url": "project URL if listed, else empty string"
    }
  ],
  "certifications": [
    {
      "name": "certification name only",
      "issuer": "issuing organization",
      "date": "Month Year",
      "url": ""
    }
  ],
  "languages": [
    { "name": "language name", "proficiency": "proficiency level if stated" }
  ],
  "awards": [
    { "title": "award name", "issuer": "", "date": "", "description": "" }
  ]
}

Important rules:
- Split all skills into individual items (e.g. "Flutter", "Dart", "React" — not "Flutter, Dart, React")
- Keep job title clean — remove company name, dates, and tech stack from title field
- Keep company name clean — no location or dates
- Keep school name clean — no degree, no location
- Certifications: split name/issuer/date into separate fields
- If no data for a section, use an empty array []`;

  const result  = await model.generateContent(prompt);
  const raw     = result.response.text().trim();
  // Strip markdown code fences if Gemini wraps the JSON anyway
  const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const parsed  = JSON.parse(jsonStr);

  // Normalise: ensure all expected top-level keys are arrays/objects
  return {
    personalInfo:   { name: '', email: '', phone: '', address: '', city: '', state: '', zip: '', linkedin: '', website: '', summary: '', ...parsed.personalInfo },
    experience:     Array.isArray(parsed.experience)     ? parsed.experience     : [],
    education:      Array.isArray(parsed.education)      ? parsed.education      : [],
    skills:         Array.isArray(parsed.skills)         ? parsed.skills         : [],
    projects:       Array.isArray(parsed.projects)       ? parsed.projects       : [],
    certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
    languages:      Array.isArray(parsed.languages)      ? parsed.languages      : [],
    awards:         Array.isArray(parsed.awards)         ? parsed.awards         : [],
  };
}

/** Text → structured-resume parser */
function parseResumeText(text) {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);

  // ── Contact info ────────────────────────────────────────────────
  const email    = (text.match(/[\w.+-]+@[\w.-]+\.\w+/) || [])[0] || '';
  const phone    = (text.match(/(?:\+91[-\s]?)?[6-9]\d{9}|\+?1?[-.\s]?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/) || [])[0] || '';
  const linkedin = (text.match(/linkedin\.com\/in\/[\w-]+/) || [])[0] || '';

  // ── Name: first line that looks like "First Last" (title-cased, no digits/symbols) ──
  const name =
    lines.find((l) => /^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,3}$/.test(l) && l.length < 60) ||
    lines.find((l) => l.length > 2 && l.length < 60 && !/[@|:\d]/.test(l)) ||
    '';

  // ── Section headers ──────────────────────────────────────────────
  // A section header is a SHORT line with no colon-followed-by-content,
  // no bullet, no @ symbol, and matches a known heading keyword.
  const HEADERS = {
    summary:        /^(?:summary|profile|objective|about\s*me|professional\s*summary)/i,
    experience:     /^(?:experience|work\s*experience|employment|work\s*history|professional\s*experience|internship)/i,
    education:      /^(?:education|academic|qualification)/i,
    skills:         /^(?:skills|technical\s*skills|core\s*competenc|competenc|technologies)/i,
    projects:       /^(?:projects?|personal\s*projects?|key\s*projects?)/i,
    // "languages" alone or "language skills" — NOT "Languages:Dart,..." which has inline content
    languages:      /^(?:languages?\s*$|language\s*skills)/i,
    certifications: /^(?:certif|licenses?\s*(?:&|and)?\s*certif|credentials?)/i,
    awards:         /^(?:awards?|achievements?|honors?|accomplishments?)/i,
  };

  const isHeaderLine = (line) => {
    if (line.length < 2 || line.length > 65) return false;
    if (/^[•\-*]/.test(line)) return false;
    if (/@/.test(line)) return false;
    // If the line contains a colon with content after it, it's "Category: content", not a heading
    const ci = line.indexOf(':');
    if (ci > 0 && ci < line.length - 1) return false;
    return Object.values(HEADERS).some((re) => re.test(line));
  };

  const getSectionKey = (line) => {
    for (const [key, re] of Object.entries(HEADERS)) {
      if (re.test(line)) return key;
    }
    return null;
  };

  const sectionMap = {};
  let currentSection = null;
  for (const line of lines) {
    if (isHeaderLine(line)) {
      const key = getSectionKey(line);
      if (key) { currentSection = key; sectionMap[key] = sectionMap[key] || []; continue; }
    }
    if (currentSection) sectionMap[currentSection].push(line);
  }

  // ── Skills — strip "Category: values" prefix, split on commas ───
  const skills = (sectionMap.skills || [])
    .flatMap((l) => {
      const val = l.includes(':') ? l.split(':').slice(1).join(':') : l;
      return val.split(/[,|•·]/);
    })
    .map((s) => ({ name: s.trim(), level: '' }))
    .filter((s) => s.name.length > 1 && s.name.length < 60);

  // ── Languages ────────────────────────────────────────────────────
  const languages = (sectionMap.languages || [])
    .flatMap((l) => l.split(/[,|•·]/))
    .map((s) => ({ name: s.trim(), proficiency: '' }))
    .filter((s) => s.name.length > 0 && s.name.length < 40);

  // ── Summary ──────────────────────────────────────────────────────
  const summary = (sectionMap.summary || []).join(' ').trim();

  // ── Date helpers ─────────────────────────────────────────────────
  const MON_YEAR_SRC = '(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s*\\d{4}';
  const DATE_RANGE   = new RegExp(
    `(${MON_YEAR_SRC})\\s*[–\\-]\\s*(${MON_YEAR_SRC}|Present|present|current|\\d{4})`, 'i'
  );

  function extractDates(line) {
    const m = line.match(DATE_RANGE);
    if (!m) return { startDate: '', endDate: '', current: false };
    const end = /present|current/i.test(m[2]) ? 'Present' : m[2];
    return { startDate: m[1], endDate: end, current: end === 'Present' };
  }

  function stripDatesAndMeta(line) {
    return line
      .replace(new RegExp(`${MON_YEAR_SRC}\\s*[–\\-]\\s*(${MON_YEAR_SRC}|Present|present|current|\\d{4})`, 'gi'), '')
      .replace(/\|\s*[∼~≈]?\s*\d+\s*[Yy]ears?\b.*$/g, '')
      .replace(/\s*\|\s*$/, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  // ── Experience ───────────────────────────────────────────────────
  // PDF text may have lone "•" on its own line followed by text on the next line.
  // Continuation lines (from PDF word-wrap) are appended to the last bullet.
  const expLines  = sectionMap.experience || [];
  const experience = [];
  let currentExp   = null;
  let pendingBullet = false;

  for (const line of expLines) {
    const isLoneBullet   = /^[•\-*]$/.test(line);
    const startsWithBullet = /^[•\-*]\s+/.test(line);

    if (isLoneBullet) { pendingBullet = true; continue; }

    if (startsWithBullet && currentExp) {
      pendingBullet = false;
      currentExp.bullets.push(line.replace(/^[•\-*]\s*/, ''));
      continue;
    }

    if (pendingBullet && currentExp) {
      currentExp.bullets.push(line);
      pendingBullet = false;
      continue;
    }

    // New experience entry: line has a month-year date range
    if (DATE_RANGE.test(line) && line.length < 200) {
      if (currentExp) experience.push(currentExp);
      const { startDate, endDate, current } = extractDates(line);
      let title = stripDatesAndMeta(line);
      if (title.includes('—')) title = title.split('—')[0].trim();
      else if (title.includes('|')) title = title.split('|')[0].trim();
      currentExp = { title, company: '', location: '', startDate, endDate, current, bullets: [] };
      continue;
    }

    if (currentExp) {
      if (!currentExp.company && !startsWithBullet) {
        currentExp.company = line;
      } else if (currentExp.company && currentExp.bullets.length > 0) {
        // Continuation line from PDF word-wrap — append to last bullet
        const last = currentExp.bullets.length - 1;
        currentExp.bullets[last] += ' ' + line;
      }
    }
  }
  if (currentExp) experience.push(currentExp);

  // ── Education ────────────────────────────────────────────────────
  // School name line often comes BEFORE the degree/year line.
  const eduLines  = sectionMap.education || [];
  const education = [];
  let currentEdu  = null;

  for (const line of eduLines) {
    if (/^[•\-*]/.test(line)) continue;
    const hasYear = /\b\d{4}\b/.test(line);

    if (hasYear) {
      const { startDate, endDate } = extractDates(line);
      const gpaMatch = line.match(/GPA[:\s]+(\d+\.?\d*\s*\/\s*\d+\.?\d*|\d+\.?\d*)/i);
      const gpa      = gpaMatch?.[1]?.trim() || '';
      let   degree   = line
        .replace(new RegExp(`${MON_YEAR_SRC}\\s*[–\\-]\\s*(${MON_YEAR_SRC}|Present|\\d{4})`, 'gi'), '')
        .replace(/GPA[:\s]+[\d./\s]+/gi, '')
        .replace(/\|.*$/, '')
        .trim();

      if (currentEdu) {
        // School line already captured — fill in the degree details
        currentEdu.degree    = degree;
        currentEdu.startDate = startDate;
        currentEdu.endDate   = endDate;
        currentEdu.gpa       = gpa;
        education.push(currentEdu);
        currentEdu = null;
      } else {
        education.push({ degree, school: '', location: '', startDate, endDate, gpa, honors: '' });
      }
    } else {
      // Non-year line: treat as school / institution name
      if (!currentEdu) {
        currentEdu = { degree: '', school: line, location: '', startDate: '', endDate: '', gpa: '', honors: '' };
      } else {
        currentEdu.school += ' ' + line;
      }
    }
  }
  if (currentEdu && (currentEdu.school || currentEdu.degree)) education.push(currentEdu);

  // ── Certifications — split "Name|Issuer|...Date" on pipes ───────
  const certifications = (sectionMap.certifications || [])
    .filter((l) => l.length > 2)
    .map((l) => {
      const parts  = l.split('|').map((p) => p.trim());
      const name   = parts[0] || '';
      const issuer = parts[1] || '';
      const tail   = parts[parts.length - 1] || '';
      const dateM  = tail.match(new RegExp(`${MON_YEAR_SRC}|\\d{4}`, 'i'));
      const date   = dateM?.[0] || '';
      return { name, issuer, date, url: '' };
    });

  // ── Projects — "Name|Tech|DateRange" on pipes ───────────────────
  const projLines = sectionMap.projects || [];
  const projects  = [];
  let currentProj  = null;
  pendingBullet    = false;

  for (const line of projLines) {
    const isLone   = /^[•\-*]$/.test(line);
    const hasBullet = /^[•\-*]\s+/.test(line);

    if (isLone) { pendingBullet = true; continue; }

    if (hasBullet && currentProj) {
      currentProj.bullets.push(line.replace(/^[•\-*]\s*/, ''));
      pendingBullet = false;
      continue;
    }

    if (pendingBullet && currentProj) {
      currentProj.bullets.push(line);
      pendingBullet = false;
      continue;
    }

    if (!hasBullet) {
      // A line with "|" or a date range starts a new project; otherwise it's a continuation
      const isNewEntry = line.includes('|') || DATE_RANGE.test(line);
      if (currentProj && !isNewEntry) {
        // Continuation line from PDF word-wrap — append to last bullet
        if (currentProj.bullets.length > 0) {
          currentProj.bullets[currentProj.bullets.length - 1] += ' ' + line;
        }
        continue;
      }
      if (currentProj) projects.push(currentProj);
      const parts   = line.split('|');
      const projName = parts[0].trim();
      let description = '', startDate = '', endDate = '';
      if (parts.length > 1) {
        const rest = parts.slice(1).join(' ').trim();
        const dm   = rest.match(DATE_RANGE);
        if (dm) {
          startDate   = dm[1];
          endDate     = /present/i.test(dm[2]) ? 'Present' : dm[2];
          description = rest.replace(dm[0], '').trim().replace(/\s{2,}/g, ' ');
        } else {
          description = rest;
        }
      }
      currentProj = { name: projName, description, startDate, endDate, bullets: [], url: '' };
    }
  }
  if (currentProj) projects.push(currentProj);

  const expSlice  = experience.slice(0, 10);
  const skillsSlice = skills.slice(0, 30);

  // ── Auto-generate summary if the resume has no explicit summary section ──
  const autoSummary = summary || buildSummary(expSlice, skillsSlice);

  return {
    personalInfo: { name, email, phone, address: '', city: '', state: '', zip: '', linkedin, website: '', summary: autoSummary },
    experience:   expSlice,
    education:    education.slice(0, 5),
    skills:       skillsSlice,
    projects:     projects.slice(0, 10),
    certifications: certifications.slice(0, 10),
    languages:    languages.slice(0, 8),
    awards:       [],
  };
}

/**
 * Build a professional summary sentence from parsed experience + skills
 * when the resume has no explicit summary section.
 */
function buildSummary(experience, skills) {
  if (!experience.length && !skills.length) return '';

  const latest = experience[0] || {};

  // ── Years of experience ──────────────────────────────────────────
  let yearsLabel = '';
  if (latest.startDate) {
    const startYear = parseInt((latest.startDate.match(/\d{4}/) || [])[0], 10);
    const endYear   = latest.current
      ? new Date().getFullYear()
      : parseInt(((latest.endDate || '').match(/\d{4}/) || [])[0], 10);
    if (startYear && endYear && endYear >= startYear) {
      const yrs = endYear - startYear;
      yearsLabel = yrs === 0 ? 'less than a year of' : yrs === 1 ? '1 year of' : `${yrs}+ years of`;
    }
  }

  // ── Clean job title: strip trailing " Level-II", roman-numeral suffixes, " — Stack" ──
  const title = (latest.title || '')
    .replace(/\s+(?:Level|Tier|Grade)\s*[-–]?\s*[IVXivx\d]+\s*$/i, '') // "Level-II", "Tier 2"
    .replace(/\s+[IVX]{1,4}$/i, '')                                      // standalone roman numerals
    .trim() || 'Professional';

  // ── Top skills: skip vague single-word items, pick first 4 ──────
  const topSkills = skills
    .map((s) => s.name)
    .filter((n) => n.length > 2 && n.length < 35)
    .slice(0, 4);

  // ── Clean company name: strip merged city/state from end ─────────
  let company = '';
  if (latest.company) {
    company = latest.company
      .replace(/\s{2,}.*$/, '')      // split at 2+ spaces (PDF artifact)
      .replace(/Pvt\.?\s*Ltd\.?.*$/i, 'Pvt. Ltd.') // normalise Pvt. Ltd.
      .trim();
  }

  // ── Compose sentence ─────────────────────────────────────────────
  let sentence = title;
  if (yearsLabel) sentence += ` with ${yearsLabel} experience`;
  if (company)    sentence += ` at ${company}`;
  if (topSkills.length) sentence += `, specializing in ${topSkills.join(', ')}`;
  sentence += '.';

  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

/* ── Shared premium-access guard ─────────────────────────────────── */
async function assertPremiumAccess(userId, template) {
  if (!template?.isPremium) return; // free template — always OK
  const User = require('../models/User');
  const user = await User.findById(userId).select('resumePlan');
  if (!user || user.resumePlan !== 'premium') {
    const err = new Error('premium_required');
    err.status = 403;
    throw err;
  }
}

/* ── POST /api/resumes — create new resume ──────────────────────── */
exports.create = async (req, res, next) => {
  try {
    const { templateId, title = 'My Resume' } = req.body;

    let template = null;
    if (templateId) {
      template = await ResumeTemplate.findById(templateId);
      if (!template) return res.status(404).json({ message: 'Template not found' });
    }

    await assertPremiumAccess(req.user.id, template);

    const resume = await Resume.create({
      user:     req.user.id,
      template: template?._id || null,
      title,
    });

    res.status(201).json({ resume });
  } catch (err) {
    if (err.message === 'premium_required') return res.status(403).json({ message: 'premium_required' });
    next(err);
  }
};

/* ── GET /api/resumes/:id ───────────────────────────────────────── */
exports.get = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id).populate('template');
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    if (String(resume.user) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });

    res.json(resume);
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/resumes — list user's resumes ─────────────────────── */
exports.list = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user.id })
      .populate('template', 'name slug colorName')
      .sort({ updatedAt: -1 })
      .limit(20);
    res.json({ resumes });
  } catch (err) {
    next(err);
  }
};

/* ── PUT /api/resumes/:id ───────────────────────────────────────── */
exports.update = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    if (String(resume.user) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });

    const allowed = ['title', 'personalInfo', 'experience', 'education', 'skills',
                     'projects', 'certifications', 'languages', 'awards', 'template'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) resume[key] = req.body[key];
    });
    resume.status = 'draft';
    await resume.save();

    res.json({ resume });
  } catch (err) {
    next(err);
  }
};

/* ── DELETE /api/resumes/:id ────────────────────────────────────── */
exports.remove = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    if (String(resume.user) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });
    await resume.deleteOne();
    res.json({ message: 'Resume deleted' });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/resumes/upload — parse uploaded resume ───────────── */
exports.upload = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { templateId } = req.body;

    // Premium-access guard (check before parsing to fail fast)
    if (templateId) {
      const tpl = await ResumeTemplate.findById(templateId).select('isPremium');
      if (tpl) {
        try { await assertPremiumAccess(req.user.id, tpl); }
        catch (e) {
          try { fs.unlinkSync(req.file.path); } catch (_) {}
          return res.status(403).json({ message: 'premium_required' });
        }
      }
    }
    const filePath = req.file.path;
    const ext      = path.extname(req.file.originalname).toLowerCase();
    let   rawText  = '';

    try {
      if (ext === '.pdf') {
        const buffer = fs.readFileSync(filePath);
        const parsed = await pdfParse(buffer);
        rawText = parsed.text;
      } else if (['.docx', '.doc'].includes(ext)) {
        const result = await mammoth.extractRawText({ path: filePath });
        rawText = result.value;
      } else {
        rawText = fs.readFileSync(filePath, 'utf8');
      }
    } finally {
      // Clean up uploaded file
      try { fs.unlinkSync(filePath); } catch (_) {}
    }

    // Try AI parsing first; fall back to regex parser if Gemini fails or is unconfigured
    let parsed;
    let parsedBy = 'ai';
    try {
      parsed = await parseResumeWithGemini(rawText);
    } catch (aiErr) {
      console.warn(`[resume] Gemini parsing failed (${aiErr.message}), using regex fallback`);
      parsed = parseResumeText(rawText);
      parsedBy = 'regex';
    }

    // Create a new resume with the parsed data
    const resume = await Resume.create({
      user:     req.user.id,
      template: templateId || null,
      title:    `${parsed.personalInfo.name || 'Uploaded'} Resume`,
      ...parsed,
    });

    res.status(201).json({ resume, parsed, parsedBy });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/resumes/:id/download/docx ───────────────────────── */
exports.downloadDocx = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id).populate('template');
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    if (String(resume.user) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });

    const p = resume.personalInfo || {};
    const accentHex = resume.template?.accentColor?.replace('#', '') || '6b21a8';

    /* ── Build paragraphs ──────────────────────────────────────── */
    const para = (text, opts = {}) => new Paragraph({
      children: [new TextRun({ text: text || '', ...opts })],
      spacing: { after: 80 },
    });

    const heading = (text) => new Paragraph({
      children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: accentHex })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: accentHex } },
      spacing: { after: 120, before: 200 },
    });

    const bullet = (text) => new Paragraph({
      children: [new TextRun({ text: `• ${text}` })],
      spacing: { after: 60 },
      indent: { left: 360 },
    });

    const sections = [
      // Header
      new Paragraph({
        children: [new TextRun({ text: p.name || 'Your Name', bold: true, size: 36 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: [p.email, p.phone, p.city && p.state ? `${p.city}, ${p.state}` : p.address, p.linkedin].filter(Boolean).join(' | ') }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    ];

    // Summary
    if (p.summary) {
      sections.push(heading('Professional Summary'));
      sections.push(para(p.summary));
    }

    // Experience
    if (resume.experience?.length) {
      sections.push(heading('Work Experience'));
      resume.experience.forEach((exp) => {
        sections.push(new Paragraph({
          children: [
            new TextRun({ text: exp.title || '', bold: true }),
            new TextRun({ text: exp.company ? ` | ${exp.company}` : '' }),
            new TextRun({ text: exp.startDate ? `  ${exp.startDate}–${exp.current ? 'Present' : exp.endDate || ''}` : '', color: '6b7280' }),
          ],
          spacing: { after: 60 },
        }));
        (exp.bullets || []).forEach((b) => sections.push(bullet(b)));
      });
    }

    // Education
    if (resume.education?.length) {
      sections.push(heading('Education'));
      resume.education.forEach((edu) => {
        sections.push(new Paragraph({
          children: [
            new TextRun({ text: edu.degree || '', bold: true }),
            new TextRun({ text: edu.school ? ` — ${edu.school}` : '' }),
            new TextRun({ text: edu.endDate ? `  ${edu.endDate}` : '', color: '6b7280' }),
          ],
          spacing: { after: 60 },
        }));
      });
    }

    // Skills
    if (resume.skills?.length) {
      sections.push(heading('Skills'));
      sections.push(para(resume.skills.map((s) => s.name).join(' • ')));
    }

    // Projects
    if (resume.projects?.length) {
      sections.push(heading('Projects'));
      resume.projects.forEach((proj) => {
        sections.push(new Paragraph({
          children: [new TextRun({ text: proj.name || '', bold: true })],
          spacing: { after: 60 },
        }));
        if (proj.description) sections.push(para(proj.description));
        (proj.bullets || []).forEach((b) => sections.push(bullet(b)));
      });
    }

    // Certifications
    if (resume.certifications?.length) {
      sections.push(heading('Certifications'));
      resume.certifications.forEach((cert) => {
        sections.push(para(`${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`));
      });
    }

    // Languages
    if (resume.languages?.length) {
      sections.push(heading('Languages'));
      sections.push(para(resume.languages.map((l) => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ''}`).join(' • ')));
    }

    const doc = new Document({
      sections: [{ children: sections }],
    });

    const buffer = await Packer.toBuffer(doc);

    resume.downloadCount  = (resume.downloadCount || 0) + 1;
    resume.lastDownloaded = new Date();
    await resume.save();

    const filename = `${(p.name || 'resume').replace(/\s+/g, '_')}_resume.docx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};
