const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const os       = require('os');
const router   = express.Router();
const ctrl     = require('../controllers/resumeController');
const { requireAuth, requireRole } = require('../middleware/auth');

const jobseeker = [requireAuth, requireRole('jobseeker')];

/* ── Multer — resume file uploads ───────────────────────────────── */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `resume_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error(`Unsupported file type: ${ext}. Allowed: ${allowed.join(', ')}`));
  },
});

/* ── Routes ─────────────────────────────────────────────────────── */
router.get('/',                       ...jobseeker, ctrl.list);
router.post('/',                      ...jobseeker, ctrl.create);
router.post('/upload',                ...jobseeker, upload.single('resume'), ctrl.upload);
router.get('/:id',                    ...jobseeker, ctrl.get);
router.put('/:id',                    ...jobseeker, ctrl.update);
router.delete('/:id',                 ...jobseeker, ctrl.remove);
router.post('/:id/download/docx',     ...jobseeker, ctrl.downloadDocx);

module.exports = router;
