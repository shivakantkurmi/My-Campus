const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    driveURL: { type: String, required: true },
    subject: { type: String, required: true },
    courseCode: { type: String, default: '' },
    faculty: { type: String, default: '' },
    slot: { type: String, default: '' },
    module: { type: Number, default: null },
    description: { type: String, default: '' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
