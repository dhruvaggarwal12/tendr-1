const eventBus = require('./eventBus');

// In-memory store for demo; replace with DB in production
const vendorCommissionMap = new Map();

const CommissionService = {
  // Increase commission for next N orders
  async increaseCommission(vendorId, amount, orders) {
    try {
      vendorCommissionMap.set(vendorId, {
        amount,
        ordersLeft: orders,
        appliedAt: new Date(),
        originalCommission: 0 // TODO: Get from vendor profile
      });

      console.log(`Commission increased for vendor ${vendorId}: ${amount * 100}% for ${orders} orders`);
      return true;
    } catch (error) {
      console.error('CommissionService.increaseCommission error:', error);
      throw new Error(`Failed to increase commission: ${error.message}`);
    }
  },

  // Get current commission for a vendor
  getCommission(vendorId) {
    try {
      const entry = vendorCommissionMap.get(vendorId);
      if (entry && entry.ordersLeft > 0) {
        entry.ordersLeft -= 1;
        if (entry.ordersLeft === 0) {
          vendorCommissionMap.delete(vendorId);
          console.log(`Commission penalty completed for vendor ${vendorId}`);
        }
        return entry.amount;
      }
      return 0; // default commission increase is 0
    } catch (error) {
      console.error('CommissionService.getCommission error:', error);
      return 0;
    }
  },

  // Get commission status for a vendor
  getCommissionStatus(vendorId) {
    try {
      const entry = vendorCommissionMap.get(vendorId);
      if (!entry) {
        return {
          hasPenalty: false,
          commissionIncrease: 0,
          ordersLeft: 0
        };
      }

      return {
        hasPenalty: entry.ordersLeft > 0,
        commissionIncrease: entry.amount,
        ordersLeft: entry.ordersLeft,
        appliedAt: entry.appliedAt
      };
    } catch (error) {
      console.error('CommissionService.getCommissionStatus error:', error);
      return { hasPenalty: false, commissionIncrease: 0, ordersLeft: 0 };
    }
  },

  // Reset commission penalties (scheduled job)
  async resetCommissionPenalties() {
    try {
      const now = new Date();
      const expiredPenalties = [];

      for (const [vendorId, entry] of vendorCommissionMap.entries()) {
        // Reset penalties older than 30 days
        const daysSinceApplied = (now - entry.appliedAt) / (1000 * 60 * 60 * 24);
        if (daysSinceApplied > 30) {
          expiredPenalties.push(vendorId);
        }
      }

      expiredPenalties.forEach(vendorId => {
        vendorCommissionMap.delete(vendorId);
      });

      console.log(`Reset ${expiredPenalties.length} expired commission penalties`);
      return expiredPenalties.length;
    } catch (error) {
      console.error('CommissionService.resetCommissionPenalties error:', error);
      throw new Error(`Failed to reset commission penalties: ${error.message}`);
    }
  },

  // Get commission statistics
  getCommissionStatistics() {
    try {
      const stats = {
        totalPenalties: vendorCommissionMap.size,
        totalOrdersAffected: 0,
        averageCommissionIncrease: 0
      };

      let totalIncrease = 0;
      let totalOrders = 0;

      for (const entry of vendorCommissionMap.values()) {
        totalIncrease += entry.amount;
        totalOrders += entry.ordersLeft;
      }

      if (vendorCommissionMap.size > 0) {
        stats.averageCommissionIncrease = totalIncrease / vendorCommissionMap.size;
        stats.totalOrdersAffected = totalOrders;
      }

      return stats;
    } catch (error) {
      console.error('CommissionService.getCommissionStatistics error:', error);
      return { totalPenalties: 0, totalOrdersAffected: 0, averageCommissionIncrease: 0 };
    }
  }
};

module.exports = CommissionService; 