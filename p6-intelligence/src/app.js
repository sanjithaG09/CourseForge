const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const ActivityLog = require('./models/ActivityLog');

const app = express();
app.use(express.json());

// Track user activity — writes directly to MongoDB Atlas
app.post('/api/v1/track', async (req, res) => {
  try {
    const { userId, courseId, action, metadata } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ error: 'userId and action are required' });
    }

    const log = new ActivityLog({ userId, courseId, action, metadata });
    await log.save();

    res.status(201).json({ message: 'Activity logged' });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

// Retrieve activity logs for a user
app.get('/api/v1/activity/:userId', async (req, res) => {
  try {
    const logs = await ActivityLog.find({ userId: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(process.env.PORT || 5005, () =>
      console.log('P6 Activity Logger running on port', process.env.PORT || 5005)
    );
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
