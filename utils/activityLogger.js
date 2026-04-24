const ActivityLog = require('../models/ActivityLog');

// Fire-and-forget — never throws, never slows down the request
const logActivity = (userId, action, courseId = null, metadata = {}) => {
  if (!userId) return;
  ActivityLog.create({ userId, courseId, action, metadata }).catch((err) =>
    console.error('ActivityLog write error:', err.message)
  );
};

module.exports = logActivity;
