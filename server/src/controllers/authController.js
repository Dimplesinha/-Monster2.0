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
// Creates the account, stores a 6-digit code, and returns {message, email}.
// No JWT is issued here — the user must verify their email first.
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (await User.exists({ email })) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const code    = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Derive a display name from the supplied name or the email prefix
    const displayName = (name || '').trim() || email.split('@')[0];
    const userRole    = role === 'employer' ? 'employer' : 'jobseeker';

    await User.create({
      name: displayName,
      email,
      password,
      role: userRole,
      emailVerified: false,
      emailVerificationCode: code,
      emailVerificationExpires: expires,
    });

    // Send verification email (falls back to console warning if transport fails)
    await sendVerificationEmail(email, code);

    res.status(201).json({
      message: 'Registration successful. Please check your email for a 6-digit verification code.',
      email,
    });
  } catch (err) {
    next(err);
  }
};

/* ── login ───────────────────────────────────────────────────────── */
// Blocks login if email has not been verified yet.
// Legacy accounts (created before email-verification was added) have no
// verification code stored — they are auto-verified on first login so they
// aren't locked out.
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
      .select('+password +emailVerificationCode');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.emailVerified) {
      // No code means this is a legacy account that pre-dates email verification.
      // Auto-verify so the user isn't permanently locked out.
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
// Validates the 6-digit code, marks the account verified, and returns a JWT.
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

    // Already verified — just issue the token
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

    // Mark verified and clear the one-time code
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
// Generates a fresh 6-digit code for an unverified account.
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    // Generic response — avoids leaking whether the address is registered
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

    await sendVerificationEmail(email, code);

    res.json({ message: 'A new verification code has been sent to your email.' });
  } catch (err) {
    next(err);
  }
};
