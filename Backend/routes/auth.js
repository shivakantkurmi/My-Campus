const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');


// ── Generate JWT ──────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password || !role || !department)
      return res.status(400).json({ message: 'All fields are required' });

    if (email.length > 100)
      return res.status(400).json({ message: 'Email must not exceed 100 characters' });

    if (password.length < 4 || password.length > 16)
      return res.status(400).json({ message: 'Password must be between 4 and 16 characters' });

    if (role === 'admin')
      return res.status(403).json({ message: 'Admin registration is not allowed' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role, department });
    return res.status(201).json({ message: 'Registered successfully', userId: user._id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    if (email.length > 100)
      return res.status(400).json({ message: 'Email must not exceed 100 characters' });

    if (password.length < 4 || password.length > 16)
      return res.status(400).json({ message: 'Password must be between 4 and 16 characters' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.isBlocked)
      return res.status(403).json({ message: 'Your account has been blocked' });

    const token = signToken(user._id);
    return res.json({ token, user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/auth/profile ─────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, department, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (department) user.department = department;

    // Password change (optional)
    if (newPassword) {
      if (newPassword.length < 4 || newPassword.length > 16)
        return res.status(400).json({ message: 'New password must be between 4 and 16 characters' });

      if (!currentPassword)
        return res.status(400).json({ message: 'Current password required to set a new one' });
      const valid = await user.comparePassword(currentPassword);
      if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });
      user.password = newPassword; // pre-save hook will hash it
    }

    await user.save();
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────
router.get('/me', protect, (req, res) => res.json(req.user));

module.exports = router;
