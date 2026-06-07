const path    = require('path');
const fs      = require('fs');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
        BorderStyle, Table, TableRow, TableCell, WidthType } = require('docx');

const Resume         = require('../models/Resume');
const ResumeTemplate = require('../models/ResumeTemplate');

/* ── Helpers ─────────────────────────────────────────────────────── */

/** Rudimentary text → structured-resume parser */
function parseResumeText(text) {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);

  const email = (text.match(/[\w.+-]+@[\w.-]+\.\w+/) || [])[0] || '';
  const phone = (text.match(/(\+91[-\s]?|0)?[6-9]\d{9}|(\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4})/) || [])[0] || '';
  const linkedin = (text.match(/linkedin\.com\/in\/[\w-]+/) || [])[0] || '';
  const website  = (text.match(/(?:https?:\/\/)?(?:www\.)?[\w-]+\.\w{2,}(?:\/[\w-]*)*/) || [])[0] || '';

  // Attempt to extract name from first meaningful line
  const nameLine = lines.find((l) => l.length > 2 && l.length < 60 && !/[@\d{4}]/.test(l));
  const name = nameLine || '';

  // Section detection — find lines that look like section headers
  const HEADERS = {
    summary:        /^(summary|profile|objective|about me)/i,
    experience:     /^(experience|work experience|employment|work history|professional experience)/i,
    education:      /^(education|academic|qualification)/i,
    skills:         /^(skills|technical skills|core competencies|competencies)/i,
    projects:       /^(projects|personal projects|key projects)/i,
    certifications: /^(certification|certifications|licenses|credentials)/i,
    languages:      /^(languages?|language skills)/i,
    awards:         /^(awards|achievements|honors|accomplishments)/i,
  };

  const sectionMap = {};
  let currentSection = null;

  for (const line of lines) {
    const matched = Object.entries(HEADERS).find(([, re]) => re.test(line));
    if (matched) {
      currentSection = matched[0];
      sectionMap[currentSection] = sectionMap[currentSection] || [];
    } else if (currentSection) {
      sectionMap[currentSection].push(line);
    }
  }

  // Parse skills: each word or comma-separated item
  const skills = (sectionMap.skills || [])
    .flatMap((l) => l.split(/[,|•·]/))
    .map((s) => ({ name: s.trim(), level: '' }))
    .filter((s) => s.name.length > 1 && s.name.length < 50);

  // Parse languages
  const languages = (sectionMap.languages || [])
    .flatMap((l) => l.split(/[,|•·]/))
    .map((s) => ({ name: s.trim(), proficiency: '' }))
    .filter((s) => s.name.length > 0);

  // Parse certifications
  const certifications = (sectionMap.certifications || [])
    .map((l) => ({ name: l, issuer: '', date: '', url: '' }))
    .filter((c) => c.name.length > 2);

  // Extract summary
  const summary = (sectionMap.summary || []).join(' ').trim();

  // For experience — group lines into entries (very basic heuristic)
  const expLines = sectionMap.experience || [];
  const experience = [];
  let currentExp = null;
  for (const line of expLines) {
    const hasDate = /\d{4}/.test(line);
    if (hasDate && line.length < 120) {
      if (currentExp) experience.push(currentExp);
      currentExp = { title: line, company: '', location: '', startDate: '', endDate: '', current: false, bullets: [] };
    } else if (currentExp) {
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        currentExp.bullets.push(line.replace(/^[•\-*]\s*/, ''));
      } else if (!currentExp.company) {
        currentExp.company = line;
      }
    }
  }
  if (currentExp) experience.push(currentExp);

  // For education — similar approach
  const eduLines = sectionMap.education || [];
  const education = [];
  let currentEdu = null;
  for (const line of eduLines) {
    const hasDate = /\d{4}/.test(line);
    if (hasDate && line.length < 120) {
      if (currentEdu) education.push(currentEdu);
      currentEdu = { degree: line, school: '', location: '', startDate: '', endDate: '', gpa: '', honors: '' };
    } else if (currentEdu) {
      if (!currentEdu.school) currentEdu.school = line;
    }
  }
  if (currentEdu) education.push(currentEdu);

  return {
    personalInfo: { name, email, phone, address: '', city: '', state: '', zip: '', linkedin, website, summary },
    experience:   experience.slice(0, 10),
    education:    education.slice(0, 5),
    skills:       skills.slice(0, 20),
    projects:     [],
    certifications: certifications.slice(0, 10),
    languages:    languages.slice(0, 8),
    awards:       [],
  };
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

    const resume = await Resume.create({
      user:     req.user.id,
      template: template?._id || null,
      title,
    });

    res.status(201).json({ resume });
  } catch (err) {
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

    const parsed = parseResumeText(rawText);

    // Create a new resume with the parsed data
    const resume = await Resume.create({
      user:     req.user.id,
      template: templateId || null,
      title:    `${parsed.personalInfo.name || 'Uploaded'} Resume`,
      ...parsed,
    });

    res.status(201).json({ resume, parsed });
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
