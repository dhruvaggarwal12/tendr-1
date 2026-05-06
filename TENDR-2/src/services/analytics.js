const mongoose = require('mongoose');
const { Booking, Payment, Vendor, Consumer, View } = require('../models');
const { BOOKING_STATUS, PAYMENT_STATUS, CACHE_TTL } = require('../constants');
const { redisClient, getAsync, setAsync, delAsync } = require('../config/redis');
const { logger } = require('../middleware/logger');
const { calculateDateRange } = require('../utils/date');
const analyticsHelpers = require('../utils/analyticsHelpers');

const analyticsService = {
  // Platform Overview Analytics
  async getPlatformAnalytics(timeframe = '30d') {
    try {
      const cacheKey = `platform:analytics:${timeframe}`;
      
      // Try to get from cache first
      const cachedAnalytics = await redisClient.get(cacheKey);
      if (cachedAnalytics) {
        return JSON.parse(cachedAnalytics);
      }

      const { startDate, endDate } = calculateDateRange(timeframe);

      // Gather all required data
      const [bookings, payments, vendors, consumers, views] = await Promise.all([
        Booking.find({ createdAt: { $gte: startDate, $lte: endDate } }),
        Payment.find({ createdAt: { $gte: startDate, $lte: endDate } }),
        Vendor.find({ createdAt: { $gte: startDate, $lte: endDate } }),
        Consumer.find({ createdAt: { $gte: startDate, $lte: endDate } }),
        View.find({ timestamp: { $gte: startDate, $lte: endDate } })
      ]);

      // Bookings
      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED).length;
      const cancelledBookings = bookings.filter(b => b.status === BOOKING_STATUS.CANCELLED).length;
      const pendingBookings = bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED).length;
      const totalBookingValue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      const vendorCancellations = bookings.filter(b => b.status === BOOKING_STATUS.CANCELLED).reduce((acc, b) => {
        acc[b.vendorId] = (acc[b.vendorId] || 0) + 1;
        return acc;
      }, {});

      // Payments
      const totalPayments = payments.length;
      const successfulPayments = payments.filter(p => p.status === PAYMENT_STATUS.SUCCESS).length;
      const failedPayments = payments.filter(p => p.status === PAYMENT_STATUS.FAILED).length;
      const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      // const platformFees = payments.reduce((sum, p) => sum + (p.platformFee || 0), 0);

      // Vendors
      const vendorByService = vendors.reduce((acc, v) => {
        acc[v.serviceType] = (acc[v.serviceType] || 0) + 1;
        return acc;
      }, {});
      // const activeVendors = vendors.filter(v => v.isActive).length;
      const vendorSignupsByMonth = vendors.reduce((acc, v) => {
        const month = new Date(v.createdAt).toISOString().slice(0,7);
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});
      // const avgVendorRating = vendors.length ? vendors.reduce((sum, v) => sum + (v.rating?.average || 0), 0) / vendors.length : 0;

      // Users
      const totalUsers = consumers.length;
      const consumerSignupsByMonth = consumers.reduce((acc, u) => {
        const month = new Date(u.createdAt).toISOString().slice(0,7);
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});
      // const activeUsers = consumers.filter(u => u.lastLoginAt >= startDate).length;

      // Engagement
      const totalViews = views.length;
      const avgViewDuration = views.length ? views.reduce((sum, v) => sum + (v.duration || 0), 0) / views.length : 0;
      const viewsBySource = analyticsHelpers.aggregateViewSources(views);

      // Trends
      const bookingsByDay = analyticsHelpers.aggregateByDay(bookings, 'createdAt');
      const revenueByDay = analyticsHelpers.aggregateByDay(payments, 'createdAt', 'amount');
      const viewsByDay = analyticsHelpers.aggregateByDay(views, 'timestamp');

      // Completion, cancellation, conversion rates
      const completionRate = totalBookings ? completedBookings / totalBookings : 0;
      const cancellationRate = totalBookings ? cancelledBookings / totalBookings : 0;
      const conversionRate = totalViews ? totalBookings / totalViews : 0;

      // Count of each service booked
      const serviceCount = analyticsHelpers.aggregatePopularServices(bookings);
      // Total revenue by different services
      const revenueByService = bookings.reduce((acc, b) => {
        (b.services || []).forEach(s => { acc[s] = (acc[s] || 0) + (b.totalAmount || 0); });
        return acc;
      }, {});
      // Repeat orders by users
      const consumerBookingCounts = bookings.reduce((acc, b) => {
        acc[b.consumerId] = (acc[b.consumerId] || 0) + 1;
        return acc;
      }, {});
      const repeatOrders = Object.values(consumerBookingCounts).filter(c => c > 1).length;

      const analytics = {
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          vendorCancellations,
          pending: pendingBookings,
          totalValue: totalBookingValue
        },
        payments: {
          total: totalPayments,
          successful: successfulPayments,
          failed: failedPayments,
          totalRevenue,
          // platformFees
        },
        vendors: {
          total: vendors.length,
          byService: vendorByService,
          // active: activeVendors,
          newSignupsByMonth: vendorSignupsByMonth,
          // averageRating: avgVendorRating
        },
        consumers: {
          total: totalUsers,
          newSignupsByMonth: consumerSignupsByMonth,
          // activeUsers: activeUsers
        },
        engagement: {
          totalViews,
          averageViewDuration: avgViewDuration,
          viewsBySource
        },
        trends: {
          bookingsByDay,
          revenueByDay,
          viewsByDay
        },
        completionRate,
        cancellationRate,
        conversionRate,
        serviceCount,
        revenueByService,
        repeatOrders
      };

      // Cache the results
      await redisClient.set(cacheKey, JSON.stringify(analytics), { EX: CACHE_TTL });
      return analytics;
    } catch (error) {
      logger.error(`Error getting platform analytics: ${error.message}`);
      throw new Error(`Error getting platform analytics: ${error.message}`);
    }
  },

  // Vendor Performance Analytics
  async getVendorAnalytics(vendorId, timeframe = '30d') {
    try {
      const cacheKey = `vendor:analytics:${vendorId}:${timeframe}`;
      
      // Try to get from cache first
      const cachedAnalytics = await redisClient.get(cacheKey);
      if (cachedAnalytics) {
        return JSON.parse(cachedAnalytics);
      }

      const { startDate, endDate } = calculateDateRange(timeframe);

      // Get vendor data
      const [bookings, payments, views] = await Promise.all([
        Booking.find({
          vendorId,
          createdAt: { $gte: startDate, $lte: endDate }
        }),
        Payment.find({
          vendorId,
          createdAt: { $gte: startDate, $lte: endDate }
        }),
        View.find({
          vendorId,
          timestamp: { $gte: startDate, $lte: endDate }
        })
      ]);

      // Performance
      const totalBookings = bookings.length;
      const pendingBookings = bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED).length;
      const completedBookings = bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED).length;
      const cancelledBookings = bookings.filter(b => b.status === BOOKING_STATUS.CANCELLED).length;
      const completionRate = totalBookings ? completedBookings / totalBookings : 0;
      const cancellationRate = totalBookings ? cancelledBookings / totalBookings : 0;
      // const avgRating = bookings.length ? bookings.reduce((sum, b) => sum + (b.rating?.value || 0), 0) / bookings.length : 0;

      // Revenue
      const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const netIncome = payments.reduce((sum, p) => sum + ((p.amount || 0) - (p.platformFee || 0)), 0);
      const pendingPayouts = payments.filter(p => p.status === PAYMENT_STATUS.INITIATED).reduce((sum, p) => sum + (p.amount || 0), 0);

      // Engagement
      const totalViews = views.length;
      const conversionRate = totalViews ? totalBookings / totalViews : 0;

      // Popular Services
      const serviceCount = analyticsHelpers.aggregatePopularServices(bookings);

      // Customer Segments
      const eventTypeBreakdown = analyticsHelpers.aggregateEventTypes(bookings);
      // const guestCounts = { small: 0, medium: 0, large: 0 };
      // bookings.forEach(b => {
      //   if (b.guests < 50) guestCounts.small++;
      //   else if (b.guests <= 200) guestCounts.medium++;
      //   else guestCounts.large++;
      // });
      const bookingValues = { low: 0, medium: 0, high: 0 };
      bookings.forEach(b => {
        if (b.totalAmount < 1000) bookingValues.low++;
        else if (b.totalAmount <= 5000) bookingValues.medium++;
        else bookingValues.high++;
      });

      const analytics = {
        performance: {
          totalBookings,
          pendingBookings,
          completionRate,
          cancellationRate,
          // averageRating: avgRating
        },
        revenue: {
          total: totalRevenue,
          netIncome,
          pendingPayouts
        },
        engagement: {
          totalViews,
          conversionRate
        },
        popularServices: serviceCount,
        customerSegments: {
          eventTypes: eventTypeBreakdown,
          // guestCounts,
          bookingValues
        }
      };

      // Cache the results
      await redisClient.set(cacheKey, JSON.stringify(analytics), { EX: CACHE_TTL });
      return analytics;
    } catch (error) {
      logger.error(`Error getting vendor analytics: ${error.message}`);
      throw new Error(`Error getting vendor analytics: ${error.message}`);
    }
  },

  // Consumer Analytics
  async getUserAnalytics(userId, timeframe = '30d') {
    try {
      const cacheKey = `user:analytics:${userId}:${timeframe}`;
      // Try to get from cache first
      const cachedAnalytics = await redisClient.get(cacheKey);
      if (cachedAnalytics) {
        return JSON.parse(cachedAnalytics);
      }
      const { startDate, endDate } = calculateDateRange(timeframe);
      // Get user data (no views)
      const [bookings, payments] = await Promise.all([
        Booking.find({
          userId,
          createdAt: { $gte: startDate, $lte: endDate }
        }),
        Payment.find({
          userId,
          createdAt: { $gte: startDate, $lte: endDate }
        })
      ]);
      // Bookings
      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED).length;
      const pendingBookings = bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED).length;
      const avgBookingValue = bookings.length ? bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0) / bookings.length : 0;
      // Payments
      const totalAmountSpent = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const numberOfPayments = payments.length;
      const avgTransactionValue = payments.length ? totalAmountSpent / payments.length : 0;
      // Preferences
      const favoriteEventTypes = analyticsHelpers.aggregateEventTypes(bookings);
      const preferredServices = analyticsHelpers.aggregatePopularServices(bookings);
      const analytics = {
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          pending: pendingBookings,
          averageBookingValue: avgBookingValue
        },
        payments: {
          totalAmountSpent,
          numberOfPayments,
          averageTransactionValue: avgTransactionValue
        },
        preferences: {
          favoriteEventTypes,
          preferredServices
        }
      };
      // Cache the results
      await redisClient.set(cacheKey, JSON.stringify(analytics), { EX: CACHE_TTL });
      return analytics;
    } catch (error) {
      logger.error(`Error getting user analytics: ${error.message}`);
      throw new Error(`Error getting user analytics: ${error.message}`);
    }
  }
};

module.exports = analyticsService; 