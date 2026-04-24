const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');

const getRecommendations = async (userId) => {
  const uid = new mongoose.Types.ObjectId(userId);
  const userLogs = await ActivityLog.find({ userId: uid }).distinct('courseId');

  const similarUsers = await ActivityLog.find({
    courseId: { $in: userLogs },
    userId: { $ne: uid }
  }).distinct('userId');

  return await ActivityLog.aggregate([
    { $match: { userId: { $in: similarUsers }, courseId: { $nin: userLogs } } },
    { $group: { _id: '$courseId', score: { $sum: 1 } } },
    { $sort: { score: -1 } },
    { $limit: 10 }
  ]);
};

module.exports = { getRecommendations };
