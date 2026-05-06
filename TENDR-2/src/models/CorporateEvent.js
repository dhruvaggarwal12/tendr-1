const mongoose = require('mongoose');
const { CORPORATE_EVENT_TYPES } = require('../constants');

const corporateEventSchema = new mongoose.Schema({
  // Event Identification
  eventId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Corporate Consumer Details
  corporateConsumerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CorporateConsumer',
    required: true
  },
  
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CorporateSubscription',
    required: true
  },
  
  // Event Details
  eventType: {
    type: String,
    enum: CORPORATE_EVENT_TYPES,
    required: true
  },
  
  eventName: {
    type: String,
    required: true,
    trim: true
  },
  
  eventDescription: {
    type: String,
    trim: true
  },
  
  // Event Schedule
  schedule: {
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    timeZone: { type: String, default: 'Asia/Kolkata' }
  },
  
  // Location Details
  venue: {
    name: { type: String, required: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String }
    },
    venueType: { type: String, enum: ['OFFICE', 'EXTERNAL_VENUE', 'HOTEL', 'RESTAURANT'] }
  },
  
  // Attendee Information
  attendees: {
    expectedCount: { type: Number, required: true },
    actualCount: { type: Number },
    ageGroup: { type: String, enum: ['ALL_AGES', 'ADULTS_ONLY', 'FAMILY_FRIENDLY'] },
    dietaryRestrictions: [{ type: String }]
  },
  
  // Budget and Pricing
  budget: {
    allocatedBudget: { type: Number, required: true },
    actualCost: { type: Number },
    addOnCost: { type: Number, required: true },
    totalCost: { type: Number },
    currency: { type: String, default: 'INR' }
  },
  
  // HIGH PRIORITY: Recurring Event Configuration
  recurringConfig: {
    isRecurring: { type: Boolean, default: false },
    frequency: { type: String, enum: ['MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM'] },
    nextOccurrence: { type: Date },
    totalOccurrences: { type: Number },
    completedOccurrences: { type: Number, default: 0 }
  },
  
  // HIGH PRIORITY: Detailed Vendor Bookings
  vendorBookings: [{
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    serviceType: { type: String, enum: ['DJ', 'Decorator', 'Photographer', 'Caterer'] },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    cost: { type: Number, required: true },
    status: { type: String, enum: ['CONFIRMED', 'PENDING', 'CANCELLED'] },
    specialRequirements: { type: String }
  }],
  
  // Corporate Features and Add-ons
  corporateFeatures: {
    customInvitation: {
      required: { type: Boolean, default: false },
      design: { type: String },
      cost: { type: Number, default: 0 }
    },
    professionalBackdrop: {
      required: { type: Boolean, default: false },
      theme: { type: String },
      cost: { type: Number, default: 0 }
    },
    socialMediaShoutout: {
      required: { type: Boolean, default: false },
      platforms: [{ type: String, enum: ['INSTAGRAM', 'LINKEDIN', 'FACEBOOK', 'TWITTER'] }],
      cost: { type: Number, default: 0 }
    },
    customMemorabilia: {
      required: { type: Boolean, default: false },
      type: { type: String, enum: ['TROPHY', 'CERTIFICATE', 'GIFT', 'PHOTO_ALBUM'] },
      cost: { type: Number, default: 0 }
    },
    professionalAfterMovie: {
      required: { type: Boolean, default: false },
      duration: { type: Number }, // in minutes
      cost: { type: Number, default: 0 }
    }
  },
  
  // Coordinator Assignment
  coordinator: {
    coordinatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'CorporateCoordinator' },
    assignedAt: { type: Date },
    responsibilities: [{ type: String }],
    communicationLog: [{
      message: { type: String },
      timestamp: { type: Date, default: Date.now },
      sender: { type: String, enum: ['COORDINATOR', 'CLIENT', 'SYSTEM'] }
    }]
  },
  
  // Event Status and Progress
  status: {
    type: String,
    enum: ['PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'],
    default: 'PLANNING'
  },
  
  // HIGH PRIORITY: Event Progress Tracking
  progress: {
    planning: { type: Number, default: 0 }, // 0-100
    vendorBooking: { type: Number, default: 0 },
    coordination: { type: Number, default: 0 },
    execution: { type: Number, default: 0 },
    completion: { type: Number, default: 0 }
  },
  
  // HIGH PRIORITY: Budget Approval Workflow
  approvals: {
    budgetApproved: { type: Boolean, default: false },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    approvalNotes: { type: String }
  },
  
  // Quality Assurance
  qualityCheck: {
    preEventCheck: { type: Boolean, default: false },
    duringEventCheck: { type: Boolean, default: false },
    postEventCheck: { type: Boolean, default: false },
    issues: [{
      description: { type: String },
      severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
      resolved: { type: Boolean, default: false },
      resolvedAt: { type: Date }
    }]
  },
  
  // Feedback and Ratings
  feedback: {
    clientSatisfaction: { type: Number, min: 1, max: 5 },
    coordinatorRating: { type: Number, min: 1, max: 5 },
    vendorRatings: [{
      vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
      rating: { type: Number, min: 1, max: 5 },
      feedback: { type: String }
    }],
    overallFeedback: { type: String },
    improvementSuggestions: { type: String }
  },
  
  // Analytics and Metrics
  analytics: {
    timeSaved: { type: Number }, // in hours
    costSavings: { type: Number }, // compared to traditional agencies
    employeeSatisfaction: { type: Number, min: 1, max: 5 },
    attendanceRate: { type: Number }, // percentage
    socialMediaReach: { type: Number }
  },
  
  // Documents and Media
  documents: [{
    type: { type: String, enum: ['INVITATION', 'CONTRACT', 'INVOICE', 'PHOTO', 'VIDEO'] },
    url: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for efficient querying
corporateEventSchema.index({ eventId: 1 }, { unique: true });
corporateEventSchema.index({ corporateConsumerId: 1 });
corporateEventSchema.index({ subscriptionId: 1 });
corporateEventSchema.index({ 'schedule.date': 1 });
corporateEventSchema.index({ status: 1 });
corporateEventSchema.index({ eventType: 1 });
corporateEventSchema.index({ 'coordinator.coordinatorId': 1 });

// Compound indexes for common queries
corporateEventSchema.index({ corporateConsumerId: 1, status: 1 });
corporateEventSchema.index({ 'schedule.date': 1, status: 1 });
corporateEventSchema.index({ eventType: 1, 'schedule.date': 1 });
corporateEventSchema.index({ 'recurringConfig.isRecurring': 1, 'recurringConfig.nextOccurrence': 1 });

// Virtual for event status
corporateEventSchema.virtual('isUpcoming').get(function() {
  return this.status === 'CONFIRMED' && new Date(this.schedule.date) > new Date();
});

// Virtual for event completion
corporateEventSchema.virtual('isCompleted').get(function() {
  return this.status === 'COMPLETED';
});

// Virtual for total cost calculation
corporateEventSchema.virtual('calculatedTotalCost').get(function() {
  const vendorCosts = this.vendorBookings.reduce((sum, booking) => sum + booking.cost, 0);
  const featureCosts = Object.values(this.corporateFeatures).reduce((sum, feature) => sum + (feature.cost || 0), 0);
  return vendorCosts + featureCosts + this.budget.addOnCost;
});

// Method to calculate add-on cost based on subscription
corporateEventSchema.methods.calculateAddOnCost = function() {
  // This will be calculated based on the corporate subscription plan
  // and event-specific factors
  return this.budget.addOnCost;
};

// Method to update event progress
corporateEventSchema.methods.updateProgress = function(stage, percentage) {
  this.progress[stage] = Math.min(100, Math.max(0, percentage));
  
  // Calculate overall progress
  const stages = Object.keys(this.progress);
  const totalProgress = stages.reduce((sum, stage) => sum + this.progress[stage], 0);
  const averageProgress = totalProgress / stages.length;
  
  return this.save();
};

// Method to add vendor booking
corporateEventSchema.methods.addVendorBooking = function(vendorData) {
  this.vendorBookings.push(vendorData);
  return this.save();
};

// Method to update event status
corporateEventSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Method to add communication log
corporateEventSchema.methods.addCommunicationLog = function(message, sender) {
  this.coordinator.communicationLog.push({
    message,
    sender,
    timestamp: new Date()
  });
  return this.save();
};

// Method to approve budget
corporateEventSchema.methods.approveBudget = function(approvedBy, notes = '') {
  this.approvals.budgetApproved = true;
  this.approvals.approvedBy = approvedBy;
  this.approvals.approvedAt = new Date();
  this.approvals.approvalNotes = notes;
  return this.save();
};

// Method to check if event is recurring
corporateEventSchema.methods.isRecurringEvent = function() {
  return this.recurringConfig.isRecurring;
};

// Method to get next occurrence date
corporateEventSchema.methods.getNextOccurrence = function() {
  if (!this.recurringConfig.isRecurring) return null;
  return this.recurringConfig.nextOccurrence;
};

// Pre-save middleware to generate event ID
corporateEventSchema.pre('save', function(next) {
  if (!this.eventId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.eventId = `CE-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

module.exports = mongoose.model('CorporateEvent', corporateEventSchema);
