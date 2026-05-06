const Booking = require('../models/Booking');
const Cancellation = require('../models/Cancellation');
const Payment = require('../models/Payment');
const PolicyEngine = require('./policyEngine');
const PaymentService = require('./payment');
const eventBus = require('./eventBus');

const CancellationService = {
  // 1. Initiate cancellation
  async initiateCancellation(bookingId, customerId, reason = 'Cancelled by customer', consumerType = 'INDIVIDUAL') {
    try {
      // Fetch booking
      const booking = await Booking.findById(bookingId);
      if (!booking) throw new Error('Booking not found');
      
      // Check authorization based on consumer type
      const isAuthorized = consumerType === 'CORPORATE' 
        ? booking.corporateCustomerId.toString() === customerId.toString()
        : booking.customerId.toString() === customerId.toString();
      
      if (!isAuthorized) throw new Error('Unauthorized');
      if (booking.status !== 'CONFIRMED') throw new Error('Booking cannot be cancelled');

      // Calculate time before event (in hours)
      const now = new Date();
      const eventDate = new Date(booking.schedule.date);
      const timeBeforeEvent = Math.max(0, (eventDate - now) / (1000 * 60 * 60));

      const cancellationData = {
        bookingId,
        requestedAt: now,
        timeBeforeEvent,
        reason,
        refundAmount: 0,
        refundStatus: 'PENDING'
      };

      // Set the appropriate customer field based on consumer type
      if (consumerType === 'CORPORATE') {
        cancellationData.corporateCustomerId = customerId;
      } else {
        cancellationData.customerId = customerId;
      }

      // Create Cancellation record (refundAmount will be set after policy evaluation)
      const cancellation = await Cancellation.create(cancellationData);

      // Emit cancellation initiated event
      eventBus.emit('CancellationInitiated', { cancellation, booking });

      return cancellation;
    } catch (error) {
      console.error('CancellationService.initiateCancellation error:', error);
      throw new Error(`Failed to initiate cancellation: ${error.message}`);
    }
  },

  // 2. Process refund (calls PolicyEngine and PaymentService)
  async processRefund(cancellationId) {
    try {
      // Fetch cancellation and booking
      const cancellation = await Cancellation.findById(cancellationId);
      if (!cancellation) throw new Error('Cancellation not found');
      
      const booking = await Booking.findById(cancellation.bookingId);
      if (!booking) throw new Error('Booking not found');
      
      const payment = await Payment.findById(booking.paymentId);
      if (!payment) throw new Error('Payment not found');

      // Calculate refund percentage using PolicyEngine
      const { refundPercentage, notes } = PolicyEngine.calculateRefund(booking, cancellation.requestedAt);
      const refundAmount = Math.round(payment.amount * refundPercentage);

      // Call PaymentService to process refund via Razorpay
      const refundResult = await PaymentService.processRefund(payment._id, refundAmount, notes);

      // Update Cancellation record
      cancellation.refundAmount = refundAmount;
      cancellation.refundStatus = refundResult.status === 'success' ? 'PROCESSED' : 'REJECTED';
      await cancellation.save();

      // Update Booking status if refund processed
      if (refundResult.status === 'success') {
        booking.status = 'CANCELLED';
        await booking.save();
        eventBus.emit('BookingCancelled', { booking, cancellation });
      }

      return { 
        refundAmount, 
        refundStatus: cancellation.refundStatus, 
        notes, 
        refundId: refundResult.refundId 
      };
    } catch (error) {
      console.error('CancellationService.processRefund error:', error);
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  },

  // 3. Get cancellation status
  async getCancellationStatus(cancellationId, customerId, consumerType = 'INDIVIDUAL') {
    try {
      const cancellation = await Cancellation.findById(cancellationId);
      if (!cancellation) throw new Error('Cancellation not found');
      
      // Check authorization based on consumer type
      const isAuthorized = consumerType === 'CORPORATE' 
        ? cancellation.corporateCustomerId.toString() === customerId.toString()
        : cancellation.customerId.toString() === customerId.toString();
      
      if (!isAuthorized) throw new Error('Unauthorized');
      
      return cancellation;
    } catch (error) {
      console.error('CancellationService.getCancellationStatus error:', error);
      throw new Error(`Failed to get cancellation status: ${error.message}`);
    }
  },

  // 4. Update cancellation and booking status
  async updateCancellationStatus(cancellationId, status) {
    try {
      const cancellation = await Cancellation.findById(cancellationId);
      if (!cancellation) throw new Error('Cancellation not found');
      
      cancellation.refundStatus = status;
      await cancellation.save();
      
      return cancellation;
    } catch (error) {
      console.error('CancellationService.updateCancellationStatus error:', error);
      throw new Error(`Failed to update cancellation status: ${error.message}`);
    }
  }
};

module.exports = CancellationService; 