require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// ── Connect to MongoDB then auto-seed admin if needed ─────────
connectDB().then(async () => {
  try {
    const User = require('./models/User');
    const exists = await User.findOne({ role: 'admin' });
    if (!exists) {
      const name       = process.env.ADMIN_NAME     || 'Admin';
      const email      = process.env.ADMIN_EMAIL    || 'admin@mycampus.edu';
      const password   = process.env.ADMIN_PASSWORD || 'Admin@123';
      const department = process.env.ADMIN_DEPT     || 'Administration';
      await User.create({ name, email, password, role: 'admin', department });
      console.log('✅ Admin auto-seeded:', email);
    }
  } catch (e) {
    console.error('Admin seed error:', e.message);
  }
});

const app = express();

// ── Global Middleware ─────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded profile photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Rate Limiting ─────────────────────────────────────────────
const { globalLimiter } = require('./middleware/rateLimiter');
app.use('/api', globalLimiter);

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/cabins', require('./routes/cabins'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/stats', require('./routes/stats'));

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
