const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/roleMiddleware');

const adminGuard = [protect, restrictTo('admin')];

// ── GET /api/admin/users ──────────────────────────────────────
router.get('/users', ...adminGuard, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admin/users/:id/block ─────────────────────────
router.patch('/users/:id/block', ...adminGuard, async (req, res) => {
  try {
    const { isBlocked } = req.body;

    // Safety: never allow blocking the admin account
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.role === 'admin')
      return res.status(403).json({ message: 'The admin account cannot be blocked.' });

    target.isBlocked = isBlocked;
    await target.save();
    return res.json({ message: `User ${isBlocked ? 'blocked' : 'unblocked'}`, user: target });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admin/complaints ─────────────────────────────────
router.get('/complaints', ...adminGuard, async (req, res) => {
  try {
    const list = await Feedback.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admin/complaints/:id/resolve ───────────────────
router.patch('/complaints/:id/resolve', ...adminGuard, async (req, res) => {
  try {
    const fb = await Feedback.findByIdAndUpdate(req.params.id, { status: 'resolved' }, { new: true });
    if (!fb) return res.status(404).json({ message: 'Complaint not found' });
    return res.json(fb);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
