/**
 * @swagger
 * tags:
 *   name: SavedJobs
 *   description: Jobseeker saved-jobs management
 */
const express = require('express');
const router  = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/savedJobController');

const jobseekerOnly = [requireAuth, requireRole('jobseeker')];

/**
 * @swagger
 * /saved-jobs/count:
 *   get:
 *     summary: Get saved jobs count (navbar badge)
 *     tags: [SavedJobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Count of saved jobs
 */
router.get('/count', ...jobseekerOnly, ctrl.getSavedCount);

/**
 * @swagger
 * /saved-jobs:
 *   get:
 *     summary: List all saved jobs for the current user
 *     tags: [SavedJobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: days
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated saved jobs list
 */
router.get('/', ...jobseekerOnly, ctrl.getSavedJobs);

/**
 * @swagger
 * /saved-jobs:
 *   post:
 *     summary: Save a job
 *     tags: [SavedJobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobId]
 *             properties:
 *               jobId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job saved
 *       409:
 *         description: Already saved
 */
router.post('/', ...jobseekerOnly, ctrl.saveJob);

/**
 * @swagger
 * /saved-jobs/{jobId}:
 *   delete:
 *     summary: Remove a saved job
 *     tags: [SavedJobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Removed
 *       404:
 *         description: Not found
 */
router.delete('/:jobId', ...jobseekerOnly, ctrl.unsaveJob);

module.exports = router;
