const mongoose = require('mongoose');
const { Schema } = mongoose;

const invoiceSchema = new Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  invoiceDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  customer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    gstNumber: {
      type: String,
      trim: true
    },
    address: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true }
    }
  },
  lineItems: [{
    description: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  companyInfo: {
    name: { type: String, trim: true },
    address: { type: String, trim: true },
    gstNumber: { type: String, trim: true },
    email: { type: String, trim: true },
    bankDetails: {
      bankName: { type: String, trim: true },
      accountName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true }
    }
  },
  pdfUrl: {
    type: String,
    required: true,
    trim: true
  },
  pdfPublicId: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ 'customer.name': 1 });

// Validation to ensure at least one line item exists
invoiceSchema.pre('save', function(next) {
  if (!this.lineItems || this.lineItems.length === 0) {
    return next(new Error('Invoice must have at least one line item'));
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
