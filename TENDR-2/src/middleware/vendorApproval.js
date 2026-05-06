const { VENDOR_STATUS } = require('../constants');
const { logger } = require('./logger');

/**
 * Middleware to check if vendor is approved before allowing certain actions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkVendorApproval = (req, res, next) => {
  try {
    // Check if vendor is authenticated
    if (!req.vendor) {
      return res.status(401).json({ 
        error: 'Vendor authentication required',
        success: false 
      });
    }

    // Check if vendor is approved
    if (req.vendor.status !== VENDOR_STATUS.APPROVED) {
      const statusMessages = {
        [VENDOR_STATUS.PENDING]: 'Your vendor account is pending approval. Please wait for admin review.',
        [VENDOR_STATUS.REJECTED]: 'Your vendor account has been rejected. Please contact support for more information.',
        [VENDOR_STATUS.SUSPENDED]: 'Your vendor account is currently suspended. Please contact support for assistance.'
      };

      const message = statusMessages[req.vendor.status] || 'Your vendor account is not approved for this action.';

      logger.warn(`Vendor approval check failed: ${req.vendor._id}`, {
        vendorId: req.vendor._id,
        vendorStatus: req.vendor.status,
        action: req.method + ' ' + req.path
      });

      const error = new Error(message);
      error.statusCode = 403;
      error.name = 'BusinessLogicError';
      error.errorCode = req.vendor.status === VENDOR_STATUS.SUSPENDED ? 'VENDOR_SUSPENDED' : 'VENDOR_NOT_APPROVED';
      throw error;
    }

    // Vendor is approved, proceed
    next();
  } catch (error) {
    logger.error('Error in vendor approval middleware:', error);
    
    // If it's our custom error, pass it to error handler
    if (error.statusCode) {
      return next(error);
    }
    
    // For unexpected errors, return generic error
    res.status(500).json({ 
      error: 'Internal server error',
      success: false 
    });
  }
};

/**
 * Middleware to check if vendor can manage products (stricter check)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkVendorProductAccess = (req, res, next) => {
  try {
    // First check basic approval
    checkVendorApproval(req, res, (error) => {
      if (error) return next(error);

      // Additional checks for product management
      const allowedServiceTypes = ['GiftHamper', 'Cake'];
      if (!allowedServiceTypes.includes(req.vendor.serviceType)) {
        logger.warn(`Product access denied for service type: ${req.vendor.serviceType}`, {
          vendorId: req.vendor._id,
          serviceType: req.vendor.serviceType
        });

        return res.status(403).json({
          error: 'Product management is only available for Gift Hamper and Cake vendors',
          success: false
        });
      }

      // Check if vendor has completed required profile information
      const requiredFields = ['name', 'address', 'phoneNumber', 'gstNumber', 'panNumber'];
      const missingFields = requiredFields.filter(field => !req.vendor[field]);
      
      if (missingFields.length > 0) {
        logger.warn(`Vendor profile incomplete: ${req.vendor._id}`, {
          vendorId: req.vendor._id,
          missingFields: missingFields
        });

        return res.status(400).json({
          error: 'Please complete your vendor profile before managing products',
          missingFields: missingFields,
          success: false
        });
      }

      next();
    });
  } catch (error) {
    logger.error('Error in vendor product access middleware:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      success: false 
    });
  }
};

module.exports = {
  checkVendorApproval,
  checkVendorProductAccess
};