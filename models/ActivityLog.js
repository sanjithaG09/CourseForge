const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  courseId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  action:    { type: String, enum: ['view', 'enroll', 'complete_lesson', 'search'] },
  metadata:  Object,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
