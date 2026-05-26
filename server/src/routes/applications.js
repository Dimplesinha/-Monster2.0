const router = require('express').Router();
const {
  myApplications, jobApplications, updateStatus,
} = require('../controllers/applicationController');
const { requireAuth, requireRole } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Job application management
 */

/**
 * @swagger
 * /applications/mine:
 *   get:
 *     tags: [Applications]
 *     summary: Get all applications submitted by the current job seeker
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of applications
 */
router.get('/mine', requireAuth, requireRole('jobseeker'), myApplications);

/**
 * @swagger
 * /applications/job/{jobId}:
 *   get:
 *     tags: [Applications]
 *     summary: Get all applicants for a job (employer only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Array of applications
 */
router.get('/job/:jobId', requireAuth, requireRole('employer', 'admin'), jobApplications);

/**
 * @swagger
 * /applications/{id}/status:
 *   patch:
 *     tags: [Applications]
 *     summary: Update application status (employer only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewed, shortlisted, rejected]
 *     responses:
 *       200:
 *         description: Updated application
 */
router.patch('/:id/status', requireAuth, requireRole('employer', 'admin'), updateStatus);

module.exports = router;
