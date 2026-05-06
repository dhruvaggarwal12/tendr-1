const eventBus = require('./eventBus');

const AuditLogger = {
  logEvent(event, payload) {
    // Extend to write to DB or external log system if needed
    console.log(`[AUDIT] Event: ${event}`, JSON.stringify(payload));
  }
};

// Subscribe to all key events
['BookingCreated', 'BookingStatusUpdated', 'PaymentSuccess', 'PaymentFailed', 'BookingCancelled', 'RefundProcessed', 'VendorPenalized'].forEach(event => {
  eventBus.on(event, payload => AuditLogger.logEvent(event, payload));
});

module.exports = AuditLogger; 