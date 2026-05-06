const EventEmitter = require('events');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Allow more listeners for complex flows
  }

  // Centralized event emission with logging
  emit(eventName, data) {
    console.log(`[EventBus] Emitting: ${eventName}`, { 
      timestamp: new Date().toISOString(),
      dataKeys: Object.keys(data || {})
    });
    return super.emit(eventName, data);
  }

  // Register event handlers with error handling
  on(eventName, handler) {
    const wrappedHandler = async (...args) => {
      try {
        await handler(...args);
      } catch (error) {
        console.error(`[EventBus] Error in handler for ${eventName}:`, error);
        // Emit error event for monitoring
        this.emit('eventHandlerError', { eventName, error, args });
      }
    };
    return super.on(eventName, wrappedHandler);
  }
}

const eventBus = new EventBus();

// Centralized event registration to avoid redundancy
const registerEventHandlers = () => {
  // Import services only when needed to avoid circular dependencies
  const RatingService = require('./ratingService');
  const CommissionService = require('./commissionService');
  const AccountService = require('./accountService');
  const NotificationService = require('./notificationService');
  const VendorPenaltyService = require('./vendorPenaltyService');

  // Booking lifecycle events
  eventBus.on('BookingCreated', async ({ booking }) => {
    await Promise.all([
      NotificationService.notifyBookingCreated(booking),
      // Add other booking creation handlers here
    ]);
  });

  eventBus.on('BookingCancelled', async ({ booking, cancellation }) => {
    await Promise.all([
      NotificationService.notifyBookingCancelled(booking, cancellation),
      VendorPenaltyService.recordCancellation(booking.vendorId),
      // Add other cancellation handlers here
    ]);
  });

  eventBus.on('PaymentSuccess', async ({ payment }) => {
    await Promise.all([
      NotificationService.notifyPaymentSuccess(payment),
      // Add other payment success handlers here
    ]);
  });

  eventBus.on('RefundProcessed', async ({ payment, refund }) => {
    await Promise.all([
      NotificationService.notifyRefundProcessed(payment, refund),
      // Add other refund handlers here
    ]);
  });

  eventBus.on('ReviewCreated', async ({ review }) => {
    await Promise.all([
      NotificationService.notifyReviewCreated(review),
      // Add other review handlers here
    ]);
  });

  // Vendor penalty events
  eventBus.on('VendorPenalized', async ({ vendorId, type, amount, orders, days, reevaluate }) => {
    const handlers = [];

    switch (type) {
      case 'RATING_REDUCTION':
        handlers.push(RatingService.reduceRating(vendorId, amount));
        break;
      case 'COMMISSION_INCREASE':
        handlers.push(CommissionService.increaseCommission(vendorId, amount, orders));
        break;
      case 'SUSPENSION':
        handlers.push(AccountService.suspendVendor(vendorId, days, reevaluate));
        break;
    }

    handlers.push(NotificationService.notifyVendorPenalized(vendorId, type, amount));

    await Promise.all(handlers);
  });

  // Error handling
  eventBus.on('eventHandlerError', ({ eventName, error, args }) => {
    console.error(`[EventBus] Handler error for ${eventName}:`, error);
    // Add error reporting/monitoring here
  });
};

// Initialize event handlers
registerEventHandlers();

module.exports = eventBus; 