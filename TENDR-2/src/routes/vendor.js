const express = require('express');
const router = express.Router();
const { authVendor } = require('../middleware/auth');
const vendorService = require('../services/vendor');
const { validateRequest, vendorValidations } = require('../middleware/validator');
const { upload } = require('../config/cloudinary');
const vendorBankDetailsService = require('../services/vendorBankDetails');
const reviewService = require('../services/reviewService');
const { logger } = require('../middleware/logger');
const { checkPhoneVerified, delAsync } = require('../services/otp');
const Product = require('../models/Product');


// --- Shared constants/helpers for serviceType-specific answers ---
const ANSWER_FIELDS = {
  DJ: ['setup', 'lightsIncluded', 'eventTypes'],
  Decorator: ['venueCoverage', 'themes'],
  Photographer: ['photographersCount', 'videographersCount', 'socialMedia', 'album'],
  Caterer: ['cuisine', 'serviceStyle', 'menuType', 'beverages']
};
const enums = require('../constants');
const ANSWER_VALIDATORS = {
  setup: val => Array.isArray(val) && val.every(v => enums.DJ_SETUP_OPTIONS.includes(v)),
  lightsIncluded: val => typeof val === 'boolean',
  eventTypes: val => Array.isArray(val) && val.every(v => enums.DJ_EVENT_TYPES.includes(v)),
  venueCoverage: val => Array.isArray(val) && val.every(v => enums.DECORATOR_VENUE_COVERAGE.includes(v)),
  themes: val => Array.isArray(val) && val.every(v => enums.DECORATOR_THEMES.includes(v)),
  photographersCount: val => Number.isInteger(val) && val >= 0,
  videographersCount: val => Number.isInteger(val) && val >= 0,
  socialMedia: val => typeof val === 'boolean',
  album: val => typeof val === 'boolean',
  cuisine: val => Array.isArray(val) && val.every(v => enums.CATERER_CUISINE.includes(v)),
  serviceStyle: val => Array.isArray(val) && val.every(v => enums.CATERER_SERVICE_STYLE.includes(v)),
  menuType: val => Array.isArray(val) && val.every(v => enums.CATERER_MENU_TYPE.includes(v)),
  beverages: val => typeof val === 'boolean'
};
function pickPublicVendorFields(vendor) {
  return {
    _id: vendor._id,
    name: vendor.name,
    serviceType: vendor.serviceType,
    primaryService: vendor.serviceType,
    image: vendor.portfolioPhotos?.[0] || null,
    portfolioPhotos: vendor.portfolioPhotos,
    avgReviewScore: vendor.avgReviewScore,
    rating: vendor.avgReviewScore,
    rankingScore: vendor.rankingScore,
    yearsOfExperience: vendor.yearsOfExperience,
    locations: vendor.locations,
    city: vendor.address?.city || (vendor.locations?.[0] ?? null),
    address: vendor.address,
    teamSize: vendor.teamSize,
    eventTypes: vendor.eventTypes,
    themes: vendor.themes,
    cuisine: vendor.cuisine,
    serviceStyle: vendor.serviceStyle,
    menuType: vendor.menuType,
    beverages: vendor.beverages,
    setup: vendor.setup,
    lightsIncluded: vendor.lightsIncluded,
    venueCoverage: vendor.venueCoverage,
    photographersCount: vendor.photographersCount,
    videographersCount: vendor.videographersCount,
    socialMedia: vendor.socialMedia,
    album: vendor.album,
  };
}

// List vendors with advanced search and filters
router.get('/', async (req, res) => {
  try {
    const {
      location,
      serviceTypes,
      minExperience,
      sortBy = 'rating',
      page = 1,
      limit = 10,
      serviceFilters
    } = req.query;

    const result = await vendorService.searchVendors({
      location,
      serviceTypes,
      minExperience: minExperience ? parseInt(minExperience) : undefined,
      sortBy,
      page: parseInt(page),
      limit: parseInt(limit),
      serviceFilters: serviceFilters ? JSON.parse(serviceFilters) : undefined
    });

    const publicVendors = result.vendors.map(pickPublicVendorFields);
    res.json({ vendors: publicVendors, pagination: result.pagination });
  } catch (error) {
    logger.error('Error in vendor search:', error);
    res.status(500).json({ error: 'Failed to search vendors' });
  }
});

