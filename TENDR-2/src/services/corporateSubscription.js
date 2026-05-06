const CorporateSubscription = require('../models/CorporateSubscription');
const CorporateConsumer = require('../models/CorporateConsumer');
const Payment = require('../models/Payment');
const { CORPORATE_PLANS } = require('../constants');
const eventBus = require('./eventBus');

// Plan configurations
const PLAN_CONFIGS = {
  [CORPORATE_PLANS.BASIC]: {
    annualPrice: 0,
    originalPrice: 0,
    addOnCostPerEvent: 750,
    features: {
      vendorAccess: true,
      basicSupport: true,
      standardBooking: true,
      monthlyEventLimit: 5
    }
  },
  [CORPORATE_PLANS.PRO]: {
    annualPrice: 12000,
    originalPrice: 15000,
    addOnCostPerEvent: 500,
    features: {
      vendorAccess: true,
      basicSupport: true,
      standardBooking: true,
      priorityVendorAccess: true,
      dedicatedCoordinator: true,
      customInvitations: true,
      professionalBackdrops: true,
      socialMediaShoutouts: true,
      monthlyEventLimit: 10,
      coordinatorHours: 20,
      customDesigns: 5,
      socialMediaPosts: 3
    }
  },
  [CORPORATE_PLANS.ELITE]: {
    annualPrice: 18000,
    originalPrice: 21000,
    addOnCostPerEvent: 0,
    features: {
      vendorAccess: true,
      basicSupport: true,
      standardBooking: true,
      priorityVendorAccess: true,
      dedicatedCoordinator: true,
      customInvitations: true,
      professionalBackdrops: true,
      socialMediaShoutouts: true,
      premiumVendorAccess: true,
      endToEndManagement: true,
      customMemorabilia: true,
      professionalAfterMovies: true,
      exclusiveBackdrops: true,
      premiumSupport: true,
      monthlyEventLimit: 20,
      coordinatorHours: 40,
      customDesigns: 10,
      socialMediaPosts: 5,
      afterMovieMinutes: 30
    }
  }
};

