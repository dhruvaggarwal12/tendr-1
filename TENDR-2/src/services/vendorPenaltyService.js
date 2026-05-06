const VendorPenalty = require('../models/VendorPenalty');
const PolicyEngine = require('./policyEngine');
const eventBus = require('./eventBus');

const VendorPenaltyService = {
  // Track a new cancellation for a vendor and enforce penalty
  async recordCancellation(vendorId) {
    try {
      const now = new Date();
      const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      
      let penalty = await VendorPenalty.findOne({ 
        vendorId, 
        windowStart: { $gte: windowStart } 
      });

      if (!penalty) {
        penalty = await VendorPenalty.create({
          vendorId,
          windowStart: now,
          cancellationCount: 1,
          penaltyType: 'WARNING',
          effectiveUntil: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        });
      } else {
        penalty.cancellationCount += 1;
        
        // Use centralized PolicyEngine for penalty calculation
        const penaltyInfo = PolicyEngine.calculateVendorPenalty(penalty.cancellationCount);
        
        penalty.penaltyType = penaltyInfo.type;
        penalty.effectiveUntil = new Date(now.getTime() + penaltyInfo.duration * 24 * 60 * 60 * 1000);
        
        await penalty.save();

        // Only emit penalty event if vendor should be penalized
        if (PolicyEngine.shouldPenalizeVendor(penalty.cancellationCount)) {
          eventBus.emit('VendorPenalized', {
            vendorId,
            type: penaltyInfo.type,
            amount: penaltyInfo.ratingReduction || penaltyInfo.commissionIncrease,
            orders: penaltyInfo.orders,
            days: penaltyInfo.suspensionDays,
            reevaluate: penaltyInfo.reevaluate
          });
        }
      }

      return penalty;
    } catch (error) {
      console.error('VendorPenaltyService.recordCancellation error:', error);
      throw new Error(`Failed to record cancellation: ${error.message}`);
    }
  },

  // Get vendor penalty status
  async getVendorPenaltyStatus(vendorId) {
    try {
      const now = new Date();
      const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      
      const penalty = await VendorPenalty.findOne({ 
        vendorId, 
        windowStart: { $gte: windowStart } 
      });

      if (!penalty) {
        return {
          hasPenalty: false,
          cancellationCount: 0,
          penaltyType: null,
          effectiveUntil: null
        };
      }

      return {
        hasPenalty: penalty.effectiveUntil > now,
        cancellationCount: penalty.cancellationCount,
        penaltyType: penalty.penaltyType,
        effectiveUntil: penalty.effectiveUntil,
        isActive: penalty.effectiveUntil > now
      };
    } catch (error) {
      console.error('VendorPenaltyService.getVendorPenaltyStatus error:', error);
      throw new Error(`Failed to get penalty status: ${error.message}`);
    }
  },

  // Reset penalties (scheduled job)
  async resetPenalties() {
    try {
      const now = new Date();
      const expiredPenalties = await VendorPenalty.find({
        effectiveUntil: { $lt: now }
      });

      for (const penalty of expiredPenalties) {
        penalty.penaltyType = 'EXPIRED';
        await penalty.save();
      }

      console.log(`Reset ${expiredPenalties.length} expired penalties`);
      return expiredPenalties.length;
    } catch (error) {
      console.error('VendorPenaltyService.resetPenalties error:', error);
      throw new Error(`Failed to reset penalties: ${error.message}`);
    }
  },

  // Get penalty statistics
  async getPenaltyStatistics() {
    try {
      const now = new Date();
      const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      
      const stats = await VendorPenalty.aggregate([
        {
          $match: {
            windowStart: { $gte: windowStart }
          }
        },
        {
          $group: {
            _id: '$penaltyType',
            count: { $sum: 1 },
            avgCancellations: { $avg: '$cancellationCount' }
          }
        }
      ]);

      return stats;
    } catch (error) {
      console.error('VendorPenaltyService.getPenaltyStatistics error:', error);
      throw new Error(`Failed to get penalty statistics: ${error.message}`);
    }
  }
};

module.exports = VendorPenaltyService; 