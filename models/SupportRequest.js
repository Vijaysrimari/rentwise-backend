const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', default: null },
    title: { type: String, required: true },
    desc: { type: String, default: '' },
    category: {
      type: String,
      enum: ['plumbing', 'electrical', 'carpentry', 'ac', 'internet', 'general'],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },
    resolvedAt: { type: Date, default: null },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
