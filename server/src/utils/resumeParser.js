/* eslint-disable quotes */
'use strict';

/**
 * resumeParser.js
 *
 * Extracts structured profile data from uploaded resume files.
 * Supports: .pdf  .docx  .txt  .rtf
 *
 * Returns:
 *   { name, email, phone, linkedin, summary, skills,
 *     workExperience, education, profileLinks }
 */

const fs   = require('fs');
const path = require('path');

/* ── 1. Raw text extraction ──────────────────────────────────────── */

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    // pdf-parse reads the binary and returns .text
    const pdfParse = require('pdf-parse');
    const buffer   = fs.readFileSync(filePath);
    const result   = await pdfParse(buffer);
    return result.text || '';
  }

  if (ext === '.docx') {
    const mammoth = require('mammoth');
    const result  = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  }

  // .doc / .rtf / .txt — read as utf8 (best-effort; .doc is binary but
  // often contains embedded ASCII runs that are better than nothing)
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

/* ── 2. Section splitter ─────────────────────────────────────────── */

const SECTION_KEYS = {
  summary:   /^(summary|professional summary|career summary|profile|about|about me|objective|career objective|professional profile)\s*:?\s*$/i,
  skills:    /^(skills?|technical skills?|core competencies?|technologies?|expertise|tools?|key skills?|programming languages?|tech stack)\s*:?\s*$/i,
  experience:/^(experience|work experience|employment|employment history|professional experience|career history|work history|internships?)\s*:?\s*$/i,
  education: /^(education|academic|academic background|educational background|qualifications|degrees?|schooling)\s*:?\s*$/i,
  links:     /^(links?|social|profiles?|online|portfolio|websites?|github|linkedin|contact)\s*:?\s*$/i,
  certifications: /^(certifications?|certificates?|licenses?|credentials?|accreditations?)\s*:?\s*$/i,
};

function splitIntoSections(lines) {
  const sections = {};
  let current    = 'header'; // before any recognised header
  let buf        = [];

  const flush = () => {
    if (!sections[current]) sections[current] = [];
    sections[current].push(...buf);
    buf = [];
  };

  for (const line of lines) {
    // A section header is a short line (≤60 chars) matching one of the keys
    if (line.length <= 60) {
      for (const [key, re] of Object.entries(SECTION_KEYS)) {
        if (re.test(line)) {
          flush();
          current = key;
          break;
        }
      }
    }
    // Normalise bullets to plain text
    buf.push(line.replace(/^[•●◦▪\-\*]+\s*/, ''));
  }
  flush();
  return sections;
}

/* ── 3. Field extractors ─────────────────────────────────────────── */

function extractEmail(text) {
  const m = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return m ? m[0].toLowerCase() : null;
}

function extractPhone(text) {
  // Match international and domestic phone numbers
  const m = text.match(/(\+?[\d][\d\s\-().]{6,18}[\d])/);
  if (!m) return { raw: null, countryCode: '+1' };
  const raw = m[1].trim();
  // Detect country code prefix
  const ccMatch = raw.match(/^(\+\d{1,3})/);
  const cc      = ccMatch ? ccMatch[1] : '+1';
  const digits  = raw.replace(/^\+\d{1,3}[\s\-]?/, '').replace(/\D/g, '');
  return { raw: digits, countryCode: cc };
}

function extractLinkedIn(text) {
  const m = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([\w\-]+)/i);
  return m ? `https://www.linkedin.com/in/${m[1]}` : null;
}

function extractOtherLinks(text) {
  const links = [];
  // GitHub
  const gh = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([\w\-]+)/i);
  if (gh) links.push({ url: `https://github.com/${gh[1]}`, label: 'GitHub' });
  // Portfolio / other https URLs (avoid linkedin/github already found)
  const urls = [...text.matchAll(/https?:\/\/(?!(?:www\.)?linkedin\.com|(?:www\.)?github\.com)[\w.\-/?=#&%+@]+/gi)];
  for (const u of urls.slice(0, 3)) {
    links.push({ url: u[0], label: 'Portfolio' });
  }
  return links;
}

/**
 * Try to determine the candidate's name from the top lines.
 * Heuristic: first non-empty line that has ≤ 4 words, no special chars,
 * and doesn't look like a section header or contact detail.
 */
function extractName(headerLines) {
  for (const line of headerLines.slice(0, 6)) {
    const words = line.trim().split(/\s+/);
    if (
      words.length >= 2 &&
      words.length <= 4 &&
      /^[A-Za-z]/.test(line) &&
      !/[@\d:\/]/.test(line) &&
      !Object.values(SECTION_KEYS).some((re) => re.test(line))
    ) {
      return line.trim();
    }
  }
  return null;
}

function extractSkills(lines) {
  const raw = lines.join('\n');
  // Split on commas, pipes, bullets, newlines
  const items = raw
    .split(/[,|•·\n\r\t]+/)
    .map((s) => s.trim().replace(/^[\-*\s]+/, '').replace(/[\-*\s]+$/, ''))
    .filter((s) => s.length > 1 && s.length < 80)
    .filter((s) => !/^\d+%?$/.test(s));

  return [...new Set(items)].slice(0, 60);
}

function extractSummary(lines) {
  return lines.join(' ').replace(/\s{2,}/g, ' ').trim();
}

/* ── Date-range regex (used for experience / education) ──────────── */
const DATE_RANGE_RE = /(\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}|\d{4}|\d{1,2}\/\d{4})\s*[-–—to]+\s*(\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}|\d{4}|\d{1,2}\/\d{4}|present|current|now)/gi;

