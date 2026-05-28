/**
 * mailer.js
 *
 * Provides a single `sendVerificationEmail()` helper.
 *
 * Transport selection (checked once, then cached):
 *   1. Gmail SMTP  — if EMAIL_USER + EMAIL_PASS are set in .env
 *   2. Ethereal    — auto-created test account; preview URL logged to console.
 *                    No credentials needed; great for local development.
 *
 * Gmail setup (free, no paid plan needed):
 *   1. Enable 2-Step Verification on your Google account.
 *   2. Go to myaccount.google.com → Security → App passwords.
 *   3. Create an app password for "Mail".
 *   4. Copy the 16-char password into EMAIL_PASS in server/.env.
 *   5. Set EMAIL_USER to your Gmail address.
 */

const nodemailer = require('nodemailer');

/* ── transport singleton ─────────────────────────────────────────── */
let _transport = null;
let _usingEthereal = false;

async function getTransport() {
  if (_transport) return _transport;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // ── Gmail (or any SMTP service that supports the same shape) ──
    const service = process.env.EMAIL_SERVICE || 'gmail';
    _transport = nodemailer.createTransport({
      service,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log(`📧  Email: using ${service} (${process.env.EMAIL_USER})`);
  } else {
    // ── Ethereal fallback — no setup required ──────────────────────
    const testAccount = await nodemailer.createTestAccount();
    _transport = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    _usingEthereal = true;
    console.log('\n📧  Email: no credentials found — using Ethereal test account.');
    console.log('    Open the preview URL logged after each send to view the email.\n');
  }

  return _transport;
}

/* ── branded HTML template ───────────────────────────────────────── */
function buildHtml(code) {
  const brand = '#6b21a8';
  const year  = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" role="presentation"
             style="background:#ffffff;border-radius:12px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,0.09);max-width:480px;width:100%;">

        <!-- Brand header -->
        <tr>
          <td style="background:${brand};padding:22px 36px;">
            <span style="font-size:26px;font-weight:900;color:#d8b4fe;
                         letter-spacing:-1.5px;line-height:1;">Monster</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 36px 28px;">
            <h1 style="margin:0 0 10px;font-size:21px;font-weight:800;color:#1e1133;
                       line-height:1.25;">Verify your email address</h1>
            <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.55;">
              Enter the code below in the Monster app to complete your sign-up.
              It will expire in <strong>15 minutes</strong>.
            </p>

            <!-- Code box -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="background:#f5f3ff;border:2px solid #ddd6fe;border-radius:10px;
                           padding:28px 20px;text-align:center;">
                  <p style="margin:0 0 6px;font-size:11px;font-weight:700;
                             text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;">
                    Verification code
                  </p>
                  <p style="margin:0;font-size:44px;font-weight:900;
                             letter-spacing:0.4em;color:${brand};line-height:1.1;">
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

        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid #e5e7eb;padding:14px 36px;background:#f9fafb;">
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
 * Send a 6-digit verification code to the given address.
 * Falls back to console logging if transport fails (so registration
 * still succeeds even if email is misconfigured).
 */
async function sendVerificationEmail(to, code) {
  try {
    const transport = await getTransport();
    const from      = process.env.EMAIL_FROM ||
                      `"Monster Jobs" <${process.env.EMAIL_USER || 'noreply@monster-jobs.com'}>`;

    const info = await transport.sendMail({
      from,
      to,
      subject: 'Your Monster verification code',
      text: [
        `Your Monster verification code is: ${code}`,
        '',
        'It expires in 15 minutes.',
        '',
        'If you did not create a Monster account, you can safely ignore this email.',
      ].join('\n'),
      html: buildHtml(code),
    });

    // Ethereal: log the click-to-view preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\n──────────────────────────────────────────────────────');
      console.log(`📧  [ETHEREAL PREVIEW] View email at:`);
      console.log(`    ${previewUrl}`);
      console.log('──────────────────────────────────────────────────────\n');
    }

    return { ok: true, messageId: info.messageId };
  } catch (err) {
    // Never let an email failure block registration — just warn
    console.error(`\n⚠️  Email send failed for ${to}:`, err.message);
    console.warn(`    Falling back to console — code: ${code}\n`);
    return { ok: false, error: err.message };
  }
}

module.exports = { sendVerificationEmail };
