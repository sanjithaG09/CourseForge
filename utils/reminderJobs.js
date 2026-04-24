const cron = require('node-cron');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const email = require('./emailService');

const MS_DAY = 24 * 60 * 60 * 1000;

const startReminderJobs = () => {
  // Student study reminder — every Monday at 9am
  // Sends to students with in-progress courses they haven't touched in 7+ days
  cron.schedule('0 9 * * 1', async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * MS_DAY);

      const staleUserIds = await Enrollment.find({
        isCompleted: false,
        lastAccessedAt: { $lt: sevenDaysAgo },
      }).distinct('user');

      for (const userId of staleUserIds) {
        const user = await User.findById(userId).select('name email role');
        if (!user || user.role !== 'student') continue;

        const count = await Enrollment.countDocuments({ user: userId, isCompleted: false });
        if (count > 0) {
          await email.sendStudyReminder(user.email, user.name, count);
        }
      }
      console.log(`Study reminders sent to ${staleUserIds.length} students`);
    } catch (err) {
      console.error('Study reminder job error:', err.message);
    }
  });

  // Instructor upload reminder — every Monday at 10am
  // Sends to instructors who haven't created/updated any course in 14+ days
  cron.schedule('0 10 * * 1', async () => {
    try {
      const twoWeeksAgo = new Date(Date.now() - 14 * MS_DAY);
      const instructors = await User.find({ role: 'instructor' }).select('name email');

      for (const instructor of instructors) {
        const recent = await Course.findOne({
          instructor: instructor._id,
          updatedAt: { $gte: twoWeeksAgo },
        });
        if (!recent) {
          await email.sendInstructorUploadReminder(instructor.email, instructor.name);
        }
      }
      console.log('Instructor upload reminders processed');
    } catch (err) {
      console.error('Instructor upload reminder job error:', err.message);
    }
  });

  // Stale draft reminder — every day at 8am
  // Sends to instructors whose drafts are 7+ days old and still unpublished
  cron.schedule('0 8 * * *', async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * MS_DAY);

      const staleDrafts = await Course.find({
        isPublished: false,
        createdAt: { $lt: sevenDaysAgo },
      }).populate('instructor', 'name email');

      for (const draft of staleDrafts) {
        if (!draft.instructor?.email) continue;
        const daysAgo = Math.floor((Date.now() - draft.createdAt) / MS_DAY);
        await email.sendStaleDraftReminder(
          draft.instructor.email,
          draft.instructor.name,
          draft.title,
          daysAgo
        );
      }
      console.log(`Stale draft reminders sent for ${staleDrafts.length} drafts`);
    } catch (err) {
      console.error('Stale draft reminder job error:', err.message);
    }
  });

  console.log('Reminder jobs scheduled');
};

module.exports = startReminderJobs;
