const Payment = require('../models/Payment');
const Razorpay = require('razorpay');
const eventBus = require('./eventBus');

// Initialize Razorpay client
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const PaymentService = {
  // 1. Create Razorpay order for an offer
  async createOrder(offerId, customerId, amount, method, paymentType = 'BOOKING') {
    try {
      // Validate amount
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount');
      }

      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // paise
        currency: 'INR',
        receipt: `offer_${offerId}`,
        payment_capture: 1
      });

      // Create Payment record
      const payment = await Payment.create({
        paymentType,
        offerId,
        customerId,
        amount,
        method: method || 'CARD', // Default to CARD if not specified
        status: 'INITIATED',
        razorpayOrderId: order.id,
        currency: 'INR',
        description: `Payment for ${paymentType.toLowerCase()}`
      });

      return { order, payment };
    } catch (error) {
      console.error('PaymentService.createOrder error:', error);
      throw new Error(`Failed to create payment order: ${error.message}`);
    }
  },

  // 2. Verify payment and update status
  async verifyAndRecordPayment(paymentId, razorpayPaymentId) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) throw new Error('Payment not found');

      // Fetch payment from Razorpay
      const razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);
      
      if (razorpayPayment.status === 'captured') {
        payment.status = 'SUCCESS';
        payment.razorpayPaymentId = razorpayPaymentId;
        payment.method = razorpayPayment.method || payment.method;
        await payment.save();
        
        eventBus.emit('PaymentSuccess', { payment, razorpayPayment });
        return { status: 'success', payment, razorpayPayment };
      } else if (razorpayPayment.status === 'failed') {
        payment.status = 'FAILED';
        payment.razorpayPaymentId = razorpayPaymentId;
        await payment.save();
        
        eventBus.emit('PaymentFailed', { payment, razorpayPayment });
        return { status: 'failed', payment, razorpayPayment };
      } else {
        // Payment is still processing
        payment.razorpayPaymentId = razorpayPaymentId;
        await payment.save();
        
        return { status: 'processing', payment, razorpayPayment };
      }
    } catch (error) {
      console.error('PaymentService.verifyAndRecordPayment error:', error);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  },

  // 3. Link payment to booking
  async linkPaymentToBooking(paymentId, bookingId) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) throw new Error('Payment not found');
      
      // Add booking reference to payment
      payment.bookingId = bookingId;
      await payment.save();
      
      return { success: true, payment };
    } catch (error) {
      console.error('PaymentService.linkPaymentToBooking error:', error);
      throw new Error(`Failed to link payment to booking: ${error.message}`);
    }
  },

  // 4. Process refund via Razorpay
  async processRefund(paymentId, refundAmount, notes = '') {
    try {
      // Fetch payment
      const payment = await Payment.findById(paymentId);
      if (!payment) throw new Error('Payment not found');
      if (!payment.razorpayPaymentId) throw new Error('No Razorpay payment ID');
      if (payment.status !== 'SUCCESS') throw new Error('Payment must be successful to refund');

      // Validate refund amount
      if (refundAmount > payment.amount) {
        throw new Error('Refund amount cannot exceed payment amount');
      }

      // Idempotency key
      const idempotencyKey = `${paymentId}-${refundAmount}-${Date.now()}`;

      // Call Razorpay refund API
      const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: Math.round(refundAmount * 100), // Razorpay expects paise
        notes: { reason: notes }
      }, { idempotency_key: idempotencyKey });

      // Update Payment record
      payment.status = 'REFUNDED';
      payment.refundId = refund.id;
      payment.refundAmount = refundAmount;
      payment.refundNotes = notes;
      await payment.save();
      
      eventBus.emit('RefundProcessed', { payment, refund });
      return { status: 'success', refundId: refund.id, refund };
    } catch (error) {
      console.error('PaymentService.processRefund error:', error);
      
      // Update payment with error
      if (payment) {
        payment.refundError = error.message;
        await payment.save();
      }
      
      throw new Error(`Refund processing failed: ${error.message}`);
    }
  },

  // 5. Get payment status
  async getPaymentStatus(paymentId) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) throw new Error('Payment not found');
      
      return {
        paymentId: payment._id,
        status: payment.status,
        amount: payment.amount,
        method: payment.method,
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      };
    } catch (error) {
      console.error('PaymentService.getPaymentStatus error:', error);
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  },

  // 6. Retry failed payment
  async retryPayment(paymentId) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) throw new Error('Payment not found');
      if (payment.status !== 'FAILED') throw new Error('Only failed payments can be retried');

      // Create new Razorpay order
      const order = await razorpay.orders.create({
        amount: Math.round(payment.amount * 100),
        currency: 'INR',
        receipt: `retry_${payment._id}`,
        payment_capture: 1
      });

      // Update payment with new order ID
      payment.razorpayOrderId = order.id;
      payment.status = 'INITIATED';
      payment.refundError = null; // Clear any previous errors
      await payment.save();

      return { order, payment };
    } catch (error) {
      console.error('PaymentService.retryPayment error:', error);
      throw new Error(`Failed to retry payment: ${error.message}`);
    }
  }
};

module.exports = PaymentService; 