// Get dynamic questions for the logged-in vendor's service type
router.get('/questions', authVendor, async (req, res) => {
  try {
    const serviceType = req.vendor.serviceType;
    if (!serviceType) {
      return res.status(400).json({ error: 'Vendor serviceType not set' });
    }
    const questions = await vendorService.getQuestionsForServiceType(serviceType);
    res.json(questions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get vendor profile
router.get('/:id', async (req, res) => {
  try {
    const vendor = await vendorService.getVendorById(req.params.id);
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update vendor profile
router.patch('/:id', authVendor, vendorValidations.update, validateRequest, async (req, res) => {
  try {
    // Only allow updatable fields
    const updatableFields = [
      'name', 'gstNumber', 'teamSize', 'locations', 'totalEventsCompleted', 'maxConcurrentEvents',
      'portfolioPhotos', 'serviceType', 'phoneNumber', 'address', 'yearsOfExperience',
      'reviews', 'panNumber', 'upiId',
      'setup', 'lightsIncluded', 'eventTypes', 'venueCoverage', 'themes',
      'photographersCount', 'videographersCount', 'socialMedia', 'album',
      'cuisine', 'serviceStyle', 'menuType', 'beverages'
    ];
    const updateData = {};
    for (const key of Object.keys(req.body)) {
      if (updatableFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    }
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Handle phone number update with verification
    if (updateData.phoneNumber && updateData.phoneNumber !== req.vendor.phoneNumber) {
      const isVerified = await checkPhoneVerified(updateData.phoneNumber);
      if (!isVerified) {
        return res.status(400).json({ error: 'Phone number not verified. Please verify before updating.' });
      }
      
      // Check if new phone number already exists
      const existingVendor = await vendorService.getVendorByPhoneNumber(updateData.phoneNumber);
      if (existingVendor) {
        return res.status(400).json({ error: 'Phone number already in use by another account' });
      }
      
      // Remove verification flag from Redis
      await delAsync(`phoneVerified:vendor:${updateData.phoneNumber}`);
      
      // Set phoneVerified to true for the new number
      updateData.phoneVerified = true;
    }

    const vendor = await vendorService.updateVendor(req.params.id, updateData);
    res.json({ updated: pickPublicVendorFields(vendor) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update vendor' });
  }
});

// Add vendor portfolio photos (Cloudinary, max 10)
router.post('/:id/portfolio-photos', authVendor, upload.array('photos', 10), async (req, res) => {
  try {
    const vendor = await vendorService.addPortfolioPhotos(req.params.id, req.files);
    
    // Enhanced response for gift hamper and cake vendors
    const response = {
      _id: vendor._id,
      serviceType: vendor.serviceType,
      portfolioPhotos: vendor.portfolioPhotos,
      totalPhotos: vendor.portfolioPhotos.length,
      maxPhotos: 10,
      canAddMore: vendor.portfolioPhotos.length < 10,
      message: `Successfully uploaded ${req.files.length} portfolio photo(s)`,
      success: true
    };

    // Add service-specific tips for gift hamper and cake vendors
    if (vendor.serviceType === 'GiftHamper' && vendor.portfolioPhotos.length < 5) {
      response.tip = 'Consider adding more photos showing different hamper categories and packaging options to attract more customers.';
    } else if (vendor.serviceType === 'Cake' && vendor.portfolioPhotos.length < 5) {
      response.tip = 'Consider adding more photos showing different cake designs, sizes, and flavors to showcase your capabilities.';
    }

    res.json(response);
  } catch (error) {
    logger.error('Error uploading portfolio photos:', error);
    res.status(400).json({ 
      error: error.message || 'Failed to upload photo(s)',
      success: false 
    });
  }
});

// Remove vendor portfolio photo (Cloudinary)
router.delete('/:id/portfolio-photos/:publicId', authVendor, async (req, res) => {
  try {
    const vendor = await vendorService.removePortfolioPhoto(req.params.id, req.params.publicId);
    res.json({ 
      _id: vendor._id, 
      portfolioPhotos: vendor.portfolioPhotos,
      message: 'Portfolio photo removed successfully',
      success: true
    });
  } catch (error) {
    logger.error('Error removing portfolio photo:', error);
    res.status(400).json({ 
      error: 'Failed to remove photo',
      success: false 
    });
  }
});

// Get portfolio photos with metadata (especially useful for gift hamper and cake vendors)
router.get('/:id/portfolio-photos', async (req, res) => {
  try {
    const portfolioData = await vendorService.getPortfolioPhotosWithMetadata(req.params.id);
    res.json({
      ...portfolioData,
      success: true
    });
  } catch (error) {
    logger.error('Error getting portfolio photos:', error);
    res.status(400).json({ 
      error: 'Failed to retrieve portfolio photos',
      success: false 
    });
  }
});

// Delete vendor
router.delete('/:id', authVendor, async (req, res) => {
  try {
    const vendor = await vendorService.deleteVendor(req.params.id);
    res.json({ message: 'Vendor deleted', vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update vendor bank details
router.post('/:id/bank-details', authVendor, async (req, res) => {
  try {
    const bankDetails = await vendorBankDetailsService.createOrUpdateBankDetails(req.params.id, req.body);
    res.json(bankDetails);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get vendor bank details
router.get('/:id/bank-details', authVendor, async (req, res) => {
  try {
    const bankDetails = await vendorBankDetailsService.getBankDetailsByVendorId(req.params.id);
    if (!bankDetails) return res.status(404).json({ error: 'Bank details not found' });
    res.json(bankDetails);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Verify vendor bank details (admin only, example)
router.patch('/:id/bank-details/verify', authVendor, async (req, res) => {
  try {
    // TODO: Add admin check middleware if needed
    const bankDetails = await vendorBankDetailsService.verifyBankDetails(req.params.id);
    res.json(bankDetails);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Save vendor answers from dynamic form
router.post('/answers', authVendor, async (req, res) => {
  try {
    const serviceType = req.vendor.serviceType;
    if (!serviceType) {
      return res.status(400).json({ error: 'Vendor serviceType not set' });
    }
    const vendorId = req.vendor._id;
    const answers = req.body;
    const allowed = ANSWER_FIELDS[serviceType] || [];
    const invalidFields = Object.keys(answers).filter(key => !allowed.includes(key));
    if (invalidFields.length > 0) {
      return res.status(400).json({ error: `Invalid field(s) for ${serviceType}: ${invalidFields.join(', ')}` });
    }
    for (const key of Object.keys(answers)) {
      if (ANSWER_VALIDATORS[key] && !ANSWER_VALIDATORS[key](answers[key])) {
        return res.status(400).json({ error: `Invalid value for field: ${key}` });
      }
    }
    const vendor = await vendorService.saveVendorAnswers(vendorId, serviceType, answers);
    res.status(200).json({ updated: pickPublicVendorFields(vendor) });
  } catch (error) {
    res.status(400).json({ error: 'Failed to save answers' });
  }
});

// Get vendor's reviews (for vendor dashboard)
router.get('/:id/reviews', authVendor, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the authenticated vendor is requesting their own reviews
    if (req.vendor._id.toString() !== id) {
      return res.status(403).json({ error: 'Unauthorized to view these reviews' });
    }

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minRating
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      minRating: minRating ? parseInt(minRating) : undefined
    };

    const result = await reviewService.getVendorReviews(id, options);

    res.json({
      ...result,
      success: true
    });
  } catch (error) {
    logger.error('Error getting vendor reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

// Respond to a review (vendor only)
router.post('/reviews/:reviewId/respond', authVendor, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { responseText } = req.body;
    const vendorId = req.vendor._id;

    if (!responseText) {
      return res.status(400).json({ error: 'Response text is required' });
    }

    const review = await reviewService.addVendorResponse(reviewId, vendorId, responseText);

    res.json({
      message: 'Response added successfully',
      review: {
        _id: review._id,
        vendorResponse: review.vendorResponse
      },
      success: true
    });
  } catch (error) {
    logger.error('Error adding vendor response:', error);
    res.status(400).json({ error: error.message });
  }
});

// Register gift hamper vendor
router.post('/gift-hamper', vendorValidations.giftHamperRegistration, validateRequest, async (req, res, next) => {
  try {
    // Check if phone number is verified
    const isVerified = await checkPhoneVerified(req.body.phoneNumber);
    if (!isVerified) {
      const error = new Error('Phone number not verified. Please verify before registration.');
      error.statusCode = 400;
      error.name = 'BusinessLogicError';
      error.errorCode = 'PHONE_NOT_VERIFIED';
      throw error;
    }

    // Check for existing vendors with comprehensive error messages
    const [existingVendor, existingGstVendor, existingPanVendor] = await Promise.all([
      vendorService.getVendorByPhoneNumber(req.body.phoneNumber),
      vendorService.getVendorByGstNumber(req.body.gstNumber),
      vendorService.getVendorByPanNumber(req.body.panNumber)
    ]);

    if (existingVendor) {
      const error = new Error(`A vendor account already exists with phone number ${req.body.phoneNumber}. Please use a different phone number or contact support if this is your account.`);
      error.statusCode = 409;
      error.name = 'BusinessLogicError';
      error.errorCode = 'DUPLICATE_PHONE_NUMBER';
      throw error;
    }

    if (existingGstVendor) {
      const error = new Error(`A vendor account already exists with GST number ${req.body.gstNumber}. Each business can only have one vendor account.`);
      error.statusCode = 409;
      error.name = 'BusinessLogicError';
      error.errorCode = 'DUPLICATE_GST_NUMBER';
      throw error;
    }

    if (existingPanVendor) {
      const error = new Error(`A vendor account already exists with PAN number ${req.body.panNumber}. Each individual/business can only have one vendor account.`);
      error.statusCode = 409;
      error.name = 'BusinessLogicError';
      error.errorCode = 'DUPLICATE_PAN_NUMBER';
      throw error;
    }

    // Validate delivery areas if not pan India
    if (!req.body.panIndiaDelivery && (!req.body.deliveryAreas || req.body.deliveryAreas.length === 0)) {
      const error = new Error('Delivery areas must be specified when pan India delivery is not enabled.');
      error.statusCode = 400;
      error.name = 'FieldValidationError';
      error.field = 'deliveryAreas';
      error.fieldMessage = 'Required when panIndiaDelivery is false';
      throw error;
    }

    // Prepare vendor data with service type
    const vendorData = {
      ...req.body,
      serviceType: 'GiftHamper',
      phoneVerified: true,
      totalEventsCompleted: 0,
      maxConcurrentEvents: req.body.maxDeliveryCapacity || 10,
      portfolioPhotos: [],
      status: 'pending_approval' // Set initial status
    };

    // Create the vendor
    const vendor = await vendorService.createVendor(vendorData);

    // Remove verification flag from Redis
    await delAsync(`phoneVerified:vendor:${req.body.phoneNumber}`);

    logger.info(`Gift hamper vendor registered: ${vendor._id}`, {
      vendorId: vendor._id,
      phoneNumber: req.body.phoneNumber,
      gstNumber: req.body.gstNumber,
      serviceType: 'GiftHamper'
    });

    // Return vendor data without sensitive information
    const { password, ...vendorResponse } = vendor.toObject();
    
    res.status(201).json({
      success: true,
      message: 'Gift hamper vendor registered successfully. Your account is pending approval.',
      data: {
        vendor: vendorResponse,
        nextSteps: [
          'Your account will be reviewed within 24-48 hours',
          'You will receive a notification once approved',
          'After approval, you can start adding products and managing your profile'
        ]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error registering gift hamper vendor:', {
      error: error.message,
      phoneNumber: req.body?.phoneNumber,
      gstNumber: req.body?.gstNumber,
      errorCode: error.errorCode
    });
    next(error);
  }
});

// Register cake vendor
router.post('/cake', vendorValidations.cakeRegistration, validateRequest, async (req, res, next) => {
  try {
    // Check if phone number is verified
    const isVerified = await checkPhoneVerified(req.body.phoneNumber);
    if (!isVerified) {
      const error = new Error('Phone number not verified. Please verify before registration.');
      error.statusCode = 400;
      error.name = 'BusinessLogicError';
      error.errorCode = 'PHONE_NOT_VERIFIED';
      throw error;
    }

    // Check for existing vendors with comprehensive error messages
    const [existingVendor, existingGstVendor, existingPanVendor] = await Promise.all([
      vendorService.getVendorByPhoneNumber(req.body.phoneNumber),
      vendorService.getVendorByGstNumber(req.body.gstNumber),
      vendorService.getVendorByPanNumber(req.body.panNumber)
    ]);

    if (existingVendor) {
      const error = new Error(`A vendor account already exists with phone number ${req.body.phoneNumber}. Please use a different phone number or contact support if this is your account.`);
      error.statusCode = 409;
      error.name = 'BusinessLogicError';
      error.errorCode = 'DUPLICATE_PHONE_NUMBER';
      throw error;
    }

    if (existingGstVendor) {
      const error = new Error(`A vendor account already exists with GST number ${req.body.gstNumber}. Each business can only have one vendor account.`);
      error.statusCode = 409;
      error.name = 'BusinessLogicError';
      error.errorCode = 'DUPLICATE_GST_NUMBER';
      throw error;
    }

    if (existingPanVendor) {
      const error = new Error(`A vendor account already exists with PAN number ${req.body.panNumber}. Each individual/business can only have one vendor account.`);
      error.statusCode = 409;
      error.name = 'BusinessLogicError';
      error.errorCode = 'DUPLICATE_PAN_NUMBER';
      throw error;
    }

    // Validate pickup address if pickup is offered
    const hasPickupOption = req.body.deliveryOptions?.includes('Pickup Only') || req.body.deliveryOptions?.includes('Both');
    if (hasPickupOption && (!req.body.pickupAddress || req.body.pickupAddress.trim() === '')) {
      const error = new Error('Pickup address is required when pickup delivery option is selected.');
      error.statusCode = 400;
      error.name = 'FieldValidationError';
      error.field = 'pickupAddress';
      error.fieldMessage = 'Required when pickup option is available';
      throw error;
    }

    // Prepare vendor data with service type
    const vendorData = {
      ...req.body,
      serviceType: 'Cake',
      phoneVerified: true,
      totalEventsCompleted: 0,
      maxConcurrentEvents: 5, // Default for cake vendors
      portfolioPhotos: [],
      status: 'pending_approval' // Set initial status
    };

    // Create the vendor
    const vendor = await vendorService.createVendor(vendorData);

    // Remove verification flag from Redis
    await delAsync(`phoneVerified:vendor:${req.body.phoneNumber}`);

    logger.info(`Cake vendor registered: ${vendor._id}`, {
      vendorId: vendor._id,
      phoneNumber: req.body.phoneNumber,
      gstNumber: req.body.gstNumber,
      serviceType: 'Cake',
      availableSizes: req.body.availableSizes,
      pricesNegotiable: req.body.pricesNegotiable
    });

    // Return vendor data without sensitive information
    const { password, ...vendorResponse } = vendor.toObject();
    
    res.status(201).json({
      success: true,
      message: 'Cake vendor registered successfully. Your account is pending approval.',
      data: {
        vendor: vendorResponse,
        nextSteps: [
          'Your account will be reviewed within 24-48 hours',
          'You will receive a notification once approved',
          'After approval, you can start adding products and managing your profile',
          'Consider uploading portfolio photos to showcase your cake designs'
        ]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error registering cake vendor:', {
      error: error.message,
      phoneNumber: req.body?.phoneNumber,
      gstNumber: req.body?.gstNumber,
      errorCode: error.errorCode
    });
    next(error);
  }
});

// Get vendor's products with pagination and filtering
router.get('/:id/products', async (req, res) => {
  try {
    const vendorId = req.params.id;
    const {
      page = 1,
      limit = 10,
      status,
      productType,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { vendorId: vendorId };
    
    // Add status filter (for vendor management, allow filtering by status)
    if (status) {
      query.status = status;
    } else {
      // Default to active products for public access
      const isOwner = req.vendor && req.vendor._id.toString() === vendorId;
      if (!isOwner) {
        query.status = 'active';
      }
    }
    
    // Add product type filter
    if (productType && ['GiftHamper', 'Cake'].includes(productType)) {
      query.productType = productType;
    }
    
    // Add category filter
    if (category) {
      query.category = category;
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort = {};
    if (sortBy === 'price') {
      sort['pricing.basePrice'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'name') {
      sort.name = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Execute query with pagination
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .populate('vendorId', 'name address phoneNumber avgReviewScore')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      products: products,
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
    logger.error('Error getting vendor products:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve vendor products',
      success: false 
    });
  }
});

module.exports = router; 