const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
    department: { type: String, required: true },
    profilePhoto: { type: String, default: '' }, // URL or base64
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Enforce single admin at the DB / model level ────────────
// This fires before every save (insert or update).
// If a document with role='admin' is being created/changed AND
// another admin already exists in the collection, reject it.
userSchema.pre('validate', async function (next) {
  if (this.role === 'admin') {
    const existing = await this.constructor.findOne(
      { role: 'admin', _id: { $ne: this._id } }
    );
    if (existing) {
      return next(new Error('Only one admin account is allowed.'));
    }
  }
  next();
});

// Admin account can never be blocked
userSchema.pre('save', function (next) {
  if (this.role === 'admin' && this.isBlocked) {
    this.isBlocked = false;
  }
  next();
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
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
