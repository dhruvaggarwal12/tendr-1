const { Vendor } = require('../models');
const { logger } = require('../middleware/logger');
const { cloudinary } = require('../config/cloudinary');
const {
  SERVICE_TYPES,
  DJ_SETUP_OPTIONS,
  DECORATOR_VENUE_COVERAGE,
  DECORATOR_THEMES,
  DJ_EVENT_TYPES,
  CATERER_CUISINE,
  CATERER_SERVICE_STYLE,
  CATERER_MENU_TYPE,
  SUPPORTED_CITIES
} = require('../constants');
const { buildVendorLocationQuery, isSupportedCity } = require('../utils/location');

const vendorService = {
  // Create a new vendor
  async createVendor(vendorData) {
    try {
      const vendor = await Vendor.create(vendorData);
      logger.info(`New vendor created: ${vendor._id}`);
      return vendor;
    } catch (error) {
      logger.error(`Error creating vendor: ${error.message}`);
      throw new Error(`Error creating vendor: ${error.message}`);
    }
  },

  // Get vendor by ID
  async getVendorById(vendorId) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) throw new Error('Vendor not found');
      return vendor;
    } catch (error) {
      logger.error(`Error fetching vendor: ${error.message}`);
      throw new Error(`Error fetching vendor: ${error.message}`);
    }
  },

  // Update vendor by ID (only allowed fields)
  async updateVendor(vendorId, updates) {
    try {
      // Only allow updates to fields present in the schema
      const allowedUpdates = [
        'name', 'gstNumber', 'teamSize', 'locations', 'servicesOffered',
        'totalEventsCompleted', 'maxConcurrentEvents', 'portfolioPhotos',
        'serviceType', 'phoneNumber', 'address',
        'yearsOfExperience', 'reviews', 'upiId',
        'panNumber',
        'setup', 'lightsIncluded', 'eventTypes',
        'venueCoverage', 'themes',
        'photographersCount', 'videographersCount', 'socialMedia', 'album',
        'cuisine', 'serviceStyle', 'menuType', 'beverages'
      ];
      const isValid = Object.keys(updates).every(key => allowedUpdates.includes(key));
      if (!isValid) throw new Error('Invalid updates');
      const vendor = await Vendor.findByIdAndUpdate(
        vendorId,
        { $set: updates },
        { new: true, runValidators: true }
      );
      if (!vendor) throw new Error('Vendor not found');
      logger.info(`Vendor updated: ${vendorId}`);
      return vendor;
    } catch (error) {
      logger.error(`Error updating vendor: ${error.message}`);
      throw new Error(`Error updating vendor: ${error.message}`);
    }
  },

  // Delete vendor by ID
  async deleteVendor(vendorId) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) throw new Error('Vendor not found');
      // Delete all portfolio photos from Cloudinary
      if (vendor.portfolioPhotos && vendor.portfolioPhotos.length > 0) {
        for (const url of vendor.portfolioPhotos) {
          // Extract publicId from the URL (Cloudinary format)
          const match = url.match(/\/([^\/]+)\.[a-zA-Z]+$/);
          if (match && match[1]) {
            const publicId = `vendor_images/${match[1]}`;
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (err) {
              logger.error(`Failed to delete Cloudinary image ${publicId}: ${err.message}`);
            }
          }
        }
      }
      // Now delete the vendor document
      await Vendor.findByIdAndDelete(vendorId);
      logger.info(`Vendor deleted: ${vendorId}`);
      return vendor;
    } catch (error) {
      logger.error(`Error deleting vendor: ${error.message}`);
      throw new Error('Error deleting vendor. Please try again later.');
    }
  },

  // Add portfolio photos (Cloudinary URLs, max 10)
  async addPortfolioPhotos(vendorId, files) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) throw new Error('Vendor not found');
      if (!files || files.length === 0) throw new Error('No files uploaded');
      if ((vendor.portfolioPhotos.length + files.length) > 10) {
        throw new Error('Cannot upload more than 10 portfolio photos');
      }

      // Validate file types for gift hamper and cake vendors
      if (['GiftHamper', 'Cake'].includes(vendor.serviceType)) {
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const invalidFiles = files.filter(file => !validImageTypes.includes(file.mimetype));
        
        if (invalidFiles.length > 0) {
          throw new Error('Invalid file type. Gift hamper and cake vendors can only upload JPEG, PNG, or WebP images.');
        }

        // Additional validation for image quality (file size already handled by multer)
        const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024); // 5MB
        if (oversizedFiles.length > 0) {
          throw new Error('Image file size too large. Maximum 5MB per image.');
        }
      }

      const urls = files.map(file => file.path);
      vendor.portfolioPhotos.push(...urls);
      await vendor.save();

      // Update vendor ranking score as portfolio affects ranking
      await vendor.updateScores();

      logger.info(`Added ${files.length} portfolio photos for ${vendor.serviceType} vendor: ${vendorId}`);
      return vendor;
    } catch (error) {
      logger.error(`Error adding portfolio photos: ${error.message}`);
      // Never expose sensitive error details to the client
      throw new Error('Error uploading photo(s). Please try again later.');
    }
  },

  // Remove a portfolio photo by its Cloudinary publicId
  async removePortfolioPhoto(vendorId, publicId) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) throw new Error('Vendor not found');
      
      // Find the photo to remove
      const photoToRemove = vendor.portfolioPhotos.find(url => url.includes(publicId));
      if (!photoToRemove) {
        throw new Error('Portfolio photo not found');
      }

      // Remove from Cloudinary
      await cloudinary.uploader.destroy(publicId);
      
      // Remove from DB
      vendor.portfolioPhotos = vendor.portfolioPhotos.filter(url => !url.includes(publicId));
      await vendor.save();

      // Update vendor ranking score as portfolio affects ranking
      await vendor.updateScores();

      logger.info(`Removed portfolio photo for ${vendor.serviceType} vendor: ${vendorId}`);
      return vendor;
    } catch (error) {
      logger.error(`Error removing portfolio photo: ${error.message}`);
      // Never expose sensitive error details to the client
      throw new Error('Error removing photo. Please try again later.');
    }
  },

  /**
   * Save vendor answers from dynamic form.
   * @param {string} vendorId
   * @param {string} serviceType
   * @param {object} answers
   * @returns {object} vendor
   */
  async saveVendorAnswers(vendorId, serviceType, answers) {
    if (!SERVICE_TYPES.includes(serviceType)) {
      throw new Error('Invalid service type');
    }
    // Only update fields relevant to the serviceType
    const allowedUpdates = [
      // DJ
      'setup', 'lightsIncluded', 'eventTypes',
      // Decorator
      'venueCoverage', 'themes',
      // Photographer
      'photographersCount', 'videographersCount', 'socialMedia', 'album',
      // Caterer
      'cuisine', 'serviceStyle', 'menuType', 'beverages'
    ];
    const updates = {};
    for (const key of Object.keys(answers)) {
      if (allowedUpdates.includes(key)) {
        updates[key] = answers[key];
      }
    }
    // Also update serviceType if provided
    updates.serviceType = serviceType;
    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!vendor) throw new Error('Vendor not found');
    logger.info(`Vendor answers updated: ${vendorId}`);
    return vendor;
  },

  /**
   * Returns dynamic questions for a given service type.
   * @param {string} serviceType
   * @returns {Array} questions
   */
  async getQuestionsForServiceType(serviceType) {
    if (!SERVICE_TYPES.includes(serviceType)) {
      throw new Error('Invalid service type');
    }

    let serviceQuestions = [];
    switch (serviceType) {
      case 'DJ':
        serviceQuestions = [
          { field: 'setup', question: 'What type of DJ setup do you require?', type: 'dropdown[]', options: DJ_SETUP_OPTIONS },
          { field: 'lightsIncluded', question: 'Should lights be included?', type: 'boolean' },
          { field: 'eventTypes', question: 'What event types do you cover?', type: 'dropdown[]', options: DJ_EVENT_TYPES }
        ];
        break;
      case 'Decorator':
        serviceQuestions = [
          { field: 'venueCoverage', question: 'What type of venue coverage?', type: 'dropdown[]', options: DECORATOR_VENUE_COVERAGE },
          { field: 'themes', question: 'Which decoration themes do you offer?', type: 'dropdown[]', options: DECORATOR_THEMES }
        ];
        break;
      case 'Photographer':
        serviceQuestions = [
          { field: 'photographersCount', question: 'How many photographers?', type: 'number' },
          { field: 'videographersCount', question: 'How many videographers?', type: 'number' },
          { field: 'socialMedia', question: 'Do you provide social media coverage?', type: 'boolean' },
          { field: 'album', question: 'Is an album included?', type: 'boolean' }
        ];
        break;
      case 'Caterer':
        serviceQuestions = [
          { field: 'cuisine', question: 'What cuisines do you offer?', type: 'dropdown[]', options: CATERER_CUISINE },
          { field: 'serviceStyle', question: 'What service styles do you offer?', type: 'dropdown[]', options: CATERER_SERVICE_STYLE },
          { field: 'menuType', question: 'What types of menu?', type: 'dropdown[]', options: CATERER_MENU_TYPE },
          { field: 'beverages', question: 'Are beverages required?', type: 'boolean' }
        ];
        break;
      default:
        break;
    }
    return serviceQuestions;
  },

  // Get vendor by phone number
  async getVendorByPhoneNumber(phoneNumber) {
    try {
      return await Vendor.findOne({ phoneNumber });
    } catch (error) {
      logger.error(`Error fetching vendor by phone number: ${error.message}`);
      throw new Error(`Error fetching vendor by phone number: ${error.message}`);
    }
  },

  // Get vendor by GST number
  async getVendorByGstNumber(gstNumber) {
    try {
      return await Vendor.findOne({ gstNumber });
    } catch (error) {
      logger.error(`Error fetching vendor by GST number: ${error.message}`);
      throw new Error(`Error fetching vendor by GST number: ${error.message}`);
    }
  },

  // Get vendor by PAN number
  async getVendorByPanNumber(panNumber) {
    try {
      return await Vendor.findOne({ panNumber });
    } catch (error) {
      logger.error(`Error fetching vendor by PAN number: ${error.message}`);
      throw new Error(`Error fetching vendor by PAN number: ${error.message}`);
    }
  },

  /**
   * Get portfolio photos with metadata for gift hamper and cake vendors
   * @param {string} vendorId - Vendor ID
   * @returns {Object} Portfolio photos with metadata
   */
  async getPortfolioPhotosWithMetadata(vendorId) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) throw new Error('Vendor not found');

      const portfolioData = {
        vendorId: vendor._id,
        serviceType: vendor.serviceType,
        photos: vendor.portfolioPhotos || [],
        totalPhotos: vendor.portfolioPhotos ? vendor.portfolioPhotos.length : 0,
        maxPhotos: 10,
        canAddMore: vendor.portfolioPhotos ? vendor.portfolioPhotos.length < 10 : true
      };

      // Add service-specific metadata for gift hamper and cake vendors
      if (vendor.serviceType === 'GiftHamper') {
        portfolioData.recommendations = [
          'Include photos of different hamper categories (sweets, dry fruits, chocolates)',
          'Show packaging variations (boxes, baskets, bags)',
          'Display hampers for different occasions',
          'Include close-up shots of hamper contents'
        ];
      } else if (vendor.serviceType === 'Cake') {
        portfolioData.recommendations = [
          'Include photos of different cake sizes and flavors',
          'Show custom design capabilities',
          'Display cakes for different occasions (birthday, wedding, corporate)',
          'Include both eggless and regular cake options if available'
        ];
      }

      return portfolioData;
    } catch (error) {
      logger.error(`Error getting portfolio photos metadata: ${error.message}`);
      throw new Error('Error retrieving portfolio photos. Please try again later.');
    }
  },

  /**
   * Add a review for a vendor
   * @param {string} vendorId - Vendor ID
   * @param {Object} reviewData - Review data
   * @returns {Object} Updated vendor
   */
  async addReview(vendorId, reviewData) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      vendor.reviews.push(reviewData);
      await vendor.save(); // This will trigger the pre-save middleware to update avgReviewScore

      return vendor;
    } catch (error) {
      logger.error(`Error adding review: ${error.message}`);
      throw new Error(`Error adding review: ${error.message}`);
    }
  },

  /**
   * Get vendor with their products (for gift hamper and cake vendors)
   * @param {string} vendorId - Vendor ID
   * @param {Object} options - Query options
   * @returns {Object} Vendor with products
   */
  async getVendorWithProducts(vendorId, options = {}) {
    try {
      const { Product } = require('../models');
      
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) throw new Error('Vendor not found');

      // Only fetch products for gift hamper and cake vendors
      if (!['GiftHamper', 'Cake'].includes(vendor.serviceType)) {
        return { vendor, products: [] };
      }

      const productQuery = { vendorId, status: 'active' };
      
      // Add product type filter if specified
      if (options.productType) {
        productQuery.productType = options.productType;
      }

      const products = await Product.find(productQuery)
        .sort({ createdAt: -1 })
        .limit(options.limit || 20);

      return {
        vendor: vendor.toObject(),
        products,
        productCount: products.length
      };
    } catch (error) {
      logger.error(`Error getting vendor with products: ${error.message}`);
      throw new Error('Error retrieving vendor products. Please try again later.');
    }
  },

  /**
   * Advanced search for vendors with filtering and sorting
   * @param {Object} params Search parameters
   * @param {string} params.location City name from SUPPORTED_CITIES
   * @param {string} params.serviceType Type of service (DJ, Decorator, etc.)
   * @param {string|Array} params.serviceTypes Multiple service types (string or array)
   * @param {number} params.minExperience Minimum years of experience
   * @param {string} params.sortBy Sort field (e.g., 'rating', 'experience', 'events', 'teamSize', 'newest')
   * @param {string} params.sortOrder Sort order ('asc' or 'desc', defaults to 'desc')
   * @param {Object} params.serviceFilters Service-specific filters
   * @param {number} params.page Page number
   * @param {number} params.limit Results per page
   * @returns {Object} Search results with pagination
   */
  async searchVendors({
    location,
    serviceType,
    serviceTypes,
    minExperience,
    sortBy = 'rankingScore',
    sortOrder = 'desc',
    serviceFilters,
    page = 1,
    limit = 10
  } = {}) {
    try {
      // Build the base query
      const query = {};

      // Handle both serviceType and serviceTypes
      if (serviceTypes) {
        // Handle both string and array inputs
        const types = typeof serviceTypes === 'string' ? serviceTypes.split(',') : serviceTypes;
        query.serviceType = { $in: types };
      } else if (serviceType) {
        query.serviceType = serviceType;
      }

      // Add location filter using utility
      if (location) {
        if (!isSupportedCity(location)) {
          throw new Error(`Unsupported city: ${location}. Supported cities: ${SUPPORTED_CITIES.join(', ')}`);
        }
        const locationQuery = buildVendorLocationQuery(location);
        Object.assign(query, locationQuery);
      }

      // Add experience filter if specified
      if (minExperience) {
        query.yearsOfExperience = { $gte: minExperience };
      }

      // Add service-specific filters
      if (serviceFilters) {
        Object.entries(serviceFilters).forEach(([key, value]) => {
          if (value) {
            // Handle array filters for gift hamper and cake vendors
            if (Array.isArray(value)) {
              query[key] = { $in: value };
            } else {
              query[key] = value;
            }
          }
        });
      }

      // Define available sort fields mapping
      const sortFieldMap = {
        'rating': 'avgReviewScore', // Use existing field, not computed
        'experience': 'yearsOfExperience',
        'events': 'totalEventsCompleted',
        'teamSize': 'teamSize',
        'rankingScore': 'rankingScore',
        'newest': 'createdAt',
        'name': 'name'
      };

      // Get the actual field name for sorting
      const actualSortField = sortFieldMap[sortBy] || 'rankingScore';

      // Determine sort order (-1 for desc, 1 for asc) - handle missing sortOrder
      const sortDirection = (sortOrder === 'asc') ? 1 : -1;

      // Build sort object
      const sortObject = {};
      sortObject[actualSortField] = sortDirection;

      // Build the aggregation pipeline - simplified without hardcoded rating calculation
      const pipeline = [
        // Match stage for basic filters
        { $match: query },

        // Sort stage - using existing fields
        {
          $sort: sortObject
        },

        // Pagination
        {
          $facet: {
            vendors: [
              { $skip: (page - 1) * limit },
              { $limit: limit }
            ],
            total: [{ $count: 'count' }]
          }
        }
      ];

      // Execute the aggregation
      const [result] = await Vendor.aggregate(pipeline);

      // Format the response
      return {
        vendors: result.vendors,
        pagination: {
          total: result.total[0]?.count || 0,
          page,
          limit,
          pages: Math.ceil((result.total[0]?.count || 0) / limit)
        }
      };
    } catch (error) {
      logger.error('Error in vendor search:', error);
      throw new Error('Failed to search vendors');
    }
  }
};

module.exports = vendorService; 