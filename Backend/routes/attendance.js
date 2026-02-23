const express = require('express');
const router = express.Router();
const { randomUUID: uuidv4 } = require('crypto');
const AttendanceSession = require('../models/AttendanceSession');
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/roleMiddleware');

// ── POST /api/attendance/session  (faculty) ───────────────────
// Creates a new attendance session with initial QR token
router.post('/session', protect, restrictTo('faculty'), async (req, res) => {
  try {
    const { students } = req.body;
    if (!students?.length)
      return res.status(400).json({ message: 'Student list required' });

    const qrToken = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 1000); // 10s window

    const session = await AttendanceSession.create({
      facultyId: req.user._id,
      qrToken,
      expiresAt,
      students,
      totalStudents: students.length,
    });

    return res.status(201).json({ session });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── POST /api/attendance/session/:id/refresh  (faculty) ───────
// Generates a new QR token every 10 seconds
router.post('/session/:id/refresh', protect, restrictTo('faculty'), async (req, res) => {
  try {
    const session = await AttendanceSession.findOne({ _id: req.params.id, facultyId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.ended) return res.status(400).json({ message: 'Session already ended' });

    session.qrToken = uuidv4();
    session.expiresAt = new Date(Date.now() + 10 * 1000);
    await session.save();

    return res.json({ qrToken: session.qrToken });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── GET /api/attendance/session/:id  (faculty) ────────────────
// Live attendance list for a session
router.get('/session/:id', protect, restrictTo('faculty'), async (req, res) => {
  try {
    const session = await AttendanceSession.findOne({ _id: req.params.id, facultyId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const records = await Attendance.find({ sessionId: session._id });
    const presentRegNos = new Set(records.map(r => r.studentRegNo.toUpperCase()));

    const list = session.students.map(s => ({
      regNo: s.regNo,
      name: s.name,
      present: presentRegNos.has(s.regNo.trim().toUpperCase()),
    }));

    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── POST /api/attendance/session/:id/end  (faculty) ──────────
router.post('/session/:id/end', protect, restrictTo('faculty'), async (req, res) => {
  try {
    const session = await AttendanceSession.findOne({ _id: req.params.id, facultyId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const count = await Attendance.countDocuments({ sessionId: session._id });
    session.ended = true;
    session.presentCount = count;
    await session.save();

    return res.json({ message: 'Session ended', presentCount: count });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/attendance/session/:id/manual  (faculty) ───────
// Manually toggle a student's attendance
router.patch('/session/:id/manual', protect, restrictTo('faculty'), async (req, res) => {
  try {
    const { present } = req.body;
    // Normalize to uppercase for consistency
    const regNo = (req.body.regNo || '').trim().toUpperCase();
    const session = await AttendanceSession.findOne({ _id: req.params.id, facultyId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (present) {
      // Upsert: mark present
      await Attendance.findOneAndUpdate(
        { sessionId: session._id, studentRegNo: regNo },
        { sessionId: session._id, studentRegNo: regNo, deviceId: 'manual', timestamp: new Date() },
        { upsert: true, new: true }
      );
    } else {
      // Remove attendance record
      await Attendance.deleteOne({ sessionId: session._id, studentRegNo: regNo });
    }

    return res.json({ message: 'Updated' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── GET /api/attendance/history  (faculty) ────────────────────
router.get('/history', protect, restrictTo('faculty'), async (req, res) => {
  try {
    const sessions = await AttendanceSession.find({ facultyId: req.user._id }).sort({ createdAt: -1 });
    return res.json(sessions);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── POST /api/attendance/mark  (student) ─────────────────────
// Anti-proxy: validates token, device-lock, session expiry
router.post('/mark', protect, restrictTo('student'), async (req, res) => {
  try {
    const { token, deviceId } = req.body;
    // Normalize regNo to uppercase to treat "23bcg10140" == "23BCG10140"
    const regNo = (req.body.regNo || '').trim().toUpperCase();

    if (!token || !regNo || !deviceId)
      return res.status(400).json({ message: 'token, regNo and deviceId are required' });

    // ── Global 20-minute device lock (cross-session) ──────────────────────────
    // Check BEFORE session lookup so it fires even if storage was cleared.
    // Because deviceId is derived from hardware (GPU/canvas/screen), not storage,
    // the same physical device always sends the same ID.
    const LOCK_MS = 20 * 60 * 1000;
    const recentByDevice = await Attendance.findOne({
      deviceId,
      timestamp: { $gt: new Date(Date.now() - LOCK_MS) },
    });
    if (recentByDevice) {
      const minsLeft = Math.ceil(
        (recentByDevice.timestamp.getTime() + LOCK_MS - Date.now()) / 60000
      );
      return res.status(429).json({
        message: `This device already marked attendance recently. Try after ${minsLeft} minute(s).`,
      });
    }

    // Find active session matching token
    const session = await AttendanceSession.findOne({ qrToken: token, ended: false });
    if (!session)
      return res.status(400).json({ message: 'Invalid or expired QR code. Ask faculty to refresh.' });

    // Check QR token expiry (10s window)
    if (new Date() > session.expiresAt)
      return res.status(400).json({ message: 'QR code expired. Please scan the latest QR.' });

    // Check student is in session list (case-insensitive)
    const studentEntry = session.students.find(
      s => s.regNo.trim().toUpperCase() === regNo
    );
    if (!studentEntry)
      return res.status(400).json({ message: 'Your registration number is not in this session.' });

    // ── Atomic insert — let unique indexes be the final guard ──
    // This eliminates the read→check→write race window that exists
    // under high concurrency (100+ simultaneous students).
    // We skip pre-flight duplicate reads and go straight to insert;
    // MongoDB's unique indexes on (sessionId,studentRegNo) and
    // (sessionId,deviceId) enforce correctness atomically.
    try {
      await Attendance.create({ sessionId: session._id, studentRegNo: regNo, deviceId });
    } catch (insertErr) {
      if (insertErr.code === 11000) {
        // Distinguish which unique constraint fired for a clear message
        const key = Object.keys(insertErr.keyValue || {})[0] || '';
        if (key.includes('deviceId')) {
          // Check how many minutes remain on the device lock
          const recent = await Attendance.findOne({
            deviceId,
            timestamp: { $gt: new Date(Date.now() - 20 * 60 * 1000) },
          });
          const minsLeft = recent
            ? Math.ceil((recent.timestamp.getTime() + 20 * 60 * 1000 - Date.now()) / 60000)
            : 0;
          return res.status(429).json({
            message: `This device already marked attendance recently. Try after ${minsLeft} minute(s).`,
          });
        }
        // studentRegNo duplicate — already marked (covers localStorage-cleared re-attempts too)
        return res.status(409).json({
          message: `Attendance already marked for ${studentEntry.name || regNo} in this session.`,
        });
      }
      throw insertErr; // re-throw unexpected errors
    }

    return res.status(201).json({
      message: 'Attendance marked successfully!',
      studentName: studentEntry.name || '',
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
