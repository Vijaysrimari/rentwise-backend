const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['owner', 'tenant', 'manager', 'admin'],
      default: 'tenant',
    },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 200 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();

  console.log('Pre-save: hashing password for', this.email);

  if (this.password.startsWith('$2b$') || this.password.startsWith('$2a$')) {
    console.log('Password already hashed, skipping');
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  console.log('Password hashed successfully');
  return next();
});

module.exports = mongoose.model('User', userSchema);
