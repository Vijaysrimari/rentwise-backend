const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const fixes = [
  { email: 'admin@rentwise.com', password: 'Admin@1234' },
  { email: 'owner@rentwise.com', password: 'Owner@1234', name: 'Vijay' },
  { email: 'manager@rentwise.com', password: 'Manager@1234', name: 'Vijay' },
  { email: 'tenant@rentwise.com', password: 'Tenant@1234' },
  { email: 'priya@rentwise.com', password: 'Tenant@1234' },
  { email: 'meena@rentwise.com', password: 'Tenant@1234' },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  for (const fix of fixes) {
    const hashed = await bcrypt.hash(fix.password, 10);
    const test = await bcrypt.compare(fix.password, hashed);
    console.log(`Testing ${fix.email}: ${test ? 'OK' : 'FAIL'}`);

    const updateFields = { password: hashed };
    if (fix.name) {
      updateFields.name = fix.name;
    }

    await User.updateOne({ email: fix.email.toLowerCase().trim() }, { $set: updateFields });

    console.log(`Fixed: ${fix.email}`);
  }

  console.log('===============================');
  console.log('All passwords fixed');
  console.log('owner@rentwise.com   / Owner@1234');
  console.log('manager@rentwise.com / Manager@1234');
  console.log('===============================');

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch (_e) {
    // Ignore disconnect failure after error.
  }
  process.exit(1);
});
