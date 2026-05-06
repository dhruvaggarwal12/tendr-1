const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analytics');
const { authConsumer, authVendor, authAdmin } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');
const { body } = require('express-validator');
const { logger } = require('../middleware/logger');
const { Vendor,Consumer } = require('../models');

// Platform-wide analytics (admin only)
router.get('/platform', authAdmin, [
  body('timeframe').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Invalid timeframe'),
  validateRequest
], async (req, res) => {
  try {
    const analytics = await analyticsService.getPlatformAnalytics(req.query.timeframe);
    res.json(analytics);
  } catch (error) {
    logger.error(`Error getting platform analytics: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Vendor analytics
router.get('/vendor/:vendorId', authVendor, [
  body('timeframe').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Invalid timeframe'),
  validateRequest
], async (req, res) => {

  try {
    // Check if user has access to vendor analytics
    if (!req.vendor) {
      return res.status(403).json({ error: 'Unauthorized access to vendor analytics' });
    }
    if (!req.vendor.isAdmin && req.vendor._id.toString() !== req.params.vendorId&& !(req.admin && req.admin.isAdmin) ) {
      return res.status(403).json({ error: 'Unauthorized access to vendor analytics' });
    }
    const analytics = await analyticsService.getVendorAnalytics(
      req.params.vendorId,
      req.query.timeframe
    );
    res.json(analytics);
  } catch (error) {
    logger.error(`Error getting vendor analytics: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// User analytics
router.get('/consumer/:consumerId', authConsumer, [
  body('timeframe').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Invalid timeframe'),
  validateRequest
], async (req, res) => {
  try {
    if (!req.consumer) {
      return res.status(403).json({ error: 'Unauthorized access to consumer analytics' });
    }

    // Users can only access their own analytics unless they are admin
    if (!req.consumer.isAdmin && req.consumer._id.toString() !== req.params.consumerId) {
      return res.status(403).json({ error: 'Unauthorized access to user analytics' });
    }

    const analytics = await analyticsService.getUserAnalytics(
      req.params.consumerId,
      req.query.timeframe
    );
    res.json(analytics);
  } catch (error) {
    logger.error(`Error getting user analytics: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});


// Export analytics data (admin only)
router.get('/export/:type', authAdmin, [
  body('timeframe').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Invalid timeframe'),
  validateRequest
], async (req, res) => {
  try {
    let data;
    const timeframe = req.query.timeframe;

    switch (req.params.type) {
      case 'platform':
        data = await analyticsService.getPlatformAnalytics(timeframe);
        break;
      case 'vendors':
        // Get analytics for all vendors
        const vendors = await Vendor.find({});
        data = await Promise.all(
          vendors.map(vendor => analyticsService.getVendorAnalytics(vendor._id, timeframe))
        );
        break;
      case 'consumers':
        // Get analytics for all consumers
        const consumers = await Consumer.find({});
        data = await Promise.all(
          consumers.map(consumer => analyticsService.getUserAnalytics(consumer._id, timeframe))
        );
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    // Format data for export
    const exportData = {
      type: req.params.type,
      timeframe,
      exportedAt: new Date(),
      data
    };

    res.json(exportData);
  } catch (error) {
    logger.error(`Error exporting analytics: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 