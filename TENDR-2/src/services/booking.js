const Request = require('../models/Request');
const Conversation = require('../models/Conversation');
const Offer = require('../models/Offer');
const Booking = require('../models/Booking');
const { Product } = require('../models');
// const Payment = require('../models/Payment');
const eventBus = require('./eventBus');
const PaymentService = require('./payment');

// BookingService: Handles the full booking lifecycle
const BookingService = {
  // 1. Create a new request
  async createRequest(customerId, serviceType, preferredDateRange, details, consumerType = 'INDIVIDUAL') {
    const requestData = {
      serviceType,
      preferredDateRange,
      details,
      status: 'PENDING'
    };

    // Set the appropriate customer field based on consumer type
    if (consumerType === 'CORPORATE') {
      requestData.corporateCustomerId = customerId;
    } else {
      requestData.customerId = customerId;
    }

    const request = await Request.create(requestData);
    return request;
  },

  // 2. Vendor accepts request and conversation is opened
  async openConversation(requestId, vendorId, consumerType = 'INDIVIDUAL') {
    // Find or create conversation for this request and vendor
    let convo = await Conversation.findOne({ requestId, participants: vendorId });
    if (!convo) {
      // Assume customer is the request owner
      const request = await Request.findById(requestId);
      if (!request) throw new Error('Request not found');
      
      const conversationData = {
        requestId,
        participants: [vendorId],
        status: 'OPEN'
      };

      // Set the appropriate customer field based on consumer type
      if (consumerType === 'CORPORATE') {
        conversationData.corporateCustomerId = request.corporateCustomerId;
      } else {
        conversationData.customerId = request.customerId;
      }

      convo = await Conversation.create(conversationData);
    }
    return convo;
  },

  // 3. Vendor sends offer
  async createOffer(conversationId, vendorId, customerId, totalPrice, breakdown, expiry, consumerType = 'INDIVIDUAL', productId = null) {
    const offerData = {
      conversationId,
      vendorId,
      totalPrice,
      breakdown,
      expiry,
      status: 'PENDING'
    };

    // Set the appropriate customer field based on consumer type
    if (consumerType === 'CORPORATE') {
      offerData.corporateCustomerId = customerId;
    } else {
      offerData.customerId = customerId;
    }

    // Add product reference for gift hamper/cake bookings
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) throw new Error('Product not found');
      if (product.vendorId.toString() !== vendorId.toString()) {
        throw new Error('Product does not belong to this vendor');
      }
      offerData.productId = productId;
    }

    const offer = await Offer.create(offerData);
    return offer;
  },

  // 4. Customer accepts offer and initiates payment
  async acceptOffer(offerId, customerId, consumerType = 'INDIVIDUAL') {
    try {
      // Mark offer as accepted
      const offer = await Offer.findById(offerId);
      if (!offer) throw new Error('Offer not found');
      
      // Check authorization based on consumer type
      const isAuthorized = consumerType === 'CORPORATE' 
        ? offer.corporateCustomerId.toString() === customerId.toString()
        : offer.customerId.toString() === customerId.toString();
      
      if (!isAuthorized) throw new Error('Unauthorized');
      
      offer.status = 'ACCEPTED';
      await offer.save();
      
      // Calculate upfront payment (40% of total)
      const upfront = Math.round(offer.totalPrice * 0.4);

      // Create Razorpay order & Payment record
      const { order, payment } = await PaymentService.createOrder(
        offerId,
        customerId,
        upfront,
        null,  // method will be filled in on verification
        'BOOKING'  // payment type
      );

      // Return both offer and payment/order details for the frontend
      return { offer, order, payment };
    } catch (error) {
      console.error('BookingService.acceptOffer error:', error);
      throw new Error(`Failed to accept offer: ${error.message}`);
    }
  },

  // 5. Create booking after payment success
  async createBooking(offerId, paymentId, customerId, vendorId, schedule, items, consumerType = 'INDIVIDUAL') {
    try {
      // Verify payment is successful
      const paymentStatus = await PaymentService.getPaymentStatus(paymentId);
      if (paymentStatus.status !== 'SUCCESS') {
        throw new Error('Payment must be successful to create booking');
      }

      // Get offer details to check for product reference
      const offer = await Offer.findById(offerId);
      if (!offer) throw new Error('Offer not found');

      const bookingData = {
        offerId,
        paymentId,
        vendorId,
        schedule,
        items,
        totalAmount: paymentStatus.amount,
        status: 'CONFIRMED'
      };

      // Set the appropriate customer field based on consumer type
      if (consumerType === 'CORPORATE') {
        bookingData.corporateCustomerId = customerId;
      } else {
        bookingData.customerId = customerId;
      }

      // Add product reference for gift hamper/cake bookings
      if (offer.productId) {
        bookingData.productId = offer.productId;
      }

      // Create booking
      const booking = await Booking.create(bookingData);

      // Link payment to booking
      await PaymentService.linkPaymentToBooking(paymentId, booking._id);

      // Emit booking created event
      eventBus.emit('BookingCreated', { booking });
      
      return booking;
    } catch (error) {
      console.error('BookingService.createBooking error:', error);
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  },

  // 6. Update booking status (complete/cancel)
  async updateBookingStatus(bookingId, status) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error('Booking not found');
    booking.status = status;
    await booking.save();
    eventBus.emit('BookingStatusUpdated', { bookingId, status });
    return booking;
  }
};

module.exports = BookingService; 