function extractWorkExperience(lines) {
  // Split the section into "entries" by detecting date-range lines
  const entries = [];
  let entry     = null;
  let descBuf   = [];

  const pushEntry = () => {
    if (entry) {
      entry.description = descBuf.join('\n').replace(/\n{3,}/g, '\n\n').trim();
      entries.push(entry);
    }
    entry   = null;
    descBuf = [];
  };

  for (const line of lines) {
    DATE_RANGE_RE.lastIndex = 0;
    const dateMatch = DATE_RANGE_RE.exec(line);

    if (dateMatch) {
      // Might be a new entry boundary
      pushEntry();
      const [fullRange, start, end] = dateMatch;
      entry = {
        title:     '',
        company:   '',
        startDate: start.trim(),
        endDate:   end.trim(),
        isCurrent: /present|current|now/i.test(end),
        location:  '',
        description: '',
      };
      // Text before the date on same line → likely company or title
      const before = line.slice(0, dateMatch.index).replace(/[|\-–:]+$/, '').trim();
      if (before) entry.company = before;
    } else if (entry) {
      // First short line after date header = title or company
      if (!entry.title && line.length < 100) {
        entry.title = line;
      } else if (!entry.company && line.length < 100 && !entry.description) {
        entry.company = line;
      } else {
        descBuf.push(line);
      }
    } else {
      // No entry started yet — might be the first entry without a date line above
      // Start an entry if the line looks like a job title (short, no dates)
      if (!entry && line.length < 80 && /[A-Za-z]/.test(line)) {
        entry = { title: line, company: '', startDate: '', endDate: '', isCurrent: false, location: '', description: '' };
      }
    }
  }
  pushEntry();

  return entries
    .filter((e) => e.title || e.company)
    .map((e) => ({
      ...e,
      // Swap title/company if they look reversed (company is often shorter)
      title:   e.title   || 'Role',
      company: e.company || '',
    }))
    .slice(0, 10);
}

function extractEducation(lines) {
  const entries = [];
  let entry     = null;
  let descBuf   = [];

  // Simple year regex for education (just year ranges)
  const yearRe = /\b(\d{4})\s*[-–—to]+\s*(\d{4}|present|current)\b/i;

  const pushEntry = () => {
    if (entry) {
      entry.description = descBuf.join(' ').trim();
      entries.push(entry);
    }
    entry   = null;
    descBuf = [];
  };

  for (const line of lines) {
    const yearMatch = line.match(yearRe);
    if (yearMatch) {
      // New education entry
      pushEntry();
      entry = {
        degree:      '',
        institution: '',
        fieldOfStudy:'',
        startYear:   yearMatch[1],
        endYear:     yearMatch[2],
        location:    '',
      };
      const before = line.slice(0, line.indexOf(yearMatch[0])).replace(/[|\-–:]+$/, '').trim();
      if (before) entry.institution = before;
    } else if (entry) {
      if (!entry.degree && line.length < 100) {
        entry.degree = line;
      } else if (!entry.institution && line.length < 100) {
        entry.institution = line;
      } else {
        descBuf.push(line);
      }
    } else if (!entry && line.length < 120 && /[A-Za-z]/.test(line)) {
      entry = { degree: line, institution: '', fieldOfStudy: '', startYear: '', endYear: '', location: '' };
    }
  }
  pushEntry();

  return entries
    .filter((e) => e.degree || e.institution)
    .slice(0, 8);
}

/* ── 4. Main export ──────────────────────────────────────────────── */

async function parseResume(filePath) {
  let rawText = '';
  try {
    rawText = await extractText(filePath);
  } catch (err) {
    console.error('[resumeParser] text extraction failed:', err.message);
    return null;
  }

  if (!rawText || rawText.trim().length < 20) return null;

  // Clean and split into lines
  const lines = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.replace(/\s{2,}/g, ' ').trim())
    .filter((l) => l.length > 0);

  const sections = splitIntoSections(lines);

  const email     = extractEmail(rawText);
  const phoneData = extractPhone(rawText);
  const linkedin  = extractLinkedIn(rawText);
  const otherLinks= extractOtherLinks(rawText);
  const name      = extractName(sections.header || lines);

  // Build links array
  const profileLinks = [];
  if (linkedin) profileLinks.push({ url: linkedin, label: 'LinkedIn' });
  profileLinks.push(...otherLinks);

  const result = {
    name,
    email,
    phone:            phoneData.raw,
    phoneCountryCode: phoneData.countryCode,
    linkedin,
    summary:          sections.summary    ? extractSummary(sections.summary)           : '',
    skills:           sections.skills     ? extractSkills(sections.skills)              : [],
    workExperience:   sections.experience ? extractWorkExperience(sections.experience)  : [],
    education:        sections.education  ? extractEducation(sections.education)        : [],
    profileLinks,
  };

  return result;
}

module.exports = { parseResume };
