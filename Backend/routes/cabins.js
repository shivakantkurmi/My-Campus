const express = require('express');
const router = express.Router();
const FacultyCabin = require('../models/FacultyCabin');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/roleMiddleware');

// ── GET /api/cabins ───────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const cabins = await FacultyCabin.find().sort({ facultyName: 1 });
    return res.json(cabins);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── POST /api/cabins  (admin only) ────────────────────────────
router.post('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { facultyName, cabinNumber, contact, department } = req.body;
    if (!facultyName || !cabinNumber)
      return res.status(400).json({ message: 'Faculty name and cabin number are required' });

    const cabin = await FacultyCabin.create({ facultyName, cabinNumber, contact, department });
    return res.status(201).json(cabin);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/cabins/:id  (admin only) ─────────────────────────
router.put('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const cabin = await FacultyCabin.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cabin) return res.status(404).json({ message: 'Cabin not found' });
    return res.json(cabin);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/cabins/:id  (admin only) ──────────────────────
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const cabin = await FacultyCabin.findByIdAndDelete(req.params.id);
    if (!cabin) return res.status(404).json({ message: 'Cabin not found' });
    return res.json({ message: 'Cabin deleted' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
