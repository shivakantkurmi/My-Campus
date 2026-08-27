const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 100 },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
    department: { type: String, required: true },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Enforce single admin at the DB / model level ────────────
// Mongoose 9 async middleware: use throw / return instead of next()
userSchema.pre('validate', async function () {
  if (this.role === 'admin') {
    const existing = await this.constructor.findOne(
      { role: 'admin', _id: { $ne: this._id } }
    );
    if (existing) {
      throw new Error('Only one admin account is allowed.');
    }
  }
});

// Admin account can never be blocked
userSchema.pre('save', async function () {
  if (this.role === 'admin' && this.isBlocked) {
    this.isBlocked = false;
  }
});

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare plain-text password with hash
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Never return password in JSON
userSchema.set('toJSON', {
  transform: (_, obj) => { delete obj.password; return obj; }
});

module.exports = mongoose.model('User', userSchema);
