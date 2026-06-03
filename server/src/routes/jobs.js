const router = require('express').Router();
const {
  listJobs, getJob, createJob, myJobs, deleteJob,
  applyToJob, checkApplied, myAppliedJobIds,
} = require('../controllers/jobController');
const { requireAuth, requireRole } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job listing endpoints
 */

/**
 * @swagger
 * /jobs:
 *   get:
 *     tags: [Jobs]
 *     summary: List jobs with optional filters
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Full-text keyword search
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *     responses:
 *       200:
 *         description: Paginated list of jobs
 */
router.get('/', listJobs);

/**
 * @swagger
 * /jobs/mine:
 *   get:
 *     tags: [Jobs]
 *     summary: Get jobs posted by the current employer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of jobs
 */
router.get('/mine', requireAuth, requireRole('employer', 'admin'), myJobs);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     tags: [Jobs]
 *     summary: Get a single job
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Job object
 *       404:
 *         description: Not found
 */
router.get('/:id', getJob);

/**
 * @swagger
 * /jobs:
 *   post:
 *     tags: [Jobs]
 *     summary: Create a new job (employer only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, company, location, description]
 *             properties:
 *               title: { type: string }
 *               company: { type: string }
 *               location: { type: string }
 *               type: { type: string }
 *               remote: { type: boolean }
 *               salary: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Job created
 */
router.post('/', requireAuth, requireRole('employer', 'admin'), createJob);

/**
 * @swagger
 * /jobs/{id}:
 *   delete:
 *     tags: [Jobs]
 *     summary: Delete a job (owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Job deleted
 */
router.delete('/:id', requireAuth, requireRole('employer', 'admin'), deleteJob);

/**
 * @swagger
 * /jobs/{id}/apply:
 *   post:
 *     tags: [Jobs]
 *     summary: Apply to a job
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coverNote: { type: string, maxLength: 1000 }
 *     responses:
 *       201:
 *         description: Application submitted
 *       409:
 *         description: Already applied
 */
router.post('/:id/apply', requireAuth, requireRole('jobseeker'), applyToJob);

/**
 * @swagger
 * /jobs/{id}/applied:
 *   get:
 *     tags: [Jobs]
 *     summary: Check if current jobseeker has applied to a job
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/applied', requireAuth, requireRole('jobseeker'), checkApplied);

/**
 * @swagger
 * /jobs/applied-ids:
 *   get:
 *     tags: [Jobs]
 *     summary: Get all job IDs the current jobseeker has applied to
 *     security:
 *       - bearerAuth: []
 */
router.get('/applied-ids', requireAuth, requireRole('jobseeker'), myAppliedJobIds);

module.exports = router;
