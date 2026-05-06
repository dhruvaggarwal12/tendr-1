const mongoose = require('mongoose');

const CorporateSubscriptionSchema = new mongoose.Schema({
  consumer: { type: mongoose.Schema.Types.ObjectId, ref: 'CorporateConsumer', required: true },

  planType: { type: String, enum: ['BASIC', 'PRO', 'ELITE'], required: true },

  pricing: {
    annualPrice: { type: Number, required: true },
    originalPrice: { type: Number }, // For showing strikethrough/dicount
    addOnCostPerEvent: { type: Number, required: true }, // 750, 500, or 0
    currency: { type: String, default: 'INR' }
  },

  // Active plan status
  status: { type: String, enum: ['ACTIVE', 'CANCELLED', 'PAUSED', 'EXPIRED'], default: 'ACTIVE' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  trialEndsAt: { type: Date },

  usage: {
    eventsBooked: { type: Number, default: 0 },
    addOnSpend: { type: Number, default: 0 }
  },

  // Feature Access
  features: {
    // Basic Features (all plans)
    vendorAccess: { type: Boolean, default: true },
    basicSupport: { type: Boolean, default: true },
    standardBooking: { type: Boolean, default: true },
    
    // Pro Features
    priorityVendorAccess: { type: Boolean, default: false },
    dedicatedCoordinator: { type: Boolean, default: false },
    customInvitations: { type: Boolean, default: false },
    professionalBackdrops: { type: Boolean, default: false },
    socialMediaShoutouts: { type: Boolean, default: false },
    
    // Elite Features
    premiumVendorAccess: { type: Boolean, default: false },
    endToEndManagement: { type: Boolean, default: false },
    customMemorabilia: { type: Boolean, default: false },
    professionalAfterMovies: { type: Boolean, default: false },
    exclusiveBackdrops: { type: Boolean, default: false },
    premiumSupport: { type: Boolean, default: false },
    
    // HIGH PRIORITY: Usage Limits
    monthlyEventLimit: { type: Number, default: 5 },
    coordinatorHours: { type: Number, default: 0 },
    customDesigns: { type: Number, default: 0 },
    socialMediaPosts: { type: Number, default: 0 },
    afterMovieMinutes: { type: Number, default: 0 }
  },

  assignedCoordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  autoRenewal: { type: Boolean, default: true },
  cancelReason: { type: String },
  notes: { type: String },

  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['CARD', 'UPI', 'NETBANKING', 'WALLET'],
    required: true
  },
  
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  
  // HIGH PRIORITY: Billing Information
  billing: {
    paymentMethod: { type: String, enum: ['CARD', 'UPI', 'NETBANKING', 'WALLET'] },
    lastBillingDate: { type: Date },
    nextBillingDate: { type: Date },
    invoiceNumber: { type: String },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number }
  }
}, {
  timestamps: true
});

// Method to get payment status from Payment model
CorporateSubscriptionSchema.methods.getPaymentStatus = async function() {
  if (!this.paymentId) return null;
  
  try {
    const Payment = mongoose.model('Payment');
    const payment = await Payment.findById(this.paymentId);
    return payment ? payment.status : null;
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return null;
  }
};

// Virtual for payment status (for easy access)
CorporateSubscriptionSchema.virtual('paymentStatus').get(function() {
  // This will be populated when using populate()
  return this.paymentId?.status || null;
});

module.exports = mongoose.model('CorporateSubscription', CorporateSubscriptionSchema);
