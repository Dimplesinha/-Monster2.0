/**
 * mailer.js — Nodemailer SMTP helper
 *
 * Reads generic SMTP env vars so it works with any provider (Gmail,
 * Mailgun, SendGrid, Brevo, etc.) without code changes.
 *
 * Behaviour by environment
 * ─────────────────────────────────────────────────────────────────
 * Development (NODE_ENV !== 'production'):
 *   • SMTP configured  → send email + still log code to console
 *                        (EMAIL_DEV_LOG=true, default)
 *   • SMTP missing     → log code to console only; registration
 *                        succeeds with a "demo mode" note
 *   • Send fails       → log error + code; registration still succeeds
 *
 * Production (NODE_ENV === 'production'):
 *   • SMTP missing     → throws — controller returns 500
 *   • Send fails       → throws — controller returns 500
 *     "Could not send verification email. Please try again later."
 *
 * Required env vars (when SMTP is active)
 * ─────────────────────────────────────────────────────────────────
 *   SMTP_HOST     e.g. smtp.gmail.com
 *   SMTP_PORT     e.g. 465 (SSL) or 587 (TLS)
 *   SMTP_SECURE   true  → port 465/SSL  |  false → port 587/TLS
 *   SMTP_USER     your login / sender address
 *   SMTP_PASS     your password or App Password
 *
 * Optional
 * ─────────────────────────────────────────────────────────────────
 *   SMTP_FROM       display name + address in "From:" header
 *                   default: "Monster <SMTP_USER>"
 *   EMAIL_DEV_LOG   true (default) — log code to console even when
 *                   SMTP sends successfully, for easy dev testing
 */

'use strict';

const nodemailer = require('nodemailer');

/* ── env helpers ─────────────────────────────────────────────────── */
const isProd  = () => process.env.NODE_ENV === 'production';
const devLog  = () => process.env.EMAIL_DEV_LOG !== 'false'; // default ON

function smtpConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

/* ── transport factory (new instance per call — keeps it simple) ─── */
function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true → port 465 SSL
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/* ── console log (dev / fallback) ────────────────────────────────── */
function logCodeToConsole(to, code) {}

/* ── plain-text template ─────────────────────────────────────────── */
function buildText(code) {
  return [
    'Hello,',
    '',
    `Your Monster verification code is: ${code}`,
    '',
    'Enter it on the confirmation screen. It expires in 15 minutes.',
    '',
    'If you did not create a Monster account, you can safely ignore this email.',
    '',
    '— The Monster team',
  ].join('\n');
}

/* ── HTML template ───────────────────────────────────────────────── */
function buildHtml(code) {
  const brand = '#6b21a8';
  const year  = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Verify your Monster account</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;
             font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">

      <table width="480" cellpadding="0" cellspacing="0" role="presentation"
             style="background:#ffffff;border-radius:12px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,0.09);
                    max-width:480px;width:100%;">

        <!-- ── Brand header ── -->
        <tr>
          <td style="background:${brand};padding:22px 36px;">
            <span style="font-size:26px;font-weight:900;color:#d8b4fe;
                         letter-spacing:-1.5px;line-height:1;
                         text-decoration:none;">Monster</span>
          </td>
        </tr>

        <!-- ── Body ── -->
        <tr>
          <td style="padding:36px 36px 24px;">

            <h1 style="margin:0 0 12px;font-size:20px;font-weight:800;
                       color:#1e1133;line-height:1.25;">
              Verify your email address
            </h1>

            <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
              Enter the code below to complete your Monster sign-up.
              It expires in <strong style="color:#1e1133;">15 minutes</strong>.
            </p>

            <!-- Code box -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td align="center"
                    style="background:#f5f3ff;border:2px solid #ddd6fe;
                           border-radius:10px;padding:28px 20px;">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:700;
                             text-transform:uppercase;letter-spacing:0.1em;
                             color:#9ca3af;">
                    Verification code
                  </p>
                  <p style="margin:0;font-size:46px;font-weight:900;
                             letter-spacing:0.45em;color:${brand};line-height:1.1;">
                    ${code}
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">
              If you did not create a Monster account, you can safely ignore this email.
            </p>

          </td>
        </tr>

        <!-- ── Footer ── -->
        <tr>
          <td style="border-top:1px solid #e5e7eb;padding:14px 36px;
                     background:#f9fafb;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">
              &copy; ${year} Monster. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
}

/* ── public API ──────────────────────────────────────────────────── */
/**
 * Send a 6-digit email verification code.
 *
 * @param {string} to    Recipient address
 * @param {string} code  6-digit code
 * @returns {{ ok: boolean, dev?: boolean, error?: string }}
 * @throws {Error} in production when SMTP is absent or the send fails
 */
async function sendVerificationEmail(to, code) {
  // ── No SMTP credentials ─────────────────────────────────────────
  if (!smtpConfigured()) {
    if (isProd()) {
      throw new Error(
        'SMTP is not configured. ' +
        'Set SMTP_HOST, SMTP_USER, and SMTP_PASS in the server environment.'
      );
    }
    // Dev-only fallback
    logCodeToConsole(to, code);
    return { ok: true, dev: true };
  }

  // ── SMTP configured — attempt send ─────────────────────────────
  try {
    const transport = createTransport();
    const from = process.env.SMTP_FROM ||
                 `"Monster" <${process.env.SMTP_USER}>`;

    const info = await transport.sendMail({
      from,
      to,
      subject: 'Your Monster verification code',
      text: buildText(code),
      html: buildHtml(code),
    });

    console.log(`📧  Email sent → ${to}  (id: ${info.messageId})`);

    // Log code to console in dev for easy testing
    if (!isProd() && devLog()) logCodeToConsole(to, code);

    return { ok: true };
  } catch (err) {
    if (isProd()) {
      // Surface to caller so it can return 500
      throw err;
    }
    // Dev: log and fall back so the developer can still verify via console
    console.error(`\n⚠️   Email send failed (${to}): ${err.message}`);
    logCodeToConsole(to, code);
    return { ok: false, error: err.message, dev: true };
  }
}

module.exports = { sendVerificationEmail };
