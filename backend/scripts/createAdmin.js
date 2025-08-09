require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Flamingo';

async function createAdmin() {
  await mongoose.connect(MONGODB_URI);
  const email = 'admin@flamingo.com';
  const password = 'admin123';
  const name = 'Admin Principal';

  const exists = await User.findOne({ email });
  if (exists) {
    console.log('Un admin existe déjà avec cet email.');
    process.exit(0);
  }

  const admin = new User({
    name,
    email,
    password,
    role: 'admin',
  });
  await admin.save();
  console.log('Admin créé avec succès :', email, '/ mot de passe :', password);
  process.exit(0);
}

createAdmin(); 