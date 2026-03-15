import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    tenantName: { type: String, required: true, trim: true },
    assetName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['paid', 'pending', 'late'],
      default: 'pending',
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

export default mongoose.model('Payment', paymentSchema)