const CorporateSubscriptionService = {
  // 1. Create new subscription
  async createSubscription(corporateConsumerId, planType, paymentMethod) {
    const config = PLAN_CONFIGS[planType];
    if (!config) {
      throw new Error('Invalid plan type');
    }

    // Check if consumer already has an active subscription
    const existingSubscription = await CorporateSubscription.findOne({
      consumer: corporateConsumerId,
      status: 'ACTIVE'
    });

    if (existingSubscription) {
      throw new Error('Consumer already has an active subscription');
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    // Create subscription
    const subscription = new CorporateSubscription({
      consumer: corporateConsumerId,
      planType,
      pricing: {
        annualPrice: config.annualPrice,
        originalPrice: config.originalPrice,
        addOnCostPerEvent: config.addOnCostPerEvent,
        currency: 'INR'
      },
      status: 'ACTIVE',
      startDate,
      endDate,
      features: config.features,
      paymentMethod,
      billing: {
        paymentMethod,
        lastBillingDate: startDate,
        nextBillingDate: endDate
      }
    });

    await subscription.save();

    // Update corporate consumer
    await CorporateConsumer.findByIdAndUpdate(corporateConsumerId, {
      activeSubscription: subscription._id
    });

    eventBus.emit('SubscriptionCreated', { subscription });
    return subscription;
  },

  // 2. Process subscription payment
  async processSubscriptionPayment(subscriptionId, paymentDetails) {
    const subscription = await CorporateSubscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Create payment record
    const payment = new Payment({
      paymentType: 'SUBSCRIPTION',
      corporateConsumerId: subscription.consumer,
      subscriptionId: subscription._id,
      amount: subscription.pricing.annualPrice,
      method: paymentDetails.method,
      status: 'PENDING',
      razorpayOrderId: paymentDetails.razorpayOrderId,
      billingCycle: 'ANNUAL',
      planType: subscription.planType,
      description: `${subscription.planType} Plan - Annual Subscription`
    });

    await payment.save();

    // Update subscription with payment reference
    subscription.paymentId = payment._id;
    await subscription.save();

    return { subscription, payment };
  },

  // 3. Verify and activate subscription
  async verifySubscriptionPayment(paymentId, razorpayPaymentId) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Verify with Razorpay (simplified for now)
    payment.status = 'SUCCESS';
    payment.razorpayPaymentId = razorpayPaymentId;
    await payment.save();

    // Update subscription status
    const subscription = await CorporateSubscription.findById(payment.subscriptionId);
    if (subscription) {
      subscription.status = 'ACTIVE';
      subscription.billing.paymentStatus = 'SUCCESS';
      await subscription.save();

      eventBus.emit('SubscriptionActivated', { subscription, payment });
    }

    return { payment, subscription };
  },

  // 4. Get subscription details with features
  async getSubscriptionDetails(subscriptionId) {
    const subscription = await CorporateSubscription.findById(subscriptionId)
      .populate('consumer', 'companyName contactPerson')
      .populate('assignedCoordinator', 'name email phone')
      .populate('paymentId', 'status amount method');

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    return subscription;
  },

  // 5. Check feature access
  async checkFeatureAccess(corporateConsumerId, feature) {
    const subscription = await CorporateSubscription.findOne({
      consumer: corporateConsumerId,
      status: 'ACTIVE'
    });

    if (!subscription) {
      return { hasAccess: false, reason: 'No active subscription' };
    }

    const hasAccess = subscription.features[feature];
    return { hasAccess, subscription };
  },

  // 6. Update usage metrics
  async updateUsage(subscriptionId, usageData) {
    const subscription = await CorporateSubscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Update usage
    if (usageData.eventsBooked) {
      subscription.usage.eventsBooked += usageData.eventsBooked;
    }
    if (usageData.addOnSpend) {
      subscription.usage.addOnSpend += usageData.addOnSpend;
    }

    await subscription.save();
    return subscription;
  },

  // 7. Cancel subscription
  async cancelSubscription(subscriptionId, reason) {
    const subscription = await CorporateSubscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.status = 'CANCELLED';
    subscription.cancelReason = reason;
    subscription.autoRenewal = false;
    await subscription.save();

    // Update corporate consumer
    await CorporateConsumer.findByIdAndUpdate(subscription.consumer, {
      $unset: { activeSubscription: 1 }
    });

    eventBus.emit('SubscriptionCancelled', { subscription });
    return subscription;
  },

  // 8. Renew subscription
  async renewSubscription(subscriptionId) {
    const subscription = await CorporateSubscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Calculate new dates
    const newStartDate = new Date();
    const newEndDate = new Date();
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);

    subscription.startDate = newStartDate;
    subscription.endDate = newEndDate;
    subscription.status = 'ACTIVE';
    subscription.usage.eventsBooked = 0;
    subscription.usage.addOnSpend = 0;
    await subscription.save();

    eventBus.emit('SubscriptionRenewed', { subscription });
    return subscription;
  },

  // 9. Get subscription analytics
  async getSubscriptionAnalytics(corporateConsumerId) {
    const subscriptions = await CorporateSubscription.find({
      consumer: corporateConsumerId
    }).sort({ createdAt: -1 });

    const analytics = {
      totalSubscriptions: subscriptions.length,
      activeSubscription: subscriptions.find(s => s.status === 'ACTIVE'),
      totalSpent: subscriptions.reduce((sum, s) => sum + s.pricing.annualPrice, 0),
      averageUsage: {
        eventsBooked: subscriptions.reduce((sum, s) => sum + s.usage.eventsBooked, 0) / subscriptions.length || 0,
        addOnSpend: subscriptions.reduce((sum, s) => sum + s.usage.addOnSpend, 0) / subscriptions.length || 0
      },
      planDistribution: subscriptions.reduce((acc, s) => {
        acc[s.planType] = (acc[s.planType] || 0) + 1;
        return acc;
      }, {})
    };

    return analytics;
  },

  // 10. Assign coordinator
  async assignCoordinator(subscriptionId, coordinatorId) {
    const subscription = await CorporateSubscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.assignedCoordinator = coordinatorId;
    await subscription.save();

    eventBus.emit('CoordinatorAssigned', { subscription, coordinatorId });
    return subscription;
  }
};

module.exports = CorporateSubscriptionService; 