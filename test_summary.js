require('dotenv').config();
const pdfParse = require('pdf-parse');
const fs       = require('fs');

const src = fs.readFileSync('./src/controllers/resumeController.js', 'utf8');
const start = src.indexOf('/** Text → structured-resume parser */');
const end   = src.indexOf('\n/* ── POST /api/resumes — create');
eval(src.slice(start, end).replace(/const \{[^}]+\} = require\([^)]+\);/g,'').replace(/const \w+ *= *require\([^)]+\);/g,''));

(async () => {
  const buf  = fs.readFileSync('/Users/dimple/Downloads/Dimple_Sinha_Resume_1.pdf');
  const pdoc = await pdfParse(buf);
  const res  = parseResumeText(pdoc.text);
  console.log('summary:', res.personalInfo.summary);
  console.log('name:', res.personalInfo.name);
})();
