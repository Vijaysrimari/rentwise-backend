const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rentAmount: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'terminated', 'cancelled'],
      default: 'active',
    },
    terms: { type: String, default: '' },
    autoExpireCheck: { type: Boolean, default: true },
  },
  { timestamps: true }
);

rentalSchema.pre('save', function setExpired(next) {
  if (this.autoExpireCheck && this.endDate && this.endDate < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

module.exports = mongoose.model('Rental', rentalSchema);
