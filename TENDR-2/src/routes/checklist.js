const express = require('express');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validator');
const { authConsumer } = require('../middleware/auth');
const ChecklistService = require('../services/checklistService');

const router = express.Router();

// Get all checklists for the authenticated user
router.get(
  '/',
  authConsumer,
  async (req, res) => {
    try {
      const userId = req.consumer._id;
      const consumerType = req.consumerType;
      
      const checklists = await ChecklistService.getUserChecklists(userId, consumerType);
      return res.status(200).json(checklists);
    } catch (error) {
      console.error('GET /checklists error:', error);
      return res.status(500).json({ 
        error: error.message,
        status: 'error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Create a new checklist
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
      const checklistData = req.body;
      
      const checklist = await ChecklistService.createChecklist(userId, checklistData, consumerType);
      return res.status(201).json(checklist);
    } catch (error) {
      console.error('POST /checklists error:', error);
      return res.status(400).json({ 
        error: error.message,
        status: 'error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Get a specific checklist by ID
router.get(
  '/:id',
  authConsumer,
  [
    param('id').isMongoId().withMessage('Invalid checklist ID'),
    validateRequest
  ],
  async (req, res) => {
    try {
      const checklistId = req.params.id;
      const userId = req.consumer._id;
      const consumerType = req.consumerType;
      
      const checklist = await ChecklistService.getChecklistById(checklistId, userId, consumerType);
      return res.status(200).json(checklist);
    } catch (error) {
      console.error('GET /checklists/:id error:', error);
      
      if (error.message === 'Checklist not found') {
        return res.status(404).json({ 
          error: error.message,
          status: 'error',
          timestamp: new Date().toISOString()
        });
      }
      
      if (error.message === 'Unauthorized access to checklist') {
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

// Update a checklist completely
router.put(
  '/:id',
  authConsumer,
  [
    param('id').isMongoId().withMessage('Invalid checklist ID'),
    body('title').optional().isString().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
    body('description').optional().isString().isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),
    body('eventType').optional().isIn(['wedding', 'birthday', 'corporate', 'getTogether', 'officeParty', 'concert', 'custom']).withMessage('Invalid event type'),
    body('items').optional().isArray().withMessage('Items must be an array'),
    body('linkedBookingId').optional().isMongoId().withMessage('Invalid booking ID'),
    validateRequest
  ],
  async (req, res) => {
    try {
      const checklistId = req.params.id;
      const userId = req.consumer._id;
      const consumerType = req.consumerType;
      const completeChecklistData = req.body;
      
      const checklist = await ChecklistService.updateChecklist(checklistId, userId, completeChecklistData, consumerType);
      return res.status(200).json(checklist);
    } catch (error) {
      console.error('PUT /checklists/:id error:', error);
      
      if (error.message === 'Checklist not found') {
        return res.status(404).json({ 
          error: error.message,
          status: 'error',
          timestamp: new Date().toISOString()
        });
      }
      
      if (error.message === 'Unauthorized access to checklist') {
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

// Delete a checklist
router.delete(
  '/:id',
  authConsumer,
  [
    param('id').isMongoId().withMessage('Invalid checklist ID'),
    validateRequest
  ],
  async (req, res) => {
    try {
      const checklistId = req.params.id;
      const userId = req.consumer._id;
      const consumerType = req.consumerType;
      
      const result = await ChecklistService.deleteChecklist(checklistId, userId, consumerType);
      return res.status(200).json(result);
    } catch (error) {
      console.error('DELETE /checklists/:id error:', error);
      
      if (error.message === 'Checklist not found') {
        return res.status(404).json({ 
          error: error.message,
          status: 'error',
          timestamp: new Date().toISOString()
        });
      }
      
      if (error.message === 'Unauthorized access to checklist') {
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