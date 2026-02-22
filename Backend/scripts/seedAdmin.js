/**
 * Run ONCE to create the single Admin account.
 *
 * Usage:
 *   node scripts/seedAdmin.js
 *
 * Credentials are read from Backend/.env  (safe — never hardcoded):
 *   ADMIN_NAME      (default: Admin)
 *   ADMIN_EMAIL     (default: admin@mycampus.edu)
 *   ADMIN_PASSWORD  (default: Admin@123  <- change before running in production)
 *   ADMIN_DEPT      (default: Administration)
 *
 * The User model also enforces that only ONE admin can ever exist,
 * so running this script a second time simply prints a message and exits.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  // Guard: only one admin is allowed in the entire system
  const exists = await User.findOne({ role: 'admin' });
  if (exists) {
    console.log('⚠️  Admin already exists — only one admin is allowed.');
    console.log('   Email:', exists.email);
    process.exit(0);
  }

  // Read credentials from .env so nothing is hardcoded in source code
  const name       = process.env.ADMIN_NAME     || 'Admin';
  const email      = process.env.ADMIN_EMAIL    || 'admin@mycampus.edu';
  const password   = process.env.ADMIN_PASSWORD || 'Admin@123';
  const department = process.env.ADMIN_DEPT     || 'Administration';

  const admin = await User.create({ name, email, password, role: 'admin', department });

  console.log('✅ Admin account created!');
  console.log('   Name    :', admin.name);
  console.log('   Email   :', admin.email);
  console.log('   Password:', password, ' <- change this immediately!');
  process.exit(0);
}

seed().catch(err => { console.error('Seed error:', err.message); process.exit(1); });
