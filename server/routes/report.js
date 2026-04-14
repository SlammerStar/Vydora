const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const auth = require('../middleware/auth'); // Check if there's an auth middleware, otherwise require it conditionally

// Create a report
router.post('/', async (req, res) => {
  try {
    const { videoId, reason, details, reporterId } = req.body;
    
    if (!videoId || !reason || !details) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const report = new Report({
      videoId,
      reason,
      details,
      reporterId: reporterId || null
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (err) {
    console.error('Submit report error:', err);
    res.status(500).json({ message: 'Server error while submitting report' });
  }
});

// Get all reports (admin only typically)
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().populate('videoId', 'title thumbnailUrl').populate('reporterId', 'name email').sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error('Fetch reports error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
