const mongoose = require('mongoose');

const facultyCabinSchema = new mongoose.Schema(
  {
    facultyName: { type: String, required: true, trim: true },
    cabinNumber: { type: String, required: true },
    contact: { type: String, default: '' },
    department: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FacultyCabin', facultyCabinSchema);
