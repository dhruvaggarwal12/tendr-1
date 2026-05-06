const express = require('express');
const { body, query } = require('express-validator');
const { authCorporateConsumer, authAdmin } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');
const CorporateSubscriptionService = require('../services/corporateSubscription');
const CorporateEventService = require('../services/corporateEvent');
const { CORPORATE_PLANS, CORPORATE_EVENT_TYPES } = require('../constants');

const router = express.Router();

// ==================== CORPORATE SUBSCRIPTION ROUTES ====================

// POST /api/corporate/subscriptions
// Create new subscription
router.post('/subscriptions', [
  authCorporateConsumer,
  body('planType').isIn(Object.values(CORPORATE_PLANS)).withMessage('Invalid plan type'),
  body('paymentMethod').isIn(['CARD', 'UPI', 'NETBANKING', 'WALLET']).withMessage('Invalid payment method'),
  validateRequest
], async (req, res) => {
  try {
    const { planType, paymentMethod } = req.body;
    const subscription = await CorporateSubscriptionService.createSubscription(
      req.corporateConsumer._id,
      planType,
      paymentMethod
    );

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/corporate/subscriptions/:id
// Get subscription details
router.get('/subscriptions/:id', [
  authCorporateConsumer,
  body('id').isMongoId().withMessage('Invalid subscription ID')
], async (req, res) => {
  try {
    const subscription = await CorporateSubscriptionService.getSubscriptionDetails(req.params.id);
    
    // Check if user owns this subscription
    if (subscription.consumer._id.toString() !== req.corporateConsumer._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// POST /api/corporate/subscriptions/:id/payment
// Process subscription payment
router.post('/subscriptions/:id/payment', [
  authCorporateConsumer,
  body('razorpayOrderId').notEmpty().withMessage('Razorpay order ID required'),
  body('method').isIn(['CARD', 'UPI', 'NETBANKING', 'WALLET']).withMessage('Invalid payment method'),
  validateRequest
], async (req, res) => {
  try {
    const { razorpayOrderId, method } = req.body;
    const paymentDetails = { razorpayOrderId, method };
    
    const result = await CorporateSubscriptionService.processSubscriptionPayment(
      req.params.id,
      paymentDetails
    );

    res.json({
      message: 'Payment processed successfully',
      ...result
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/corporate/subscriptions/:id/verify-payment
// Verify subscription payment
router.post('/subscriptions/:id/verify-payment', [
  authCorporateConsumer,
  body('paymentId').isMongoId().withMessage('Invalid payment ID'),
  body('razorpayPaymentId').notEmpty().withMessage('Razorpay payment ID required'),
  validateRequest
], async (req, res) => {
  try {
    const { paymentId, razorpayPaymentId } = req.body;
    const result = await CorporateSubscriptionService.verifySubscriptionPayment(
      paymentId,
      razorpayPaymentId
    );

    res.json({
      message: 'Payment verified successfully',
      ...result
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/corporate/subscriptions/:id
// Cancel subscription
router.delete('/subscriptions/:id', [
  authCorporateConsumer,
  body('reason').optional().isString().withMessage('Reason must be a string'),
  validateRequest
], async (req, res) => {
  try {
    const subscription = await CorporateSubscriptionService.cancelSubscription(
      req.params.id,
      req.body.reason || 'Cancelled by user'
    );

    res.json({
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/corporate/subscriptions/analytics
// Get subscription analytics
router.get('/subscriptions/analytics', [
  authCorporateConsumer
], async (req, res) => {
  try {
    const analytics = await CorporateSubscriptionService.getSubscriptionAnalytics(
      req.corporateConsumer._id
    );

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CORPORATE EVENT ROUTES ====================

// POST /api/corporate/events
// Create new corporate event
router.post('/events', [
  authCorporateConsumer,
  body('eventName').notEmpty().withMessage('Event name is required'),
  body('eventType').isIn(CORPORATE_EVENT_TYPES).withMessage('Invalid event type'),
  body('eventDate').isISO8601().withMessage('Valid event date required'),
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('endTime').notEmpty().withMessage('End time is required'),
  body('venue').notEmpty().withMessage('Venue is required'),
  body('expectedAttendees').isInt({ min: 1 }).withMessage('Expected attendees must be positive'),
  body('budget').isFloat({ min: 0 }).withMessage('Budget must be non-negative'),
  body('isRecurring').optional().isBoolean().withMessage('isRecurring must be boolean'),
  validateRequest
], async (req, res) => {
  try {
    const event = await CorporateEventService.createEvent(
      req.corporateConsumer._id,
      req.body
    );

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/corporate/events
// Get corporate events with filters
router.get('/events', [
  authCorporateConsumer,
  query('status').optional().isString().withMessage('Status must be string'),
  query('eventType').optional().isIn(CORPORATE_EVENT_TYPES).withMessage('Invalid event type'),
  query('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
  query('dateTo').optional().isISO8601().withMessage('Invalid date format'),
  validateRequest
], async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      eventType: req.query.eventType,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo
    };

    const events = await CorporateEventService.getCorporateEvents(
      req.corporateConsumer._id,
      filters
    );

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/corporate/events/:id
// Get event details
router.get('/events/:id', [
  authCorporateConsumer
], async (req, res) => {
  try {
    const event = await CorporateEventService.getEventDetails(req.params.id);
    
    // Check if user owns this event
    if (event.corporateConsumerId._id.toString() !== req.corporateConsumer._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(event);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// POST /api/corporate/events/:id/vendor-bookings
// Add vendor booking to event
router.post('/events/:id/vendor-bookings', [
  authCorporateConsumer,
  body('vendorId').isMongoId().withMessage('Invalid vendor ID'),
  body('serviceType').isIn(['DJ', 'Decorator', 'Photographer', 'Caterer']).withMessage('Invalid service type'),
  body('cost').isFloat({ min: 0 }).withMessage('Cost must be non-negative'),
  body('specialRequirements').optional().isString().withMessage('Special requirements must be string'),
  validateRequest
], async (req, res) => {
  try {
    const event = await CorporateEventService.addVendorBooking(
      req.params.id,
      req.body
    );

    res.json({
      message: 'Vendor booking added successfully',
      event
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/corporate/events/:id/progress
// Update event progress
router.patch('/events/:id/progress', [
  authCorporateConsumer,
  body('planning').optional().isInt({ min: 0, max: 100 }).withMessage('Planning progress must be 0-100'),
  body('vendorBooking').optional().isInt({ min: 0, max: 100 }).withMessage('Vendor booking progress must be 0-100'),
  body('coordination').optional().isInt({ min: 0, max: 100 }).withMessage('Coordination progress must be 0-100'),
  body('execution').optional().isInt({ min: 0, max: 100 }).withMessage('Execution progress must be 0-100'),
  body('completion').optional().isInt({ min: 0, max: 100 }).withMessage('Completion progress must be 0-100'),
  validateRequest
], async (req, res) => {
  try {
    const event = await CorporateEventService.updateEventProgress(
      req.params.id,
      req.body
    );

    res.json({
      message: 'Event progress updated successfully',
      event
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/corporate/events/:id/approve-budget
// Approve event budget
router.post('/events/:id/approve-budget', [
  authCorporateConsumer,
  body('approvedBy').notEmpty().withMessage('Approver name is required'),
  body('approvalNotes').optional().isString().withMessage('Approval notes must be string'),
  validateRequest
], async (req, res) => {
  try {
    const { approvedBy, approvalNotes } = req.body;
    const event = await CorporateEventService.approveBudget(
      req.params.id,
      approvedBy,
      approvalNotes
    );

    res.json({
      message: 'Budget approved successfully',
      event
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/corporate/events/:id/feedback
// Add event feedback
router.post('/events/:id/feedback', [
  authCorporateConsumer,
  body('overallRating').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be 1-5'),
  body('vendorSatisfaction').isInt({ min: 1, max: 5 }).withMessage('Vendor satisfaction must be 1-5'),
  body('coordinatorSatisfaction').isInt({ min: 1, max: 5 }).withMessage('Coordinator satisfaction must be 1-5'),
  body('comments').optional().isString().withMessage('Comments must be string'),
  body('suggestions').optional().isString().withMessage('Suggestions must be string'),
  validateRequest
], async (req, res) => {
  try {
    const event = await CorporateEventService.addEventFeedback(
      req.params.id,
      req.body
    );

    res.json({
      message: 'Feedback submitted successfully',
      event
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/corporate/events/analytics
// Get event analytics
router.get('/events/analytics', [
  authCorporateConsumer
], async (req, res) => {
  try {
    const analytics = await CorporateEventService.getEventAnalytics(
      req.corporateConsumer._id
    );

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/corporate/events/:id
// Cancel event
router.delete('/events/:id', [
  authCorporateConsumer,
  body('reason').optional().isString().withMessage('Reason must be string'),
  validateRequest
], async (req, res) => {
  try {
    const event = await CorporateEventService.cancelEvent(
      req.params.id,
      req.body.reason || 'Cancelled by user'
    );

    res.json({
      message: 'Event cancelled successfully',
      event
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

// POST /api/corporate/admin/subscriptions/:id/assign-coordinator
// Assign coordinator to subscription (Admin only)
router.post('/admin/subscriptions/:id/assign-coordinator', [
  authAdmin,
  body('coordinatorId').isMongoId().withMessage('Invalid coordinator ID'),
  validateRequest
], async (req, res) => {
  try {
    const subscription = await CorporateSubscriptionService.assignCoordinator(
      req.params.id,
      req.body.coordinatorId
    );

    res.json({
      message: 'Coordinator assigned successfully',
      subscription
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 