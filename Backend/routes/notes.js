const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');

// ── GET /api/notes ────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const notes = await Note.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    return res.json(notes);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── POST /api/notes ───────────────────────────────────────────
router.post('/', protect, uploadLimiter, async (req, res) => {
  try {
    const { title, driveURL, subject, courseCode, faculty, slot, module, description } = req.body;
    if (!title || !driveURL || !subject)
      return res.status(400).json({ message: 'Title, Drive URL, and Subject are required' });

    const note = await Note.create({
      title, driveURL, subject, courseCode, faculty, slot, module, description,
      uploadedBy: req.user._id,
    });
    await note.populate('uploadedBy', 'name email');
    return res.status(201).json(note);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/notes/:id ────────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const isOwner = note.uploadedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorised to edit this note' });

    Object.assign(note, req.body);
    await note.save();
    await note.populate('uploadedBy', 'name email');
    return res.json(note);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/notes/:id ─────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const isOwner = note.uploadedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorised to delete this note' });

    await note.deleteOne();
    return res.json({ message: 'Note deleted' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
