const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/roleMiddleware');

const adminGuard = [protect, restrictTo('admin')];

const cleanupExpiredAnnouncements = async () => {
  const now = new Date();
  await Announcement.deleteMany({
    deadline: { $ne: null, $lte: now },
  });
};

// ── GET /api/announcements ────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    await cleanupExpiredAnnouncements();
    const announcements = await Announcement.find({
      $or: [{ deadline: null }, { deadline: { $gt: new Date() } }],
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    return res.json(announcements);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── POST /api/announcements ──────────────────────────────────
router.post('/', ...adminGuard, async (req, res) => {
  try {
    const { title, description, priority, deadline } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const parsedDeadline = deadline ? new Date(deadline) : null;
    if (parsedDeadline && Number.isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({ message: 'Deadline must be a valid date' });
    }

    const announcement = await Announcement.create({
      title,
      description,
      priority: priority || 'medium',
      deadline: parsedDeadline,
      createdBy: req.user._id,
    });

    await announcement.populate('createdBy', 'name email');
    return res.status(201).json(announcement);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/announcements/:id ───────────────────────────────
router.put('/:id', ...adminGuard, async (req, res) => {
  try {
    await cleanupExpiredAnnouncements();
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    const { title, description, priority, deadline } = req.body;
    if (title !== undefined) announcement.title = title;
    if (description !== undefined) announcement.description = description;
    if (priority !== undefined) announcement.priority = priority;
    if (deadline !== undefined) {
      announcement.deadline = deadline ? new Date(deadline) : null;
      if (announcement.deadline && Number.isNaN(announcement.deadline.getTime())) {
        return res.status(400).json({ message: 'Deadline must be a valid date' });
      }
    }

    await announcement.save();
    await announcement.populate('createdBy', 'name email');
    return res.json(announcement);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/announcements/:id ────────────────────────────
router.delete('/:id', ...adminGuard, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    return res.json({ message: 'Announcement discarded' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;