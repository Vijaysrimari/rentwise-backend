import mongoose from 'mongoose'

const tenantSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    unit: { type: String, required: true, trim: true },
  },
  { timestamps: true },
)

export default mongoose.model('Tenant', tenantSchema)
