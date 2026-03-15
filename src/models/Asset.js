import mongoose from 'mongoose'

const assetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['occupied', 'vacant', 'maintenance'],
      default: 'vacant',
    },
    imageUrl: { type: String, default: '' },
    rentAmount: { type: Number, required: true, min: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

export default mongoose.model('Asset', assetSchema)
