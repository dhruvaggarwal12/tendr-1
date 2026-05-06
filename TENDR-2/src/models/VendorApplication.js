const mongoose = require('mongoose');

const vendorApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'registered', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

vendorApplicationSchema.index({ email: 1 });
vendorApplicationSchema.index({ phoneNumber: 1 });
vendorApplicationSchema.index({ status: 1 });

module.exports = mongoose.model('VendorApplication', vendorApplicationSchema);
