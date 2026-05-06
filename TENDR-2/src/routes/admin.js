const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config');
const { authAdmin } = require('../middleware/auth');
const { Vendor } = require('../models');
const { VENDOR_STATUS } = require('../constants');
const { logger } = require('../middleware/logger');
const { body, param, validationResult } = require('express-validator');

// Admin login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (
    email === config.ADMIN_EMAIL &&
    password === config.ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { email, isAdmin: true },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN || '7d' }
    );
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid admin credentials' });
});

// Approve vendor
router.put('/vendors/:id/approve', [
  authAdmin,
  param('id').isMongoId().withMessage('Invalid vendor ID'),
  body('approvedBy').notEmpty().withMessage('Approver name is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { approvedBy } = req.body;

    // Find the vendor
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Check if vendor is in pending status
    if (vendor.status !== VENDOR_STATUS.PENDING) {
      return res.status(400).json({ 
        error: `Vendor is not in pending status. Current status: ${vendor.status}` 
      });
    }

    // Update vendor status to approved
    vendor.status = VENDOR_STATUS.APPROVED;
    vendor.approvedAt = new Date();
    vendor.approvedBy = approvedBy;
    vendor.rejectionReason = undefined; // Clear any previous rejection reason

    await vendor.save();

    logger.info(`Vendor approved: ${vendor._id}`, {
      vendorId: vendor._id,
      vendorName: vendor.name,
      serviceType: vendor.serviceType,
      approvedBy: approvedBy,
      approvedAt: vendor.approvedAt
    });

    res.json({
      success: true,
      message: 'Vendor approved successfully',
      data: {
        vendorId: vendor._id,
        name: vendor.name,
        serviceType: vendor.serviceType,
        status: vendor.status,
        approvedAt: vendor.approvedAt,
        approvedBy: vendor.approvedBy
      }
    });
  } catch (error) {
    logger.error('Error approving vendor:', error);
    res.status(500).json({ error: 'Failed to approve vendor' });
  }
});

// Reject vendor
router.put('/vendors/:id/reject', [
  authAdmin,
  param('id').isMongoId().withMessage('Invalid vendor ID'),
  body('rejectionReason').notEmpty().withMessage('Rejection reason is required'),
  body('rejectedBy').notEmpty().withMessage('Rejector name is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { rejectionReason, rejectedBy } = req.body;

    // Find the vendor
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Check if vendor is in pending status
    if (vendor.status !== VENDOR_STATUS.PENDING) {
      return res.status(400).json({ 
        error: `Vendor is not in pending status. Current status: ${vendor.status}` 
      });
    }

    // Update vendor status to rejected
    vendor.status = VENDOR_STATUS.REJECTED;
    vendor.rejectionReason = rejectionReason;
    vendor.approvedAt = undefined; // Clear approval timestamp
    vendor.approvedBy = undefined; // Clear approver

    await vendor.save();

    logger.info(`Vendor rejected: ${vendor._id}`, {
      vendorId: vendor._id,
      vendorName: vendor.name,
      serviceType: vendor.serviceType,
      rejectionReason: rejectionReason,
      rejectedBy: rejectedBy
    });

    res.json({
      success: true,
      message: 'Vendor rejected successfully',
      data: {
        vendorId: vendor._id,
        name: vendor.name,
        serviceType: vendor.serviceType,
        status: vendor.status,
        rejectionReason: vendor.rejectionReason
      }
    });
  } catch (error) {
    logger.error('Error rejecting vendor:', error);
    res.status(500).json({ error: 'Failed to reject vendor' });
  }
});

// Suspend vendor
router.put('/vendors/:id/suspend', [
  authAdmin,
  param('id').isMongoId().withMessage('Invalid vendor ID'),
  body('suspensionReason').notEmpty().withMessage('Suspension reason is required'),
  body('suspendedBy').notEmpty().withMessage('Suspender name is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { suspensionReason, suspendedBy } = req.body;

    // Find the vendor
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Check if vendor is approved (can only suspend approved vendors)
    if (vendor.status !== VENDOR_STATUS.APPROVED) {
      return res.status(400).json({ 
        error: `Can only suspend approved vendors. Current status: ${vendor.status}` 
      });
    }

    // Update vendor status to suspended
    vendor.status = VENDOR_STATUS.SUSPENDED;
    vendor.rejectionReason = suspensionReason; // Reuse rejection reason field for suspension

    await vendor.save();

    logger.info(`Vendor suspended: ${vendor._id}`, {
      vendorId: vendor._id,
      vendorName: vendor.name,
      serviceType: vendor.serviceType,
      suspensionReason: suspensionReason,
      suspendedBy: suspendedBy
    });

    res.json({
      success: true,
      message: 'Vendor suspended successfully',
      data: {
        vendorId: vendor._id,
        name: vendor.name,
        serviceType: vendor.serviceType,
        status: vendor.status,
        suspensionReason: suspensionReason
      }
    });
  } catch (error) {
    logger.error('Error suspending vendor:', error);
    res.status(500).json({ error: 'Failed to suspend vendor' });
  }
});

// Reactivate suspended vendor
router.put('/vendors/:id/reactivate', [
  authAdmin,
  param('id').isMongoId().withMessage('Invalid vendor ID'),
  body('reactivatedBy').notEmpty().withMessage('Reactivator name is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { reactivatedBy } = req.body;

    // Find the vendor
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Check if vendor is suspended
    if (vendor.status !== VENDOR_STATUS.SUSPENDED) {
      return res.status(400).json({ 
        error: `Can only reactivate suspended vendors. Current status: ${vendor.status}` 
      });
    }

    // Update vendor status back to approved
    vendor.status = VENDOR_STATUS.APPROVED;
    vendor.rejectionReason = undefined; // Clear suspension reason

    await vendor.save();

    logger.info(`Vendor reactivated: ${vendor._id}`, {
      vendorId: vendor._id,
      vendorName: vendor.name,
      serviceType: vendor.serviceType,
      reactivatedBy: reactivatedBy
    });

    res.json({
      success: true,
      message: 'Vendor reactivated successfully',
      data: {
        vendorId: vendor._id,
        name: vendor.name,
        serviceType: vendor.serviceType,
        status: vendor.status
      }
    });
  } catch (error) {
    logger.error('Error reactivating vendor:', error);
    res.status(500).json({ error: 'Failed to reactivate vendor' });
  }
});

// Get pending vendors for approval
router.get('/vendors/pending', authAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      serviceType,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query for pending vendors
    const query = { status: VENDOR_STATUS.PENDING };
    
    // Add service type filter if specified
    if (serviceType) {
      query.serviceType = serviceType;
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [vendors, totalCount] = await Promise.all([
      Vendor.find(query)
        .select('-password') // Exclude password field
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Vendor.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      vendors: vendors,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalCount: totalCount,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
        limit: limitNum
      },
      success: true
    });
  } catch (error) {
    logger.error('Error getting pending vendors:', error);
    res.status(500).json({ error: 'Failed to retrieve pending vendors' });
  }
});

// Get vendor details for admin review
router.get('/vendors/:id', [
  authAdmin,
  param('id').isMongoId().withMessage('Invalid vendor ID')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;

    // Find the vendor with all details
    const vendor = await Vendor.findById(id).select('-password');
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    logger.error('Error getting vendor details:', error);
    res.status(500).json({ error: 'Failed to retrieve vendor details' });
  }
});

module.exports = router; 