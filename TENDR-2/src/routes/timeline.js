const express = require('express');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validator');
const { authConsumer } = require('../middleware/auth');
const TimelineService = require('../services/timelineService');

const router = express.Router();

// Get all timelines for the authenticated user
router.get(
  '/',
  authConsumer,
  async (req, res) => {
    try {
      const userId = req.consumer._id;
      const consumerType = req.consumerType;
      
      const timelines = await TimelineService.getUserTimelines(userId, consumerType);
      return res.status(200).json(timelines);
    } catch (error) {
      console.error('GET /timelines error:', error);
      return res.status(500).json({ 
        error: error.message,
        status: 'error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Create a new timeline
router.post(
  '/',
  authConsumer,
  [
    body('title').isString().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be 1-200 characters'),
    body('description').optional().isString().isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),
    body('eventType').optional().isIn(['wedding', 'birthday', 'corporate', 'getTogether', 'officeParty', 'concert', 'custom']).withMessage('Invalid event type'),
    body('items').optional().isArray().withMessage('Items must be an array'),
    body('linkedBookingId').optional().isMongoId().withMessage('Invalid booking ID'),
    validateRequest
  ],
  async (req, res) => {
    try {
      const userId = req.consumer._id;
      const consumerType = req.consumerType;
      const timelineData = req.body;
      
      const timeline = await TimelineService.createTimeline(userId, timelineData, consumerType);
      return res.status(201).json(timeline);
    } catch (error) {
      console.error('POST /timelines error:', error);
      return res.status(400).json({ 
        error: error.message,
        status: 'error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Get a specific timeline by ID
router.get(
  '/:id',
  authConsumer,
  [
    param('id').isMongoId().withMessage('Invalid timeline ID'),
    validateRequest
  ],
  async (req, res) => {
    try {
      const timelineId = req.params.id;
      const userId = req.consumer._id;
      const consumerType = req.consumerType;
      
      const timeline = await TimelineService.getTimelineById(timelineId, userId, consumerType);
      return res.status(200).json(timeline);
    } catch (error) {
      console.error('GET /timelines/:id error:', error);
      
      if (error.message === 'Timeline not found') {
        return res.status(404).json({ 
          error: error.message,
          status: 'error',
          timestamp: new Date().toISOString()
        });
      }
      
      if (error.message === 'Unauthorized access to timeline') {
        return res.status(403).json({ 
          error: error.message,
          status: 'error',
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(500).json({ 
        error: error.message,
        status: 'error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Update a timeline completely
router.put(
  '/:id',
  authConsumer,
  [
    param('id').isMongoId().withMessage('Invalid timeline ID'),
    body('title').optional().isString().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
    body('description').optional().isString().isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),
    body('eventType').optional().isIn(['wedding', 'birthday', 'corporate', 'getTogether', 'officeParty', 'concert', 'custom']).withMessage('Invalid event type'),
    body('items').optional().isArray().withMessage('Items must be an array'),
    body('linkedBookingId').optional().isMongoId().withMessage('Invalid booking ID'),
    validateRequest
  ],
  async (req, res) => {
    try {
      const timelineId = req.params.id;
      const userId = req.consumer._id;
      const consumerType = req.consumerType;
      const completeTimelineData = req.body;
      
      const timeline = await TimelineService.updateTimeline(timelineId, userId, completeTimelineData, consumerType);
      return res.status(200).json(timeline);
    } catch (error) {
      console.error('PUT /timelines/:id error:', error);
      
      if (error.message === 'Timeline not found') {
        return res.status(404).json({ 
          error: error.message,
          status: 'error',
          timestamp: new Date().toISOString()
        });
      }
      
      if (error.message === 'Unauthorized access to timeline') {
        return res.status(403).json({ 
          error: error.message,
          status: 'error',
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(400).json({ 
        error: error.message,
        status: 'error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Delete a timeline
router.delete(
  '/:id',
  authConsumer,
  [
    param('id').isMongoId().withMessage('Invalid timeline ID'),
    validateRequest
  ],
  async (req, res) => {
    try {
      const timelineId = req.params.id;
      const userId = req.consumer._id;
      const consumerType = req.consumerType;
      
      const result = await TimelineService.deleteTimeline(timelineId, userId, consumerType);
      return res.status(200).json(result);
    } catch (error) {
      console.error('DELETE /timelines/:id error:', error);
      
      if (error.message === 'Timeline not found') {
        return res.status(404).json({ 
          error: error.message,
          status: 'error',
          timestamp: new Date().toISOString()
        });
      }
      
      if (error.message === 'Unauthorized access to timeline') {
        return res.status(403).json({ 
          error: error.message,
          status: 'error',
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(500).json({ 
        error: error.message,
        status: 'error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

module.exports = router;