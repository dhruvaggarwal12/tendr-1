const { Timeline } = require('../models');

const TimelineService = {
  // Create a new timeline
  async createTimeline(userId, timelineData, consumerType = 'INDIVIDUAL') {
    try {
      const data = {
        title: timelineData.title,
        description: timelineData.description,
        eventType: timelineData.eventType || 'custom',
        items: timelineData.items || [],
        linkedBookingId: timelineData.linkedBookingId
      };

      // Set the appropriate user field based on consumer type
      if (consumerType === 'CORPORATE') {
        data.corporateUserId = userId;
      } else {
        data.userId = userId;
      }

      const timeline = await Timeline.create(data);
      return timeline;
    } catch (error) {
      console.error('TimelineService.createTimeline error:', error);
      
      // Handle specific MongoDB errors
      if (error.name === 'ValidationError') {
        throw new Error(`Validation failed: ${Object.values(error.errors).map(e => e.message).join(', ')}`);
      }
      
      if (error.code === 11000) {
        throw new Error('Timeline with this data already exists');
      }
      
      if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
        throw new Error('Database connection error. Please try again later.');
      }
      
      throw new Error(`Failed to create timeline: ${error.message}`);
    }
  },

  // Get all timelines for a user
  async getUserTimelines(userId, consumerType = 'INDIVIDUAL') {
    try {
      const query = consumerType === 'CORPORATE' 
        ? { corporateUserId: userId }
        : { userId: userId };

      const timelines = await Timeline.find(query)
        .sort({ createdAt: -1 })
        .populate('linkedBookingId', 'schedule totalAmount status');
      
      return timelines;
    } catch (error) {
      console.error('TimelineService.getUserTimelines error:', error);
      throw new Error(`Failed to get user timelines: ${error.message}`);
    }
  },

  // Get a specific timeline by ID
  async getTimelineById(timelineId, userId, consumerType = 'INDIVIDUAL') {
    try {
      const timeline = await Timeline.findById(timelineId)
        .populate('linkedBookingId', 'schedule totalAmount status');
      
      if (!timeline) {
        throw new Error('Timeline not found');
      }

      // Check authorization based on consumer type
      const isAuthorized = consumerType === 'CORPORATE' 
        ? timeline.corporateUserId && timeline.corporateUserId.toString() === userId.toString()
        : timeline.userId && timeline.userId.toString() === userId.toString();
      
      if (!isAuthorized) {
        throw new Error('Unauthorized access to timeline');
      }

      return timeline;
    } catch (error) {
      console.error('TimelineService.getTimelineById error:', error);
      throw new Error(`Failed to get timeline: ${error.message}`);
    }
  },

  // Update a timeline completely
  async updateTimeline(timelineId, userId, completeTimelineData, consumerType = 'INDIVIDUAL') {
    try {
      const timeline = await Timeline.findById(timelineId);
      
      if (!timeline) {
        throw new Error('Timeline not found');
      }

      // Check authorization based on consumer type
      const isAuthorized = consumerType === 'CORPORATE' 
        ? timeline.corporateUserId && timeline.corporateUserId.toString() === userId.toString()
        : timeline.userId && timeline.userId.toString() === userId.toString();
      
      if (!isAuthorized) {
        throw new Error('Unauthorized access to timeline');
      }

      // Update fields
      timeline.title = completeTimelineData.title || timeline.title;
      timeline.description = completeTimelineData.description;
      timeline.eventType = completeTimelineData.eventType || timeline.eventType;
      timeline.items = completeTimelineData.items || [];
      timeline.linkedBookingId = completeTimelineData.linkedBookingId;

      const updatedTimeline = await timeline.save();
      return updatedTimeline;
    } catch (error) {
      console.error('TimelineService.updateTimeline error:', error);
      
      // Handle specific MongoDB errors
      if (error.name === 'ValidationError') {
        throw new Error(`Validation failed: ${Object.values(error.errors).map(e => e.message).join(', ')}`);
      }
      
      if (error.name === 'CastError') {
        throw new Error('Invalid timeline ID format');
      }
      
      if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
        throw new Error('Database connection error. Please try again later.');
      }
      
      throw new Error(`Failed to update timeline: ${error.message}`);
    }
  },

  // Delete a timeline
  async deleteTimeline(timelineId, userId, consumerType = 'INDIVIDUAL') {
    try {
      const timeline = await Timeline.findById(timelineId);
      
      if (!timeline) {
        throw new Error('Timeline not found');
      }

      // Check authorization based on consumer type
      const isAuthorized = consumerType === 'CORPORATE' 
        ? timeline.corporateUserId && timeline.corporateUserId.toString() === userId.toString()
        : timeline.userId && timeline.userId.toString() === userId.toString();
      
      if (!isAuthorized) {
        throw new Error('Unauthorized access to timeline');
      }

      await Timeline.findByIdAndDelete(timelineId);
      return { message: 'Timeline deleted successfully' };
    } catch (error) {
      console.error('TimelineService.deleteTimeline error:', error);
      throw new Error(`Failed to delete timeline: ${error.message}`);
    }
  }
};

module.exports = TimelineService;