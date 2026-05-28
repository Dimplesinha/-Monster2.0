const router = require('express').Router();
const {
  register,
  login,
  me,
  verifyEmail,
  resendVerification,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user (email + password only)
 *     description: >
 *       Creates the account with emailVerified=false and logs a 6-digit code
 *       to the server console (demo mode). No JWT is returned here — the client
 *       must call /auth/verify-email to complete sign-up.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               role:     { type: string, enum: [jobseeker, employer] }
 *     responses:
 *       201:
 *         description: Account created — verification code sent (logged to console in demo)
 *       409:
 *         description: Email already registered
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in and receive a JWT
 *     description: Returns 403 with needsVerification=true if email is not yet verified.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: JWT token + safe user object
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     tags: [Auth]
 *     summary: Verify email with 6-digit code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email: { type: string, format: email }
 *               code:  { type: string, minLength: 6, maxLength: 6 }
 *     responses:
 *       200:
 *         description: Verified — returns JWT + user
 *       400:
 *         description: Invalid or expired code
 *       404:
 *         description: User not found
 */
router.post('/verify-email', verifyEmail);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     tags: [Auth]
 *     summary: Resend email verification code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: New code sent (logged to console in demo)
 */
router.post('/resend-verification', resendVerification);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Safe user object
 */
router.get('/me', requireAuth, me);

module.exports = router;
