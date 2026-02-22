const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema(
  {
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    qrToken: { type: String, required: true }, // random UUID refreshed every 10s
    expiresAt: { type: Date, required: true },  // token validity window
    students: [
      {
        regNo: String,
        name: String,
      },
    ],
    ended: { type: Boolean, default: false },
    presentCount: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
