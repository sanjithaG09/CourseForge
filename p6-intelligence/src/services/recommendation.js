const ActivityLog = require('../models/ActivityLog');

const getRecommendations = async (userId) => {
  // 1. Find courses the user has already interacted with
  const userLogs = await ActivityLog.find({ userId }).distinct('courseId');

  // 2. Simple Collaborative Filtering: Find users who viewed the same courses
  const similarUsers = await ActivityLog.find({
    courseId: { $in: userLogs },
    userId: { $ne: userId }
  }).distinct('userId');

  // 3. Recommend courses those similar users liked that this user hasn't seen
  return await ActivityLog.aggregate([
    { $match: { userId: { $in: similarUsers }, courseId: { $nin: userLogs } } },
    { $group: { _id: '$courseId', score: { $sum: 1 } } },
    { $sort: { score: -1 } },
    { $limit: 10 }
  ]);
};

module.exports = { getRecommendations };