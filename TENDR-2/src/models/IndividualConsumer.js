const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { SUPPORTED_CITIES } = require('../constants');

const individualConsumerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  address: {
    street: { type: String },
    city: { type: String, enum: SUPPORTED_CITIES },
    state: { type: String }
  },
  profilePhoto: {
    type: String
  },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes
individualConsumerSchema.index({ phoneNumber: 1 }, { unique: true });

// Hash password before saving
individualConsumerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
individualConsumerSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('IndividualConsumer', individualConsumerSchema); 