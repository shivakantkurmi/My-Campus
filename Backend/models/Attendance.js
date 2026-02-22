const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
    studentRegNo: { type: String, required: true },
    deviceId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate attendance from same device per session
attendanceSchema.index({ sessionId: 1, deviceId: 1 }, { unique: true });
// Prevent same student marking twice in same session
attendanceSchema.index({ sessionId: 1, studentRegNo: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
