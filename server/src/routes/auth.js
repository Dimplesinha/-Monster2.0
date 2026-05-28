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
 *     summary: Register a new user (email + password)
 *     description: >
 *       Creates the account with emailVerified=false and sends a 6-digit
 *       verification code via SMTP.
 *       When SMTP is not configured in development the code is printed to
 *       the server console instead and the response message reflects this.
 *       No JWT is issued — the client must call /auth/verify-email first.
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
 *         description: Account created — verification code sent to email (or console in dev)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 email:   { type: string }
 *       400:
 *         description: Missing email or password
 *       409:
 *         description: Email already registered
 *       500:
 *         description: Could not send verification email (production only)
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
 *     description: >
 *       Generates a fresh 6-digit code and sends it via SMTP.
 *       In development without SMTP, the code is printed to the console.
 *       Returns a generic 200 regardless of whether the address is registered
 *       (prevents email enumeration).
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
 *         description: Code sent (or logged to console in dev without SMTP)
 *       500:
 *         description: Could not send verification email (production only)
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
