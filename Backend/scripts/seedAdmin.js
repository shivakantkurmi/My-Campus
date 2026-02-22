/**
 * Run once to create the single Admin account:
 *   node scripts/seedAdmin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const exists = await User.findOne({ role: 'admin' });
  if (exists) {
    console.log('Admin already exists:', exists.email);
    process.exit(0);
  }

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@mycampus.edu',
    password: 'Admin@123',   // Change this after first login
    role: 'admin',
    department: 'Administration',
  });

  console.log('Admin created successfully!');
  console.log('  Email   :', admin.email);
  console.log('  Password: Admin@123   ← change immediately!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
