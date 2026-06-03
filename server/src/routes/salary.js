/**
 * @swagger
 * tags:
 *   name: Salary
 *   description: Salary estimation and admin management
 */
const express = require('express');
const router  = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/salaryController');

const adminOnly = [requireAuth, requireRole('admin')];

/**
 * @swagger
 * /salary/search:
 *   post:
 *     summary: Search salary data by job title and location
 *     tags: [Salary]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobTitle, location]
 *             properties:
 *               jobTitle: { type: string }
 *               location: { type: string }
 *     responses:
 *       200:
 *         description: Salary data
 *       404:
 *         description: No data found
 */
router.post('/search', ctrl.search);

/**
 * @swagger
 * /salary:
 *   get:
 *     summary: List all salary records (admin)
 *     tags: [Salary]
 *     security:
 *       - bearerAuth: []
 */
router.get('/',        ...adminOnly, ctrl.list);

/**
 * @swagger
 * /salary:
 *   post:
 *     summary: Create salary record (admin)
 *     tags: [Salary]
 *     security:
 *       - bearerAuth: []
 */
router.post('/',       ...adminOnly, ctrl.create);

/**
 * @swagger
 * /salary/bulk:
 *   post:
 *     summary: Bulk import salary records (admin)
 *     tags: [Salary]
 *     security:
 *       - bearerAuth: []
 */
router.post('/bulk',   ...adminOnly, ctrl.bulkImport);

/**
 * @swagger
 * /salary/{id}:
 *   put:
 *     summary: Update salary record (admin)
 *     tags: [Salary]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id',     ...adminOnly, ctrl.update);

/**
 * @swagger
 * /salary/{id}:
 *   delete:
 *     summary: Delete salary record (admin)
 *     tags: [Salary]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id',  ...adminOnly, ctrl.remove);

module.exports = router;
