const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { VIEW_SOURCES } = require('../constants');

const viewSchema = new Schema({
  vendorId: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  consumerId: {
    type: Schema.Types.ObjectId,
    ref: 'consumer',
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  source: {
    type: String,
    enum: Object.values(VIEW_SOURCES),
    required: true
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  deviceInfo: {
    type: {
      userAgent: String,
      platform: String,
      device: String
    }
  }
});

// Compound index for analytics
viewSchema.index({ vendorId: 1, timestamp: -1 });

const View = mongoose.model('View', viewSchema);

module.exports = View; 