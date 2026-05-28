const router = require('express').Router();
const { listArticles, getArticle } = require('../controllers/articleController');

/**
 * @swagger
 * tags:
 *   name: Articles
 *   description: Career advice article endpoints
 */

/**
 * @swagger
 * /articles:
 *   get:
 *     tags: [Articles]
 *     summary: List career advice articles
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Filter by category (Resume, Cover Letter, Interviews, Job Search, Salary, News & Market Insights)
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Keyword search across title, excerpt, and tags
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *         description: Maximum number of articles to return
 *     responses:
 *       200:
 *         description: Array of article summaries (body omitted)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   slug: { type: string }
 *                   title: { type: string }
 *                   category: { type: string }
 *                   excerpt: { type: string }
 *                   author: { type: string }
 *                   publishedAt: { type: string }
 *                   readTime: { type: string }
 *                   imageUrl: { type: string }
 *                   tags:
 *                     type: array
 *                     items: { type: string }
 */
router.get('/', listArticles);

/**
 * @swagger
 * /articles/{slug}:
 *   get:
 *     tags: [Articles]
 *     summary: Get a single article by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *         description: Article slug
 *     responses:
 *       200:
 *         description: Full article including body content
 *       404:
 *         description: Article not found
 */
router.get('/:slug', getArticle);

module.exports = router;
