const { Checklist } = require('../models');

const ChecklistService = {
  // Create a new checklist
  async createChecklist(userId, checklistData, consumerType = 'INDIVIDUAL') {
    try {
      const data = {
        title: checklistData.title,
        description: checklistData.description,
        eventType: checklistData.eventType || 'custom',
        items: checklistData.items || [],
        linkedBookingId: checklistData.linkedBookingId
      };

      // Set the appropriate user field based on consumer type
      if (consumerType === 'CORPORATE') {
        data.corporateUserId = userId;
      } else {
        data.userId = userId;
      }

      const checklist = await Checklist.create(data);
      return checklist;
    } catch (error) {
      console.error('ChecklistService.createChecklist error:', error);
      
      // Handle specific MongoDB errors
      if (error.name === 'ValidationError') {
        throw new Error(`Validation failed: ${Object.values(error.errors).map(e => e.message).join(', ')}`);
      }
      
      if (error.code === 11000) {
        throw new Error('Checklist with this data already exists');
      }
      
      if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
        throw new Error('Database connection error. Please try again later.');
      }
      
      throw new Error(`Failed to create checklist: ${error.message}`);
    }
  },

  // Get all checklists for a user
  async getUserChecklists(userId, consumerType = 'INDIVIDUAL') {
    try {
      const query = consumerType === 'CORPORATE' 
        ? { corporateUserId: userId }
        : { userId: userId };

      const checklists = await Checklist.find(query)
        .sort({ createdAt: -1 })
        .populate('linkedBookingId', 'schedule totalAmount status');
      
      return checklists;
    } catch (error) {
      console.error('ChecklistService.getUserChecklists error:', error);
      throw new Error(`Failed to get user checklists: ${error.message}`);
    }
  },

  // Get a specific checklist by ID
  async getChecklistById(checklistId, userId, consumerType = 'INDIVIDUAL') {
    try {
      const checklist = await Checklist.findById(checklistId)
        .populate('linkedBookingId', 'schedule totalAmount status');
      
      if (!checklist) {
        throw new Error('Checklist not found');
      }

      // Check authorization based on consumer type
      const isAuthorized = consumerType === 'CORPORATE' 
        ? checklist.corporateUserId && checklist.corporateUserId.toString() === userId.toString()
        : checklist.userId && checklist.userId.toString() === userId.toString();
      
      if (!isAuthorized) {
        throw new Error('Unauthorized access to checklist');
      }

      return checklist;
    } catch (error) {
      console.error('ChecklistService.getChecklistById error:', error);
      throw new Error(`Failed to get checklist: ${error.message}`);
    }
  },

  // Update a checklist completely
  async updateChecklist(checklistId, userId, completeChecklistData, consumerType = 'INDIVIDUAL') {
    try {
      const checklist = await Checklist.findById(checklistId);
      
      if (!checklist) {
        throw new Error('Checklist not found');
      }

      // Check authorization based on consumer type
      const isAuthorized = consumerType === 'CORPORATE' 
        ? checklist.corporateUserId && checklist.corporateUserId.toString() === userId.toString()
        : checklist.userId && checklist.userId.toString() === userId.toString();
      
      if (!isAuthorized) {
        throw new Error('Unauthorized access to checklist');
      }

      // Update fields
      checklist.title = completeChecklistData.title || checklist.title;
      checklist.description = completeChecklistData.description;
      checklist.eventType = completeChecklistData.eventType || checklist.eventType;
      checklist.items = completeChecklistData.items || [];
      checklist.linkedBookingId = completeChecklistData.linkedBookingId;

      const updatedChecklist = await checklist.save();
      return updatedChecklist;
    } catch (error) {
      console.error('ChecklistService.updateChecklist error:', error);
      
      // Handle specific MongoDB errors
      if (error.name === 'ValidationError') {
        throw new Error(`Validation failed: ${Object.values(error.errors).map(e => e.message).join(', ')}`);
      }
      
      if (error.name === 'CastError') {
        throw new Error('Invalid checklist ID format');
      }
      
      if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
        throw new Error('Database connection error. Please try again later.');
      }
      
      throw new Error(`Failed to update checklist: ${error.message}`);
    }
  },

  // Delete a checklist
  async deleteChecklist(checklistId, userId, consumerType = 'INDIVIDUAL') {
    try {
      const checklist = await Checklist.findById(checklistId);
      
      if (!checklist) {
        throw new Error('Checklist not found');
      }

      // Check authorization based on consumer type
      const isAuthorized = consumerType === 'CORPORATE' 
        ? checklist.corporateUserId && checklist.corporateUserId.toString() === userId.toString()
        : checklist.userId && checklist.userId.toString() === userId.toString();
      
      if (!isAuthorized) {
        throw new Error('Unauthorized access to checklist');
      }

      await Checklist.findByIdAndDelete(checklistId);
      return { message: 'Checklist deleted successfully' };
    } catch (error) {
      console.error('ChecklistService.deleteChecklist error:', error);
      throw new Error(`Failed to delete checklist: ${error.message}`);
    }
  }
};

module.exports = ChecklistService;