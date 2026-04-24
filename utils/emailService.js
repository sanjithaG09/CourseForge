const nodemailer = require('nodemailer');

const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️  Email not configured — skipping send to', to);
      console.warn('   Set EMAIL_USER and EMAIL_PASS in your .env file');
      return;
    }
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"CourseForge" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent → ${to} | ${subject}`);
  } catch (err) {
    console.error('❌ Email send error:', err.message);
  }
};

// ─── HTML helpers ──────────────────────────────────────────────

const wrap = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CourseForge</title>
</head>
<body style="margin:0;padding:0;background:#060910;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:540px;margin:40px auto;padding:0 16px;">

    <!-- Card -->
    <div style="background:#0d1117;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;">

      <!-- Top accent bar -->
      <div style="height:3px;background:linear-gradient(90deg,#0ea5e9,#10b981);"></div>

      <!-- Header -->
      <div style="padding:28px 36px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="display:inline-flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;background:linear-gradient(135deg,#0ea5e9,#10b981);border-radius:9px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff;">CF</div>
          <span style="font-size:18px;font-weight:700;color:#e8edf5;letter-spacing:-0.3px;">CourseForge</span>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:32px 36px;">
        ${content}
      </div>

      <!-- Footer -->
      <div style="padding:16px 36px 24px;border-top:1px solid rgba(255,255,255,0.06);">
        <p style="margin:0;font-size:12px;color:#4f5d6e;text-align:center;line-height:1.5;">
          You received this because you have a CourseForge account.<br>
          If this wasn't you, you can safely ignore this email.
        </p>
      </div>

    </div>
    <p style="text-align:center;font-size:11px;color:#2a3441;margin-top:16px;">© 2025 CourseForge. All rights reserved.</p>
  </div>
</body>
</html>`;

const otp_block = (otp) => `
  <div style="
    font-size:42px;font-weight:800;letter-spacing:16px;text-align:center;
    padding:24px 16px;
    background:#131b24;
    border:1.5px solid rgba(14,165,233,0.2);
    border-radius:12px;
    color:#38bdf8;
    margin:24px 0;
    font-family:'Courier New',monospace;
  ">${otp}</div>
`;

const p = (text) => `<p style="font-size:15px;line-height:1.65;color:#8b97aa;margin:0 0 14px">${text}</p>`;
const h2 = (text) => `<h2 style="font-size:22px;font-weight:700;color:#e8edf5;margin:0 0 20px;letter-spacing:-0.3px;">${text}</h2>`;
const note = (text) => `<p style="font-size:13px;color:#4f5d6e;margin:16px 0 0;padding:12px 16px;background:#0a1018;border-radius:8px;border-left:3px solid rgba(14,165,233,0.3);">${text}</p>`;

// ─── Auth OTPs ──────────────────────────────────────────────────

exports.sendSignupOTP = (email, name, otp) =>
  sendEmail({
    to: email,
    subject: 'Verify your CourseForge account',
    html: wrap(`
      ${h2('Welcome to CourseForge! 👋')}
      ${p(`Hi <strong style="color:#e8edf5">${name}</strong>, thanks for signing up! Use the code below to verify your email address and activate your account.`)}
      ${otp_block(otp)}
      ${note('This code expires in <strong style="color:#8b97aa">10 minutes</strong>. Do not share it with anyone.')}
    `),
  });

exports.sendForgotPasswordOTP = (email, name, otp) =>
  sendEmail({
    to: email,
    subject: 'Reset your CourseForge password',
    html: wrap(`
      ${h2('Password Reset Request 🔐')}
      ${p(`Hi <strong style="color:#e8edf5">${name}</strong>, we received a request to reset your password. Enter the code below to proceed.`)}
      ${otp_block(otp)}
      ${note('This code expires in <strong style="color:#8b97aa">10 minutes</strong>. If you did not request this, your account remains secure — no action needed.')}
    `),
  });

// ─── Course notifications ────────────────────────────────────────

exports.sendCoursePublished = (email, instructorName, courseTitle) =>
  sendEmail({
    to: email,
    subject: `Your course "${courseTitle}" is now live!`,
    html: wrap(`
      ${h2('🎉 Course Published!')}
      ${p(`Hi <strong style="color:#e8edf5">${instructorName}</strong>, great news — your course is live!`)}
      ${p(`<strong style="color:#e8edf5">"${courseTitle}"</strong> is now visible to students on CourseForge. Share it with your network to start getting enrollments.`)}
    `),
  });

exports.sendNewCourseNotification = (email, studentName, courseTitle, instructorName) =>
  sendEmail({
    to: email,
    subject: `New course: "${courseTitle}"`,
    html: wrap(`
      ${h2('📚 New Course Available')}
      ${p(`Hi <strong style="color:#e8edf5">${studentName}</strong>!`)}
      ${p(`A new course <strong style="color:#38bdf8">"${courseTitle}"</strong> by <strong style="color:#e8edf5">${instructorName}</strong> just went live on CourseForge.`)}
      ${p('Log in now to check it out and enroll before it fills up!')}
    `),
  });

exports.sendCourseCompleted = (email, studentName, courseTitle) =>
  sendEmail({
    to: email,
    subject: `Congratulations! You completed "${courseTitle}"`,
    html: wrap(`
      ${h2('🎓 Course Completed!')}
      ${p(`Amazing work, <strong style="color:#e8edf5">${studentName}</strong>!`)}
      ${p(`You've successfully completed <strong style="color:#38bdf8">"${courseTitle}"</strong>. That's a real achievement!`)}
      ${p('Keep the momentum going — explore more courses on CourseForge and keep building your skills.')}
    `),
  });

// ─── Reminder emails ─────────────────────────────────────────────

exports.sendStudyReminder = (email, studentName, courseCount) =>
  sendEmail({
    to: email,
    subject: "Don't forget to continue your learning!",
    html: wrap(`
      ${h2('📖 Time to Learn!')}
      ${p(`Hi <strong style="color:#e8edf5">${studentName}</strong>,`)}
      ${p(`You have <strong style="color:#38bdf8">${courseCount} course${courseCount !== 1 ? 's' : ''}</strong> in progress. Even 15 minutes a day makes a huge difference!`)}
      ${p('Log in and pick up where you left off.')}
    `),
  });

exports.sendInstructorUploadReminder = (email, instructorName) =>
  sendEmail({
    to: email,
    subject: 'Your students are waiting for new content!',
    html: wrap(`
      ${h2('🎤 Share Your Knowledge!')}
      ${p(`Hi <strong style="color:#e8edf5">${instructorName}</strong>,`)}
      ${p("It's been a while since you've uploaded new content. Your students would love to hear more from you!")}
      ${p('Log in to CourseForge and add new lessons or create a brand-new course today.')}
    `),
  });

exports.sendStaleDraftReminder = (email, instructorName, courseTitle, daysAgo) =>
  sendEmail({
    to: email,
    subject: `Your draft "${courseTitle}" is ready to publish!`,
    html: wrap(`
      ${h2('📝 Unpublished Draft Reminder')}
      ${p(`Hi <strong style="color:#e8edf5">${instructorName}</strong>,`)}
      ${p(`You created the draft <strong style="color:#38bdf8">"${courseTitle}"</strong> <strong style="color:#e8edf5">${daysAgo} days ago</strong>, but it hasn't been published yet.`)}
      ${p("Your future students are waiting! Log in and publish your course to make it available.")}
    `),
  });
