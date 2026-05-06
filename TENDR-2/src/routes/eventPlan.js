const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const EventPlan = require('../models/EventPlan');
const Request = require('../models/Request');
const { authConsumer } = require('../middleware/auth');
const { SUPPORTED_CITIES, SERVICE_TYPES } = require('../constants');

const validate = (rules) => async (req, res, next) => {
  await Promise.all(rules.map((r) => r.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const planRules = [
  body('bookingType').isIn(['you-do-it', 'let-us-do-it']).withMessage('Invalid booking type'),
  body('eventName').trim().notEmpty().withMessage('Event name is required'),
  body('eventType').trim().notEmpty().withMessage('Event type is required'),
  body('guests').trim().notEmpty().withMessage('Guest count is required'),
  body('budget').trim().notEmpty().withMessage('Budget is required'),
  body('location').isIn(SUPPORTED_CITIES).withMessage('Unsupported city'),
  body('date').trim().notEmpty().withMessage('Event date is required'),
];

// POST /event-plans — save event plan + create requests for finalised vendors
router.post('/', authConsumer, validate(planRules), async (req, res) => {
  try {
    const {
      bookingType,
      eventName, eventType, guests, budget, location, date, additionalInfo,
      selectedServices = [],
      finalisedVendors = {},   // { Caterer: vendorId, DJ: vendorId }
    } = req.body;

    const customerId = req.consumer._id;

    // Save the event plan
    const plan = await EventPlan.create({
      customerId,
      bookingType,
      eventName, eventType, guests, budget, location, date,
      additionalInfo: additionalInfo || '',
      selectedServices,
      finalisedVendors,
      status: 'submitted',
    });

    // Create a Request for each finalised vendor
    const requestDocs = [];
    for (const [serviceType, vendorId] of Object.entries(finalisedVendors)) {
      if (!vendorId) continue;
      const req_ = await Request.create({
        customerId,
        vendorId,
        eventPlanId: plan._id,
        serviceType,
        bookingType,
        eventName, eventType,
        guestCount: guests,
        budget, location,
        eventDate: date,
        additionalInfo,
        status: 'PENDING',
      });
      requestDocs.push(req_);
    }

    return res.status(201).json({
      message: 'Event plan saved successfully.',
      eventPlan: plan,
      requests: requestDocs,
    });
  } catch (err) {
    console.error('EventPlan create error:', err);
    return res.status(500).json({ message: 'Failed to save event plan.' });
  }
});

// GET /event-plans — get all plans for the logged-in customer
router.get('/', authConsumer, async (req, res) => {
  try {
    const plans = await EventPlan.find({ customerId: req.consumer._id })
      .sort({ createdAt: -1 })
      .populate('finalisedVendors');
    return res.json({ plans });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch event plans.' });
  }
});

// GET /event-plans/:id — single plan with requests
router.get('/:id', authConsumer, async (req, res) => {
  try {
    const plan = await EventPlan.findOne({
      _id: req.params.id,
      customerId: req.consumer._id,
    });
    if (!plan) return res.status(404).json({ message: 'Event plan not found.' });

    const requests = await Request.find({ eventPlanId: plan._id })
      .populate('vendorId', 'name serviceType portfolioPhotos avgReviewScore');

    return res.json({ plan, requests });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch event plan.' });
  }
});

module.exports = router;
