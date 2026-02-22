const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const User = require('../models/User');
const FacultyCabin = require('../models/FacultyCabin');
const { protect } = require('../middleware/auth');

// ── GET /api/stats ────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const [notes, students, faculty, admins, cabins] = await Promise.all([
      Note.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      User.countDocuments({ role: 'admin' }),
      FacultyCabin.countDocuments(),
    ]);
    return res.json({
      notes,
      students,
      faculty,
      admins,
      users: students + faculty + admins,
      cabins,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
