const cron = require('node-cron');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const email = require('../utils/emailService');

const MS_DAY = 24 * 60 * 60 * 1000;

// Job 1: Re-engagement - daily at 7am
// Finds students who have had zero activity in the last 7+ days
// and sends them a reminder email.
const scheduleInactiveUserReminder = () => {
  cron.schedule('0 7 * * *', async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * MS_DAY);

      // Find users who were active in the last 7 days.
      const recentlyActiveIds = await ActivityLog.find({
        timestamp: { $gte: sevenDaysAgo },
      }).distinct('userId');

      // Find users who had activity before the last 7 days.
      const everActiveIds = await ActivityLog.find({
        timestamp: { $lt: sevenDaysAgo },
      }).distinct('userId');

      // Users who were active before 7 days ago
      // but have had no activity in the last 7 days.
      const inactiveIds = everActiveIds.filter(
        (id) =>
          !recentlyActiveIds.some(
            (recentId) => recentId.toString() === id.toString()
          )
      );

      if (inactiveIds.length === 0) {
        console.log('[p6] Inactive reminder: no inactive users found');
        return;
      }

      // Only send reminders to students.
      const users = await User.find({
        _id: { $in: inactiveIds },
        role: 'student',
      }).select('name email');

      // Get the latest activity for all inactive users
      // using one aggregation instead of one database query per user.
      const latestActivity = await ActivityLog.aggregate([
        {
          $match: {
            userId: { $in: inactiveIds },
          },
        },
        {
          $sort: {
            timestamp: -1,
          },
        },
        {
          $group: {
            _id: '$userId',
            lastActivity: { $first: '$timestamp' },
          },
        },
      ]);

      // Convert the aggregation result into a Map
      // for quick lookup by user ID.
      const latestActivityMap = new Map(
        latestActivity.map((log) => [
          log._id.toString(),
          log.lastActivity,
        ])
      );

      // Send an email to each inactive student.
      for (const user of users) {
        const lastActivity = latestActivityMap.get(
          user._id.toString()
        );

        const daysSince = lastActivity
          ? Math.floor(
              (Date.now() - lastActivity) / MS_DAY
            )
          : 7;

        await email.sendInactiveUserReminder(
          user.email,
          user.name,
          daysSince
        );
      }

      console.log(
        `[p6] Inactive reminders sent to ${users.length} students`
      );
    } catch (err) {
      console.error(
        '[p6] Inactive reminder job error:',
        err.message
      );
    }
  });
};


// Job 2: Search-without-enroll nudge - every Sunday at 10am
// Finds logged-in users who searched in the last 14 days
// but did not enroll.
const scheduleSearchNoEnrollNudge = () => {
  cron.schedule('0 10 * * 0', async () => {
    try {
      const fourteenDaysAgo = new Date(
        Date.now() - 14 * MS_DAY
      );

      // Find users who searched in the last 14 days.
      const searchLogs = await ActivityLog.find({
        action: 'search',
        timestamp: { $gte: fourteenDaysAgo },
        userId: { $exists: true },
      })
        .sort({ timestamp: -1 })
        .select('userId metadata timestamp');

      if (searchLogs.length === 0) {
        console.log(
          '[p6] Search-no-enroll nudge: no recent searches found'
        );
        return;
      }

      // Find users who enrolled in the same 14-day period.
      const enrolledIds = await ActivityLog.find({
        action: 'enroll',
        timestamp: { $gte: fourteenDaysAgo },
      }).distinct('userId');

      const enrolledSet = new Set(
        enrolledIds.map((id) => id.toString())
      );

      // Keep one email per user.
      // Since searchLogs are sorted newest-first,
      // the first search stored for each user is their latest search.
      const userLastSearch = {};

      for (const log of searchLogs) {
        const uid = log.userId.toString();

        if (
          !enrolledSet.has(uid) &&
          !userLastSearch[uid]
        ) {
          userLastSearch[uid] =
            log.metadata?.query || 'a course';
        }
      }

      const uids = Object.keys(userLastSearch);

      if (uids.length === 0) {
        console.log(
          '[p6] Search-no-enroll nudge: all searchers already enrolled'
        );
        return;
      }

      // Get the users who need a reminder.
      const users = await User.find({
        _id: { $in: uids },
      }).select('name email');

      // Send one reminder email to each user.
      for (const user of users) {
        const query =
          userLastSearch[user._id.toString()];

        await email.sendSearchNoEnrollNudge(
          user.email,
          user.name,
          query
        );
      }

      console.log(
        `[p6] Search-no-enroll nudges sent to ${users.length} users`
      );
    } catch (err) {
      console.error(
        '[p6] Search-no-enroll job error:',
        err.message
      );
    }
  });
};


// Start all engagement jobs.
const startEngagementJobs = () => {
  scheduleInactiveUserReminder();
  scheduleSearchNoEnrollNudge();

  console.log('[p6] Engagement jobs scheduled');
};

module.exports = startEngagementJobs;