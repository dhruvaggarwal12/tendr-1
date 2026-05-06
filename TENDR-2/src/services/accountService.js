const Vendor = require('../models/Vendor');
const eventBus = require('./eventBus');

const AccountService = {
  // Suspend vendor for a given number of days
  async suspendVendor(vendorId, days, reevaluate = false) {
    try {
      const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      
      const vendor = await Vendor.findByIdAndUpdate(vendorId, {
        suspendedUntil: until,
        suspensionReevaluation: !!reevaluate,
        suspensionReason: 'Frequent cancellations',
        suspensionDate: new Date()
      }, { new: true });

      if (!vendor) {
        throw new Error('Vendor not found');
      }

      console.log(`Vendor ${vendorId} suspended until ${until}`);
      
      // Emit suspension event
      eventBus.emit('VendorSuspended', {
        vendorId,
        suspensionDays: days,
        suspensionUntil: until,
        reevaluate
      });

      return vendor;
    } catch (error) {
      console.error('AccountService.suspendVendor error:', error);
      throw new Error(`Failed to suspend vendor: ${error.message}`);
    }
  },

  // Unsuspend vendor
  async unsuspendVendor(vendorId) {
    try {
      const vendor = await Vendor.findByIdAndUpdate(vendorId, {
        suspendedUntil: null,
        suspensionReevaluation: false,
        suspensionReason: null,
        suspensionDate: null
      }, { new: true });

      if (!vendor) {
        throw new Error('Vendor not found');
      }

      console.log(`Vendor ${vendorId} unsuspended`);
      
      // Emit unsuspension event
      eventBus.emit('VendorUnsuspended', {
        vendorId,
        unsuspensionDate: new Date()
      });

      return vendor;
    } catch (error) {
      console.error('AccountService.unsuspendVendor error:', error);
      throw new Error(`Failed to unsuspend vendor: ${error.message}`);
    }
  },

  // Check if vendor is suspended
  async isSuspended(vendorId) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor || !vendor.suspendedUntil) return false;
      
      if (vendor.suspendedUntil > new Date()) return true;
      
      // Auto-unsuspend if time has passed
      await this.unsuspendVendor(vendorId);
      return false;
    } catch (error) {
      console.error('AccountService.isSuspended error:', error);
      return false;
    }
  },

  // Get vendor suspension status
  async getSuspensionStatus(vendorId) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      const isCurrentlySuspended = await this.isSuspended(vendorId);

      return {
        isSuspended: isCurrentlySuspended,
        suspendedUntil: vendor.suspendedUntil,
        suspensionReason: vendor.suspensionReason,
        suspensionDate: vendor.suspensionDate,
        suspensionReevaluation: vendor.suspensionReevaluation,
        daysRemaining: isCurrentlySuspended ? 
          Math.ceil((vendor.suspendedUntil - new Date()) / (1000 * 60 * 60 * 24)) : 0
      };
    } catch (error) {
      console.error('AccountService.getSuspensionStatus error:', error);
      throw new Error(`Failed to get suspension status: ${error.message}`);
    }
  },

  // Get all suspended vendors
  async getSuspendedVendors() {
    try {
      const now = new Date();
      const suspendedVendors = await Vendor.find({
        suspendedUntil: { $gt: now }
      }).select('_id name email phoneNumber suspendedUntil suspensionReason suspensionReevaluation');

      return suspendedVendors.map(vendor => ({
        vendorId: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phoneNumber: vendor.phoneNumber,
        suspendedUntil: vendor.suspendedUntil,
        suspensionReason: vendor.suspensionReason,
        suspensionReevaluation: vendor.suspensionReevaluation,
        daysRemaining: Math.ceil((vendor.suspendedUntil - now) / (1000 * 60 * 60 * 24))
      }));
    } catch (error) {
      console.error('AccountService.getSuspendedVendors error:', error);
      throw new Error(`Failed to get suspended vendors: ${error.message}`);
    }
  },

  // Auto-unsuspend expired suspensions (scheduled job)
  async autoUnsuspendExpired() {
    try {
      const now = new Date();
      const expiredSuspensions = await Vendor.find({
        suspendedUntil: { $lt: now, $ne: null }
      });

      const unsuspensionPromises = expiredSuspensions.map(vendor => 
        this.unsuspendVendor(vendor._id)
      );

      await Promise.all(unsuspensionPromises);

      console.log(`Auto-unsuspended ${expiredSuspensions.length} vendors`);
      return expiredSuspensions.length;
    } catch (error) {
      console.error('AccountService.autoUnsuspendExpired error:', error);
      throw new Error(`Failed to auto-unsuspend expired vendors: ${error.message}`);
    }
  },

  // Get suspension statistics
  async getSuspensionStatistics() {
    try {
      const now = new Date();
      
      const stats = await Vendor.aggregate([
        {
          $match: {
            suspendedUntil: { $gt: now }
          }
        },
        {
          $group: {
            _id: null,
            totalSuspended: { $sum: 1 },
            avgSuspensionDays: { $avg: { $ceil: { $divide: [{ $subtract: ['$suspendedUntil', now] }, 1000 * 60 * 60 * 24] } } },
            reevaluationCount: { $sum: { $cond: ['$suspensionReevaluation', 1, 0] } }
          }
        }
      ]);

      return stats[0] || { totalSuspended: 0, avgSuspensionDays: 0, reevaluationCount: 0 };
    } catch (error) {
      console.error('AccountService.getSuspensionStatistics error:', error);
      return { totalSuspended: 0, avgSuspensionDays: 0, reevaluationCount: 0 };
    }
  }
};

module.exports = AccountService; 