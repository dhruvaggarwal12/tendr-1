const eventBus = require('./eventBus');
const { sendEmail } = require('../utils/email');
const { sendSMS } = require('../utils/sms');
const { sendPushNotification } = require('../utils/push');

const NotificationService = {
  // Booking lifecycle notifications
  async notifyBookingCreated(booking) {
    try {
      const notifications = [
        this.sendCustomerNotification(booking.customerId, 'booking-created', {
          bookingId: booking._id,
          eventDate: booking.schedule.date,
          vendorName: booking.vendorId?.name || 'Vendor'
        }),
        this.sendVendorNotification(booking.vendorId, 'new-booking', {
          bookingId: booking._id,
          eventDate: booking.schedule.date,
          customerName: booking.customerId?.name || 'Customer'
        })
      ];

      await Promise.allSettled(notifications);
    } catch (error) {
      console.error('NotificationService.notifyBookingCreated error:', error);
    }
  },

  async notifyBookingCancelled(booking, cancellation) {
    try {
      const notifications = [
        this.sendCustomerNotification(booking.customerId, 'booking-cancelled', {
          bookingId: booking._id,
          refundAmount: cancellation.refundAmount,
          refundStatus: cancellation.refundStatus
        }),
        this.sendVendorNotification(booking.vendorId, 'booking-cancelled', {
          bookingId: booking._id,
          cancellationReason: cancellation.reason
        })
      ];

      await Promise.allSettled(notifications);
    } catch (error) {
      console.error('NotificationService.notifyBookingCancelled error:', error);
    }
  },

  async notifyPaymentSuccess(payment) {
    try {
      await this.sendCustomerNotification(payment.customerId, 'payment-success', {
        paymentId: payment._id,
        amount: payment.amount,
        method: payment.method
      });
    } catch (error) {
      console.error('NotificationService.notifyPaymentSuccess error:', error);
    }
  },

  async notifyRefundProcessed(payment, refund) {
    try {
      await this.sendCustomerNotification(payment.customerId, 'refund-processed', {
        paymentId: payment._id,
        refundAmount: refund.refundAmount,
        refundId: refund.refundId
      });
    } catch (error) {
      console.error('NotificationService.notifyRefundProcessed error:', error);
    }
  },

  async notifyReviewCreated(review) {
    try {
      await this.sendVendorNotification(review.vendorId, 'new-review', {
        reviewId: review._id,
        rating: review.averageRating,
        customerName: review.consumerName
      });
    } catch (error) {
      console.error('NotificationService.notifyReviewCreated error:', error);
    }
  },

  async notifyVendorPenalized(vendorId, type, amount) {
    try {
      const penaltyMessages = {
        'WARNING': 'You have received a warning for frequent cancellations.',
        'RATING_REDUCTION': `Your rating has been reduced by ${amount} stars due to cancellations.`,
        'COMMISSION_INCREASE': `Your commission has been increased by ${amount * 100}% for the next orders.`,
        'SUSPENSION': 'Your account has been temporarily suspended due to frequent cancellations.'
      };

      await this.sendVendorNotification(vendorId, 'vendor-penalized', {
        penaltyType: type,
        message: penaltyMessages[type] || 'A penalty has been applied to your account.'
      });
    } catch (error) {
      console.error('NotificationService.notifyVendorPenalized error:', error);
    }
  },

  // Generic notification methods
  async sendCustomerNotification(customerId, type, data) {
    try {
      // Get customer preferences
      const customer = await require('../models/IndividualConsumer').findById(customerId);
      if (!customer) return;

      const notifications = [];

      // Email notification
      if (customer.email) {
        notifications.push(sendEmail(customer.email, type, data));
      }

      // SMS notification
      if (customer.phoneNumber) {
        notifications.push(sendSMS(customer.phoneNumber, type, data));
      }

      // Push notification (if implemented)
      // notifications.push(sendPushNotification(customerId, type, data));

      await Promise.allSettled(notifications);
    } catch (error) {
      console.error('NotificationService.sendCustomerNotification error:', error);
    }
  },

  async sendVendorNotification(vendorId, type, data) {
    try {
      // Get vendor preferences
      const vendor = await require('../models/Vendor').findById(vendorId);
      if (!vendor) return;

      const notifications = [];

      // Email notification
      if (vendor.email) {
        notifications.push(sendEmail(vendor.email, type, data));
      }

      // SMS notification
      if (vendor.phoneNumber) {
        notifications.push(sendSMS(vendor.phoneNumber, type, data));
      }

      await Promise.allSettled(notifications);
    } catch (error) {
      console.error('NotificationService.sendVendorNotification error:', error);
    }
  }
};

module.exports = NotificationService; 