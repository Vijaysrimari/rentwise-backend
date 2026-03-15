import mongoose from 'mongoose'

const rentalSchema = new mongoose.Schema(
  {
    assetName: { type: String, required: true, trim: true },
    tenantName: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    rentAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

export default mongoose.model('Rental', rentalSchema)
