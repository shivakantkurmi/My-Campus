const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { protect } = require('../middleware/auth');

// ── POST /api/feedback ────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { message, type } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const feedback = await Feedback.create({ userId: req.user._id, message, type });
    return res.status(201).json(feedback);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
