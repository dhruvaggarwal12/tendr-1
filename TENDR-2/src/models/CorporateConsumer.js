const mongoose = require('mongoose');

const CorporateConsumerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  companyName: { type: String, required: true },
  gstNumber: { type: String },
  panNumber: { type: String },
  companySize: { type: String, enum: ['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'] },

  contactPerson: {
    name: { type: String },
    phone: { type: String },
    designation: { type: String }
  },

  addresses: {
    registered: { type: String },
    billing: { type: String }
  },

  verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
  kycDocuments: [{ type: String }],

  eventPreferences: {
    cuisine: [{ type: String }],
    budgetRange: { min: Number, max: Number }
  },

  // Corporate Metrics and Analytics
  metrics: {
    totalEvents: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageEventCost: { type: Number, default: 0 },
    averageAttendees: { type: Number, default: 0 },
    employeeSatisfactionScore: { type: Number, min: 1, max: 5, default: 0 },
    timeSavedPerEvent: { type: Number, default: 0 }, // in hours
    costSavings: { type: Number, default: 0 }, // compared to traditional agencies
    roi: { type: Number, default: 0 }, // return on investment percentage
    lastEventDate: { type: Date },
    nextScheduledEvent: { type: Date },
    // Additional analytics fields
    mostBookedEventType: { type: String },
    averageEventDuration: { type: Number }, // in hours
    vendorSatisfactionScore: { type: Number, min: 1, max: 5, default: 0 },
    coordinatorSatisfactionScore: { type: Number, min: 1, max: 5, default: 0 },
    monthlyEventFrequency: { type: Number, default: 0 },
    budgetUtilizationRate: { type: Number, default: 0 }, // percentage
    cancellationRate: { type: Number, default: 0 }, // percentage
    repeatBookingRate: { type: Number, default: 0 } // percentage
  },

  communicationPreferences: {
    newsletter: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },

  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },

  // Subscription reference
  activeSubscription: { type: mongoose.Schema.Types.ObjectId, ref: 'CorporateSubscription' }
}, {
  timestamps: true
});

// Method to update corporate metrics
CorporateConsumerSchema.methods.updateMetrics = function(eventData) {
  const { cost, attendees, timeSaved, costSavings } = eventData;
  
  this.metrics.totalEvents += 1;
  this.metrics.totalSpent += cost;
  this.metrics.averageEventCost = this.metrics.totalSpent / this.metrics.totalEvents;
  this.metrics.averageAttendees = ((this.metrics.averageAttendees * (this.metrics.totalEvents - 1)) + attendees) / this.metrics.totalEvents;
  this.metrics.timeSavedPerEvent = timeSaved;
  this.metrics.costSavings += costSavings;
  this.metrics.lastEventDate = new Date();
  
  // Calculate ROI
  if (this.metrics.totalSpent > 0) {
    this.metrics.roi = ((this.metrics.costSavings / this.metrics.totalSpent) * 100);
  }
  
  return this.save();
};

// Method to update satisfaction scores
CorporateConsumerSchema.methods.updateSatisfactionScores = function(scores) {
  const { employeeSatisfaction, vendorSatisfaction, coordinatorSatisfaction } = scores;
  
  if (employeeSatisfaction) {
    this.metrics.employeeSatisfactionScore = employeeSatisfaction;
  }
  if (vendorSatisfaction) {
    this.metrics.vendorSatisfactionScore = vendorSatisfaction;
  }
  if (coordinatorSatisfaction) {
    this.metrics.coordinatorSatisfactionScore = coordinatorSatisfaction;
  }
  
  return this.save();
};

// Method to update event type analytics
CorporateConsumerSchema.methods.updateEventTypeAnalytics = function(eventType) {
  this.metrics.mostBookedEventType = eventType;
  return this.save();
};

// Method to calculate budget utilization
CorporateConsumerSchema.methods.calculateBudgetUtilization = function(monthlyBudget, totalSpent) {
  if (monthlyBudget > 0) {
    this.metrics.budgetUtilizationRate = (totalSpent / monthlyBudget) * 100;
  }
  return this.save();
};

module.exports = mongoose.model('CorporateConsumer', CorporateConsumerSchema);
