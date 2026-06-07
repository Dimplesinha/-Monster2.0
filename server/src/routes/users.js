const router = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { upload }                   = require('../middleware/upload');
const {
  uploadResume,
  getResume,
  getOnboarding,
  updateContactInfo,
  updateResumeVisibility,
  updateJobPreferences,
  skipJobPreferences,
  updateCompanyProfile,
} = require('../controllers/userController');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Authenticated user / onboarding endpoints
 */

/* ────────────────────────────────────────────────────────────────── */
/*  RESUME                                                            */
/* ────────────────────────────────────────────────────────────────── */

/**
 * @swagger
 * /users/me/resume:
 *   post:
 *     tags: [Users]
 *     summary: Upload resume for the authenticated jobseeker
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Resume uploaded; onboarding.resumeUploaded set true
 *       400:
 *         description: No file or invalid type/size
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Not a jobseeker
 */
router.post(
  '/me/resume',
  requireAuth,
  requireRole('jobseeker'),
  (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
      if (!err) return next();
      if (err.code === 'LIMIT_FILE_SIZE')
        return res.status(400).json({ message: 'File too large. Maximum size is 5 MB.' });
      if (err.code === 'INVALID_FILE_TYPE')
        return res.status(400).json({ message: err.message });
      return res.status(400).json({ message: err.message || 'Upload error.' });
    });
  },
  uploadResume
);

/**
 * @swagger
 * /users/me/resume:
 *   get:
 *     tags: [Users]
 *     summary: Get the authenticated user's resume metadata
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resume metadata
 *       401:
 *         description: Unauthenticated
 *       404:
 *         description: No resume on file
 */
router.get('/me/resume', requireAuth, getResume);

/* ────────────────────────────────────────────────────────────────── */
/*  ONBOARDING                                                        */
/* ────────────────────────────────────────────────────────────────── */

/**
 * @swagger
 * /users/me/onboarding:
 *   get:
 *     tags: [Users]
 *     summary: Get the authenticated candidate's onboarding state
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: onboarding flags + profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 onboarding:
 *                   type: object
 *                 contactInfo:
 *                   type: object
 *                 resumeVisibility:
 *                   type: string
 *                 jobPreferences:
 *                   type: object
 *       401:
 *         description: Unauthenticated
 */
router.get('/me/onboarding', requireAuth, requireRole('jobseeker'), getOnboarding);

/**
 * @swagger
 * /users/me/contact-info:
 *   patch:
 *     tags: [Users]
 *     summary: Save candidate contact information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, country, zipCode, city, authorizedToWork]
 *             properties:
 *               firstName:        { type: string }
 *               lastName:         { type: string }
 *               phoneCountryCode: { type: string }
 *               phone:            { type: string }
 *               country:          { type: string }
 *               zipCode:          { type: string }
 *               city:             { type: string }
 *               authorizedToWork: { type: boolean }
 *     responses:
 *       200:
 *         description: Contact info saved; onboarding.contactInfoCompleted set true
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthenticated
 */
router.patch('/me/contact-info', requireAuth, requireRole('jobseeker'), updateContactInfo);

/**
 * @swagger
 * /users/me/resume-visibility:
 *   patch:
 *     tags: [Users]
 *     summary: Set candidate resume visibility preference
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resumeVisibility]
 *             properties:
 *               resumeVisibility:
 *                 type: string
 *                 enum: [hide_contact, visible, not_visible]
 *     responses:
 *       200:
 *         description: Visibility saved; onboarding.visibilityCompleted set true
 *       400:
 *         description: Invalid visibility value
 *       401:
 *         description: Unauthenticated
 */
router.patch('/me/resume-visibility', requireAuth, requireRole('jobseeker'), updateResumeVisibility);

/**
 * @swagger
 * /users/me/job-preferences:
 *   patch:
 *     tags: [Users]
 *     summary: Save candidate job search preferences
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [preferredJobTitle, country, city]
 *             properties:
 *               preferredJobTitle: { type: string }
 *               country:           { type: string }
 *               city:              { type: string }
 *               remoteInterested:  { type: boolean }
 *     responses:
 *       200:
 *         description: Preferences saved; onboarding.jobPreferencesCompleted set true
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthenticated
 */
router.patch('/me/job-preferences', requireAuth, requireRole('jobseeker'), updateJobPreferences);

/**
 * @swagger
 * /users/me/job-preferences/skip:
 *   patch:
 *     tags: [Users]
 *     summary: Skip job preferences step — marks onboarding complete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: onboarding.jobPreferencesSkipped set true
 *       401:
 *         description: Unauthenticated
 */
router.patch('/me/job-preferences/skip', requireAuth, requireRole('jobseeker'), skipJobPreferences);

/**
 * @swagger
 * /users/me/company-profile:
 *   patch:
 *     tags: [Users]
 *     summary: Save employer company profile (Getting Started onboarding)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, companyName, companySize]
 *             properties:
 *               firstName:   { type: string }
 *               lastName:    { type: string }
 *               companyName: { type: string }
 *               companySize: { type: string }
 *               website:     { type: string }
 *               phone:       { type: string }
 *               plan:        { type: string }
 *               agreeMarketing: { type: boolean }
 *     responses:
 *       200:
 *         description: Company profile saved; employerOnboardingComplete set true
 */
router.patch('/me/company-profile', requireAuth, requireRole('employer', 'admin'), updateCompanyProfile);

/* ── Resume Builder subscription ─────────────────────────────────── */
router.post('/me/resume-plan/upgrade', requireAuth, requireRole('jobseeker'), async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { resumePlan: 'premium' },
      { new: true }
    );
    // Return a fresh token so the client's JWT reflects the new plan
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user._id, role: user.role, resumePlan: 'premium' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.json({ message: 'Upgraded to premium', resumePlan: 'premium', token });
  } catch (err) { next(err); }
});

module.exports = router;
