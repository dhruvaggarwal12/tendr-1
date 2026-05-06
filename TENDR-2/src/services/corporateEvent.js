const CorporateEvent = require('../models/CorporateEvent');
const CorporateConsumer = require('../models/CorporateConsumer');
const CorporateSubscription = require('../models/CorporateSubscription');
const Vendor = require('../models/Vendor');
const Booking = require('../models/Booking');
const { CORPORATE_EVENT_TYPES } = require('../constants');
const eventBus = require('./eventBus');

const CorporateEventService = {
  // 1. Create new corporate event
  async createEvent(corporateConsumerId, eventData) {
    const {
      eventName,
      eventType,
      eventDate,
      startTime,
      endTime,
      venue,
      expectedAttendees,
      budget,
      description,
      specialRequirements,
      isRecurring = false,
      recurringConfig = {}
    } = eventData;

    // Validate event type
    if (!CORPORATE_EVENT_TYPES.includes(eventType)) {
      throw new Error('Invalid event type');
    }

    // Check subscription and limits
    const subscription = await CorporateSubscription.findOne({
      consumer: corporateConsumerId,
      status: 'ACTIVE'
    });

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    // Check monthly event limit
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyEvents = await CorporateEvent.countDocuments({
      corporateConsumerId,
      eventDate: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1)
      }
    });

    if (monthlyEvents >= subscription.features.monthlyEventLimit) {
      throw new Error(`Monthly event limit (${subscription.features.monthlyEventLimit}) exceeded`);
    }

    // Create event
    const event = new CorporateEvent({
      corporateConsumerId,
      subscriptionId: subscription._id,
      eventName,
      eventType,
      eventDate,
      startTime,
      endTime,
      venue,
      expectedAttendees,
      budget,
      description,
      specialRequirements,
      recurringConfig: isRecurring ? {
        isRecurring: true,
        frequency: recurringConfig.frequency,
        nextOccurrence: eventDate,
        totalOccurrences: recurringConfig.totalOccurrences,
        completedOccurrences: 0
      } : { isRecurring: false },
      status: 'PLANNING',
      progress: {
        planning: 0,
        vendorBooking: 0,
        coordination: 0,
        execution: 0,
        completion: 0
      }
    });

    await event.save();

    // Update corporate consumer metrics
    await CorporateConsumer.findByIdAndUpdate(corporateConsumerId, {
      $inc: { 'metrics.totalEvents': 1 },
      $set: { 'metrics.lastEventDate': new Date() }
    });

    eventBus.emit('CorporateEventCreated', { event });
    return event;
  },

  // 2. Add vendor booking to event
  async addVendorBooking(eventId, vendorBookingData) {
    const {
      vendorId,
      serviceType,
      cost,
      specialRequirements
    } = vendorBookingData;

    const event = await CorporateEvent.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Validate vendor
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Validate service type
    if (!vendor.serviceTypes.includes(serviceType)) {
      throw new Error('Vendor does not provide this service type');
    }

    // Create vendor booking
    const vendorBooking = {
      vendorId,
      serviceType,
      cost,
      status: 'PENDING',
      specialRequirements
    };

    event.vendorBookings.push(vendorBooking);
    await event.save();

    eventBus.emit('VendorBookingAdded', { event, vendorBooking });
    return event;
  },

  // 3. Update event progress
  async updateEventProgress(eventId, progressData) {
    const event = await CorporateEvent.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const { planning, vendorBooking, coordination, execution, completion } = progressData;

    if (planning !== undefined) event.progress.planning = planning;
    if (vendorBooking !== undefined) event.progress.vendorBooking = vendorBooking;
    if (coordination !== undefined) event.progress.coordination = coordination;
    if (execution !== undefined) event.progress.execution = execution;
    if (completion !== undefined) event.progress.completion = completion;

    // Update overall status based on progress
    const totalProgress = Object.values(event.progress).reduce((sum, val) => sum + val, 0) / 5;
    
    if (totalProgress >= 100) {
      event.status = 'COMPLETED';
    } else if (totalProgress >= 75) {
      event.status = 'IN_PROGRESS';
    } else if (totalProgress >= 25) {
      event.status = 'CONFIRMED';
    }

    await event.save();

    eventBus.emit('EventProgressUpdated', { event, progress: event.progress });
    return event;
  },

  // 4. Approve event budget
  async approveBudget(eventId, approvedBy, approvalNotes) {
    const event = await CorporateEvent.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    event.approvals.budgetApproved = true;
    event.approvals.approvedBy = approvedBy;
    event.approvals.approvedAt = new Date();
    event.approvals.approvalNotes = approvalNotes;

    await event.save();

    eventBus.emit('BudgetApproved', { event, approvedBy });
    return event;
  },

  // 5. Get event details with vendors
  async getEventDetails(eventId) {
    const event = await CorporateEvent.findById(eventId)
      .populate('corporateConsumerId', 'companyName contactPerson')
      .populate('subscriptionId', 'planType features')
      .populate('vendorBookings.vendorId', 'name serviceTypes rating profilePhotoUrl');

    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  },

  // 6. Get corporate consumer events
  async getCorporateEvents(corporateConsumerId, filters = {}) {
    const query = { corporateConsumerId };

    if (filters.status) query.status = filters.status;
    if (filters.eventType) query.eventType = filters.eventType;
    if (filters.dateFrom) query.eventDate = { $gte: new Date(filters.dateFrom) };
    if (filters.dateTo) query.eventDate = { ...query.eventDate, $lte: new Date(filters.dateTo) };

    const events = await CorporateEvent.find(query)
      .populate('vendorBookings.vendorId', 'name serviceTypes rating')
      .sort({ eventDate: -1 });

    return events;
  },

  // 7. Update vendor booking status
  async updateVendorBookingStatus(eventId, vendorBookingIndex, status) {
    const event = await CorporateEvent.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (!event.vendorBookings[vendorBookingIndex]) {
      throw new Error('Vendor booking not found');
    }

    event.vendorBookings[vendorBookingIndex].status = status;
    await event.save();

    eventBus.emit('VendorBookingStatusUpdated', { 
      event, 
      vendorBooking: event.vendorBookings[vendorBookingIndex] 
    });

    return event;
  },

  // 8. Add event feedback
  async addEventFeedback(eventId, feedbackData) {
    const {
      overallRating,
      vendorSatisfaction,
      coordinatorSatisfaction,
      comments,
      suggestions
    } = feedbackData;

    const event = await CorporateEvent.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    event.feedback = {
      overallRating,
      vendorSatisfaction,
      coordinatorSatisfaction,
      comments,
      suggestions,
      submittedAt: new Date()
    };

    await event.save();

    // Update corporate consumer metrics
    await CorporateConsumer.findByIdAndUpdate(event.corporateConsumerId, {
      $set: {
        'metrics.vendorSatisfactionScore': vendorSatisfaction,
        'metrics.coordinatorSatisfactionScore': coordinatorSatisfaction
      }
    });

    eventBus.emit('EventFeedbackSubmitted', { event, feedback: event.feedback });
    return event;
  },

  // 9. Get event analytics
  async getEventAnalytics(corporateConsumerId) {
    const events = await CorporateEvent.find({ corporateConsumerId });

    const analytics = {
      totalEvents: events.length,
      eventsByStatus: events.reduce((acc, event) => {
        acc[event.status] = (acc[event.status] || 0) + 1;
        return acc;
      }, {}),
      eventsByType: events.reduce((acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {}),
      averageBudget: events.length > 0 ? 
        events.reduce((sum, event) => sum + event.budget, 0) / events.length : 0,
      averageAttendees: events.length > 0 ?
        events.reduce((sum, event) => sum + event.expectedAttendees, 0) / events.length : 0,
      totalVendorBookings: events.reduce((sum, event) => sum + event.vendorBookings.length, 0),
      averageEventDuration: events.length > 0 ?
        events.reduce((sum, event) => {
          const start = new Date(`2000-01-01 ${event.startTime}`);
          const end = new Date(`2000-01-01 ${event.endTime}`);
          return sum + (end - start) / (1000 * 60 * 60); // hours
        }, 0) / events.length : 0
    };

    return analytics;
  },

  // 10. Handle recurring events
  async handleRecurringEvent(eventId) {
    const event = await CorporateEvent.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (!event.recurringConfig.isRecurring) {
      throw new Error('Event is not recurring');
    }

    // Update completed occurrences
    event.recurringConfig.completedOccurrences += 1;

    // Check if more occurrences are needed
    if (event.recurringConfig.completedOccurrences < event.recurringConfig.totalOccurrences) {
      // Calculate next occurrence
      const nextDate = new Date(event.recurringConfig.nextOccurrence);
      
      switch (event.recurringConfig.frequency) {
        case 'MONTHLY':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'QUARTERLY':
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        case 'YEARLY':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }

      event.recurringConfig.nextOccurrence = nextDate;
      event.eventDate = nextDate;
      event.status = 'PLANNING';
      event.progress = {
        planning: 0,
        vendorBooking: 0,
        coordination: 0,
        execution: 0,
        completion: 0
      };
    } else {
      // All occurrences completed
      event.status = 'COMPLETED';
    }

    await event.save();

    eventBus.emit('RecurringEventUpdated', { event });
    return event;
  },

  // 11. Cancel event
  async cancelEvent(eventId, reason) {
    const event = await CorporateEvent.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    event.status = 'CANCELLED';
    event.cancellationReason = reason;
    event.cancelledAt = new Date();

    await event.save();

    // Update corporate consumer metrics
    await CorporateConsumer.findByIdAndUpdate(event.corporateConsumerId, {
      $inc: { 'metrics.cancellationRate': 1 }
    });

    eventBus.emit('EventCancelled', { event, reason });
    return event;
  }
};

module.exports = CorporateEventService; 