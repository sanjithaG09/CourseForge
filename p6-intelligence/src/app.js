const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const { getRecommendations } = require('./services/recommendation');
require('./jobs/emailQueue'); // Start worker

const app = express();
app.use(express.json());

// P3 ↔ P6 Integration: Endpoint to fetch recommendations
app.get('/api/v1/recommendations/:userId', async (req, res) => {
  try {
    const data = await getRecommendations(req.params.userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Activity Logging Endpoint (Called by P1/P3)
app.post('/api/v1/track', async (req, res) => {
  const { userId, courseId, action } = req.body;
  // Logic for Dropout Risk Detection could go here (e.g., if inactivity > 7 days)
  res.status(202).send(); 
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT || 5005, () => console.log('P6 Intelligence Service Running'));
});