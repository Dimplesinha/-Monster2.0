const router = require('express').Router();
const {
  createBlog,
  listMyBlogs,
  listPublicBlogs,
  getPublicBlog,
  getBlog,
  updateBlog,
  deleteBlog,
  publishBlog,
  unpublishBlog,
  aiAction,
} = require('../controllers/blogController');
const { requireAuth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: User blog management
 */

/* ── Public (no auth) ────────────────────────────────────────────── */

/**
 * @swagger
 * /blogs/public/{slug}:
 *   get:
 *     tags: [Blogs]
 *     summary: Fetch a published blog by slug (public)
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Blog object
 *       404:
 *         description: Not found or not published
 */
router.get('/public',       listPublicBlogs);  // list all published
router.get('/public/:slug', getPublicBlog);    // single post by slug

/* ── Authenticated ───────────────────────────────────────────────── */

/**
 * @swagger
 * /blogs:
 *   post:
 *     tags: [Blogs]
 *     summary: Create a new blog (draft)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:       { type: string }
 *               description: { type: string }
 *               content:     { type: string }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       201:
 *         description: Created blog
 */
router.post('/', requireAuth, createBlog);

/**
 * @swagger
 * /blogs:
 *   get:
 *     tags: [Blogs]
 *     summary: List the current user's blogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, published] }
 *     responses:
 *       200:
 *         description: Array of blogs (body omitted)
 */
router.get('/', requireAuth, listMyBlogs);

/**
 * @swagger
 * /blogs/{id}:
 *   get:
 *     tags: [Blogs]
 *     summary: Fetch one blog by ID (owner only, or published)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Blog object
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.get('/:id', requireAuth, getBlog);

/**
 * @swagger
 * /blogs/{id}:
 *   put:
 *     tags: [Blogs]
 *     summary: Update a draft blog
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
 *               title:       { type: string }
 *               description: { type: string }
 *               content:     { type: string }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200:
 *         description: Updated blog
 *       400:
 *         description: Cannot edit published blog
 *       403:
 *         description: Forbidden
 */
router.put('/:id', requireAuth, updateBlog);

/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     tags: [Blogs]
 *     summary: Soft-delete a blog
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', requireAuth, deleteBlog);

/**
 * @swagger
 * /blogs/{id}/publish:
 *   post:
 *     tags: [Blogs]
 *     summary: Publish a draft blog
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Published blog
 *       400:
 *         description: Validation error (empty title/content)
 */
router.post('/:id/publish', requireAuth, publishBlog);

/**
 * @swagger
 * /blogs/{id}/unpublish:
 *   post:
 *     tags: [Blogs]
 *     summary: Revert a published blog back to draft
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/unpublish', requireAuth, unpublishBlog);

/**
 * @swagger
 * /blogs/{id}/ai:
 *   post:
 *     tags: [Blogs]
 *     summary: Trigger an AI action on a blog (Sprint 3)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:  { type: string, enum: [generate_draft, improve, rewrite_tone, summarize] }
 *               prompt:  { type: string }
 *               content: { type: string }
 *               tone:    { type: string, enum: [professional, friendly, concise] }
 *     responses:
 *       200:
 *         description: AI result object
 *       503:
 *         description: AI not yet available
 */
router.post('/:id/ai', requireAuth, aiAction);

module.exports = router;
