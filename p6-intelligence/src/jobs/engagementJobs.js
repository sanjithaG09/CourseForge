const cron = require('node-cron');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const email = require('../utils/emailService');

const MS_DAY = 24 * 60 * 60 * 1000;

// ─── Job 1: Re-engagement — daily at 7am ──────────────────────────────────────
// Finds students who have had zero activity in the last 7+ days and emails them.
const scheduleInactiveUserReminder = () => {
  cron.schedule('0 7 * * *', async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * MS_DAY);

      // Find users who have at least one log but none in the last 7 days
      const recentlyActiveIds = await ActivityLog.find({
        timestamp: { $gte: sevenDaysAgo },
      }).distinct('userId');

      const everActiveIds = await ActivityLog.find({
        timestamp: { $lt: sevenDaysAgo },
      }).distinct('userId');

      // Users active before 7 days ago but NOT recently
      const inactiveIds = everActiveIds.filter(
        (id) => !recentlyActiveIds.some((r) => r.toString() === id.toString())
      );

      if (inactiveIds.length === 0) {
        console.log('[p6] Inactive reminder: no inactive users found');
        return;
      }

      const users = await User.find({
        _id: { $in: inactiveIds },
        role: 'student',
      }).select('name email');

      for (const user of users) {
        // Find how many days since their last activity
        const lastLog = await ActivityLog.findOne({ userId: user._id })
          .sort({ timestamp: -1 })
          .select('timestamp');

        const daysSince = lastLog
          ? Math.floor((Date.now() - lastLog.timestamp) / MS_DAY)
          : 7;

        await email.sendInactiveUserReminder(user.email, user.name, daysSince);
      }

      console.log(`[p6] Inactive reminders sent to ${users.length} students`);
    } catch (err) {
      console.error('[p6] Inactive reminder job error:', err.message);
    }
  });
};

// ─── Job 2: Search-without-enroll nudge — every Sunday at 10am ───────────────
// Finds logged-in users who searched in the last 14 days but have no enroll action.
const scheduleSearchNoEnrollNudge = () => {
  cron.schedule('0 10 * * 0', async () => {
    try {
      const fourteenDaysAgo = new Date(Date.now() - 14 * MS_DAY);

      // Users who searched in the last 14 days
      const searchLogs = await ActivityLog.find({
        action: 'search',
        timestamp: { $gte: fourteenDaysAgo },
        userId: { $exists: true },
      }).select('userId metadata');

      if (searchLogs.length === 0) {
        console.log('[p6] Search-no-enroll nudge: no recent searches found');
        return;
      }

      // Users who enrolled in the same window
      const enrolledIds = await ActivityLog.find({
        action: 'enroll',
        timestamp: { $gte: fourteenDaysAgo },
      }).distinct('userId');

      const enrolledSet = new Set(enrolledIds.map((id) => id.toString()));

      // Deduplicate: one email per user, use their last search query
      const userLastSearch = {};
      for (const log of searchLogs) {
        const uid = log.userId.toString();
        if (!enrolledSet.has(uid)) {
          userLastSearch[uid] = log.metadata?.query || 'a course';
        }
      }

      const uids = Object.keys(userLastSearch);
      if (uids.length === 0) {
        console.log('[p6] Search-no-enroll nudge: all searchers already enrolled');
        return;
      }

      const users = await User.find({ _id: { $in: uids } }).select('name email');

      for (const user of users) {
        const query = userLastSearch[user._id.toString()];
        await email.sendSearchNoEnrollNudge(user.email, user.name, query);
      }

      console.log(`[p6] Search-no-enroll nudges sent to ${users.length} users`);
    } catch (err) {
      console.error('[p6] Search-no-enroll job error:', err.message);
    }
  });
};

const startEngagementJobs = () => {
  scheduleInactiveUserReminder();
  scheduleSearchNoEnrollNudge();
  console.log('[p6] Engagement jobs scheduled');
};

module.exports = startEngagementJobs;
