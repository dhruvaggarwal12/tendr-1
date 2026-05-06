const mongoose = require('mongoose');
const { Schema } = mongoose;
const { VendorPenalty } = require('../constants');

const vendorPenaltySchema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  windowStart: { type: Date, required: true },
  cancellationCount: { type: Number, default: 0 },
  penaltyType: {
    type: String,
    enum: VendorPenalty.TYPE,
    required: true
  },
  effectiveUntil: { type: Date, required: true }
});

module.exports = mongoose.model('VendorPenalty', vendorPenaltySchema); 