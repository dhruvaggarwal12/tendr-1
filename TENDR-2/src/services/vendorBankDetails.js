const { VendorBankDetails } = require('../models');

const vendorBankDetailsService = {
  // Create or update bank details for a vendor
  async createOrUpdateBankDetails(vendorId, data) {
    return VendorBankDetails.findOneAndUpdate(
      { vendorId },
      { $set: { ...data, vendorId } },
      { upsert: true, new: true, runValidators: true }
    );
  },

  // Get bank details by vendorId
  async getBankDetailsByVendorId(vendorId) {
    return VendorBankDetails.findOne({ vendorId });
  },

  // Mark bank details as verified
  async verifyBankDetails(vendorId) {
    return VendorBankDetails.findOneAndUpdate(
      { vendorId },
      { $set: { bankVerified: true } },
      { new: true }
    );
  }
};

module.exports = vendorBankDetailsService; 