import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 200 },
    role: {
      type: String,
      enum: ['admin', 'manager', 'support', 'tenant'],
      default: 'tenant',
    },
  },
  { timestamps: true },
)

export default mongoose.model('User', userSchema)
