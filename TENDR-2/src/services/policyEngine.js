// PolicyEngine: Centralized business rules and policy decisions
const eventBus = require('./eventBus');

class PolicyEngine {
  // Calculate refund percentage and notes based on booking and cancellation time
  static calculateRefund(booking, now = new Date()) {
    const eventDate = new Date(booking.schedule.date);
    const bookingDate = new Date(booking.createdAt);
    const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);
    const daysUntilEvent = hoursUntilEvent / 24;
    const hoursSinceBooking = (now - bookingDate) / (1000 * 60 * 60);
    const daysSinceBooking = hoursSinceBooking / 24;
    let refundPercentage = 0;
    let notes = '';

    // Within 24 hours of booking: 100% refund
    if (hoursSinceBooking <= 24) {
      refundPercentage = 1.0;
      notes = 'Cancelled within 24 hours of booking: 100% refund.';
      return { refundPercentage, notes };
    }

    // Special provisions based on booking lead time
    const leadTime = (eventDate - bookingDate) / (1000 * 60 * 60 * 24); // in days
    if (leadTime >= 7 && leadTime <= 14) {
      // Booked 7–14 days prior: 48 hr window for 50% refund, then standard
      if (hoursSinceBooking <= 48) {
        refundPercentage = 0.5;
        notes = 'Cancelled within 48 hours of booking (lead time 7-14 days): 50% refund.';
        return { refundPercentage, notes };
      }
    } else if (leadTime >= 3 && leadTime < 7) {
      // Booked 3–6 days prior: 24 hr window for 25% refund, then standard
      if (hoursSinceBooking <= 24) {
        refundPercentage = 0.25;
        notes = 'Cancelled within 24 hours of booking (lead time 3-6 days): 25% refund.';
        return { refundPercentage, notes };
      }
    } else if (leadTime < 3) {
      // Booked < 3 days prior: 12 hr window for 10% refund, then 0%
      if (hoursSinceBooking <= 12) {
        refundPercentage = 0.1;
        notes = 'Cancelled within 12 hours of booking (lead time <3 days): 10% refund.';
        return { refundPercentage, notes };
      } else {
        refundPercentage = 0.0;
        notes = 'Cancelled after 12 hours of booking (lead time <3 days): 0% refund.';
        return { refundPercentage, notes };
      }
    }

    // Standard refund tiers based on days before event
    if (daysUntilEvent >= 15) {
      refundPercentage = 0.75;
      notes = 'Cancelled ≥15 days before event: 75% refund.';
    } else if (daysUntilEvent >= 8) {
      refundPercentage = 0.5;
      notes = 'Cancelled 8–14 days before event: 50% refund.';
    } else if (daysUntilEvent >= 4) {
      refundPercentage = 0.25;
      notes = 'Cancelled 4–7 days before event: 25% refund.';
    } else {
      refundPercentage = 0.0;
      notes = 'Cancelled <4 days before event: 0% refund.';
    }
    return { refundPercentage, notes };
  }

  // Calculate vendor penalty based on cancellation count
  static calculateVendorPenalty(cancellationCount) {
    if (cancellationCount === 1) {
      return {
        type: 'WARNING',
        duration: 7, // days
        ratingReduction: 0,
        commissionIncrease: 0,
        suspension: false
      };
    } else if (cancellationCount <= 3) {
      return {
        type: 'RATING_REDUCTION',
        duration: 14,
        ratingReduction: 0.2 * cancellationCount,
        commissionIncrease: 0,
        suspension: false
      };
    } else if (cancellationCount <= 5) {
      return {
        type: 'COMMISSION_INCREASE',
        duration: 21,
        ratingReduction: 0,
        commissionIncrease: 0.05,
        orders: 5,
        suspension: false
      };
    } else if (cancellationCount <= 7) {
      return {
        type: 'SUSPENSION',
        duration: 7,
        ratingReduction: 0,
        commissionIncrease: 0,
        suspension: true,
        suspensionDays: 7
      };
    } else {
      return {
        type: 'SUSPENSION',
        duration: 30,
        ratingReduction: 0,
        commissionIncrease: 0,
        suspension: true,
        suspensionDays: 30,
        reevaluate: true
      };
    }
  }

  // Determine if vendor should be penalized
  static shouldPenalizeVendor(cancellationCount) {
    return cancellationCount > 1;
  }

  // Calculate review impact on vendor rating
  static calculateRatingImpact(reviewRatings) {
    const weights = {
      overall: 0.3,
      quality: 0.25,
      punctuality: 0.15,
      professionalism: 0.15,
      valueForMoney: 0.1,
      communication: 0.05
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const [category, rating] of Object.entries(reviewRatings)) {
      if (weights[category] && rating >= 1 && rating <= 5) {
        weightedSum += rating * weights[category];
        totalWeight += weights[category];
      }
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  // Determine if booking can be cancelled
  static canCancelBooking(booking, now = new Date()) {
    const eventDate = new Date(booking.schedule.date);
    const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);
    
    // Can't cancel if event is in progress or completed
    if (hoursUntilEvent <= 0) {
      return { canCancel: false, reason: 'Event has already started or completed' };
    }

    // Can't cancel if booking is already cancelled
    if (booking.status === 'CANCELLED') {
      return { canCancel: false, reason: 'Booking is already cancelled' };
    }

    return { canCancel: true };
  }

  // Get policy summary for a booking
  static getPolicySummary(booking, now = new Date()) {
    const refundInfo = this.calculateRefund(booking, now);
    const canCancelInfo = this.canCancelBooking(booking, now);
    
    return {
      canCancel: canCancelInfo.canCancel,
      reason: canCancelInfo.reason,
      refundPercentage: refundInfo.refundPercentage,
      refundNotes: refundInfo.notes,
      eventDate: booking.schedule.date,
      timeUntilEvent: (new Date(booking.schedule.date) - now) / (1000 * 60 * 60 * 24)
    };
  }
}

module.exports = PolicyEngine; 