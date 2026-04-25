const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[p6] Email not configured — skipping send to', to);
    return;
  }
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"CourseForge" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[p6] Email sent → ${to} | ${subject}`);
  } catch (err) {
    console.error('[p6] Email send error:', err.message);
  }
};

const wrap = (content) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#060910;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:540px;margin:40px auto;padding:0 16px;">
    <div style="background:#0d1117;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;">
      <div style="height:3px;background:linear-gradient(90deg,#0ea5e9,#10b981);"></div>
      <div style="padding:28px 36px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="display:inline-flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;background:linear-gradient(135deg,#0ea5e9,#10b981);border-radius:9px;font-weight:800;font-size:13px;color:#fff;display:flex;align-items:center;justify-content:center;">CF</div>
          <span style="font-size:18px;font-weight:700;color:#e8edf5;letter-spacing:-0.3px;">CourseForge</span>
        </div>
      </div>
      <div style="padding:32px 36px;">${content}</div>
      <div style="padding:16px 36px 24px;border-top:1px solid rgba(255,255,255,0.06);">
        <p style="margin:0;font-size:12px;color:#4f5d6e;text-align:center;">You received this because you have a CourseForge account.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

const p   = (t) => `<p style="font-size:15px;line-height:1.65;color:#8b97aa;margin:0 0 14px">${t}</p>`;
const h2  = (t) => `<h2 style="font-size:22px;font-weight:700;color:#e8edf5;margin:0 0 20px;letter-spacing:-0.3px;">${t}</h2>`;
const note = (t) => `<p style="font-size:13px;color:#4f5d6e;margin:16px 0 0;padding:12px 16px;background:#0a1018;border-radius:8px;border-left:3px solid rgba(14,165,233,0.3);">${t}</p>`;

// ─── Engagement: inactive user ────────────────────────────────────────────────
exports.sendInactiveUserReminder = (email, name, daysSince) =>
  sendEmail({
    to: email,
    subject: "We miss you on CourseForge!",
    html: wrap(`
      ${h2('👋 Long time no see, ' + name + '!')}
      ${p(`It's been <strong style="color:#e8edf5">${daysSince} days</strong> since you last visited CourseForge.`)}
      ${p('Your learning journey is waiting. Log back in and pick up where you left off — even 15 minutes a day compounds over time.')}
      ${note('Consistency beats intensity. Small daily sessions lead to big results.')}
    `),
  });

// ─── Engagement: searched but never enrolled ──────────────────────────────────
exports.sendSearchNoEnrollNudge = (email, name, searchQuery) =>
  sendEmail({
    to: email,
    subject: `Still looking for "${searchQuery}"?`,
    html: wrap(`
      ${h2('🔍 Found what you were looking for?')}
      ${p(`Hi <strong style="color:#e8edf5">${name}</strong>, you recently searched for <strong style="color:#38bdf8">"${searchQuery}"</strong> on CourseForge but haven't enrolled yet.`)}
      ${p('Explore the results and take the first step toward your learning goal today!')}
      ${note('Most students who enroll within 3 days of searching complete their first module the same week.')}
    `),
  });
