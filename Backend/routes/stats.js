const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const User = require('../models/User');
const FacultyCabin = require('../models/FacultyCabin');
const { protect } = require('../middleware/auth');

// ── GET /api/stats ────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const [notes, users, cabins] = await Promise.all([
      Note.countDocuments(),
      User.countDocuments(),
      FacultyCabin.countDocuments(),
    ]);
    return res.json({ notes, users, cabins });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
