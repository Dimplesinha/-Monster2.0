'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail } = require('../config/mailer');

/* ── helpers ─────────────────────────────────────────────────────── */
function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function safeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
  };
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/* ── register ────────────────────────────────────────────────────── */
/**
 * POST /auth/register
 * Creates the account, stores a 6-digit verification code, and sends
 * it to the user's email.  No JWT is issued until the code is verified.
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (await User.exists({ email })) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const code      = generateCode();
    const expires   = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    const displayName = (name || '').trim() || email.split('@')[0];
    const userRole  = role === 'employer' ? 'employer' : 'jobseeker';

    await User.create({
      name: displayName,
      email,
      password,
      role: userRole,
      emailVerified: false,
      emailVerificationCode: code,
      emailVerificationExpires: expires,
    });

    // ── Send verification email ────────────────────────────────────
    let emailResult;
    try {
      emailResult = await sendVerificationEmail(email, code);
    } catch (emailErr) {
      // Production: SMTP absent or send failed → 500
      console.error(`[register] Email failure for ${email}:`, emailErr.message);
      return res.status(500).json({
        message: 'Could not send verification email. Please try again later.',
      });
    }

    const message = emailResult.dev
      ? 'Registration successful. SMTP is not configured — your verification code has been printed to the server console.'
      : 'Registration successful. Please check your email for a 6-digit verification code.';

    res.status(201).json({ message, email });
  } catch (err) {
    next(err);
  }
};

/* ── login ───────────────────────────────────────────────────────── */
/**
 * POST /auth/login
 * Returns a JWT.  Blocks unverified accounts (403 needsVerification).
 * Legacy accounts (no code stored) are auto-verified on first login.
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
      .select('+password +emailVerificationCode');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.emailVerified) {
      // No code → legacy account created before email-verification existed
      if (!user.emailVerificationCode) {
        await User.updateOne({ _id: user._id }, { $set: { emailVerified: true } });
        const verifiedUser = await User.findById(user._id);
        return res.json({ token: signToken(verifiedUser), user: safeUser(verifiedUser) });
      }
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        needsVerification: true,
        email: user.email,
      });
    }

    res.json({ token: signToken(user), user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

/* ── me ──────────────────────────────────────────────────────────── */
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

/* ── verifyEmail ─────────────────────────────────────────────────── */
/**
 * POST /auth/verify-email
 * Validates the 6-digit code, marks the account verified, and returns a JWT.
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    const user = await User.findOne({ email })
      .select('+emailVerificationCode +emailVerificationExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Already verified — issue token immediately
    if (user.emailVerified) {
      return res.json({ token: signToken(user), user: safeUser(user) });
    }
    if (user.emailVerificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      return res.status(400).json({
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    await User.updateOne(
      { _id: user._id },
      {
        $set:   { emailVerified: true },
        $unset: { emailVerificationCode: '', emailVerificationExpires: '' },
      }
    );

    const verifiedUser = await User.findById(user._id);
    res.json({ token: signToken(verifiedUser), user: safeUser(verifiedUser) });
  } catch (err) {
    next(err);
  }
};

/* ── resendVerification ──────────────────────────────────────────── */
/**
 * POST /auth/resend-verification
 * Generates a fresh 6-digit code and emails it.
 */
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    // Generic reply — avoids revealing whether the address is registered
    if (!user || user.emailVerified) {
      return res.json({
        message: 'If that email is registered and unverified, a new code has been sent.',
      });
    }

    const code    = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await User.updateOne(
      { _id: user._id },
      { $set: { emailVerificationCode: code, emailVerificationExpires: expires } }
    );

    // ── Send verification email ────────────────────────────────────
    try {
      await sendVerificationEmail(email, code);
    } catch (emailErr) {
      console.error(`[resend] Email failure for ${email}:`, emailErr.message);
      return res.status(500).json({
        message: 'Could not send verification email. Please try again later.',
      });
    }

    res.json({ message: 'A new verification code has been sent to your email.' });
  } catch (err) {
    next(err);
  }
};
