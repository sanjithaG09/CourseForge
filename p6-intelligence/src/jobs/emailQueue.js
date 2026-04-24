const { Worker } = require('bullmq');
const { connection } = require('../config/redis');
const nodemailer = require('nodemailer');

const emailWorker = new Worker('p6:email-queue', async (job) => {
  const { email, subject, body } = job.data;
  
  // Nodemailer configuration
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  await transporter.sendMail({
    from: '"Course Platform" <noreply@platform.com>',
    to: email,
    subject: subject,
    text: body
  });

  console.log(`Email sent to ${email}`);
}, { connection });

module.exports = emailWorker;