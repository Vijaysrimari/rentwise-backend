const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['House', 'Furniture', 'Tools', 'Vehicles', 'Tech Asset', 'Electronics'],
      required: true,
    },
    subType: { type: String, default: '' },
    location: { type: String, default: '' },
    rentAmount: { type: Number, required: true },
    rentPer: {
      type: String,
      enum: ['day', 'week', 'month', 'year'],
      default: 'month',
    },
    status: {
      type: String,
      enum: ['vacant', 'occupied', 'maintenance'],
      default: 'vacant',
    },
    images: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    currentTenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Asset', assetSchema);
