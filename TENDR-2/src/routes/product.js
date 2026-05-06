const express = require('express');
const router = express.Router();
const { authVendor } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');
const { logger } = require('../middleware/logger');
const { checkVendorProductAccess } = require('../middleware/vendorApproval');
const Product = require('../models/Product');
const { body, param, query } = require('express-validator');
const { SUPPORTED_CITIES, DELIVERY_OPTIONS, PRODUCT_CATEGORIES, CAKE_SIZES } = require('../constants');
const { 
  handleProductImageUpload, 
  handleProductImageUpdate,
  deleteProductImages,
  reorderProductImages 
} = require('../middleware/productImageUpload');
const { 
  isSupportedCity, 
  buildProductLocationQuery, 
  validateDeliveryAreas,
  getSupportedCities 
} = require('../utils/location');

// Product validation rules
const productValidations = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Product name is required')
      .isLength({ min: 2, max: 200 })
      .withMessage('Product name must be between 2 and 200 characters'),
    
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Product description is required')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Product description must be between 10 and 1000 characters'),
    
    body('productType')
      .isIn(['GiftHamper', 'Cake'])
      .withMessage('Product type must be either GiftHamper or Cake'),
    
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required')
      .custom((value, { req }) => {
        const productType = req.body.productType;
        if (productType === 'GiftHamper' && !PRODUCT_CATEGORIES.GIFT_HAMPER.includes(value)) {
          throw new Error('Invalid category for Gift Hamper');
        }
        if (productType === 'Cake' && !PRODUCT_CATEGORIES.CAKE.includes(value)) {
          throw new Error('Invalid category for Cake');
        }
        return true;
      }),
    
    body('pricing.basePrice')
      .isNumeric()
      .withMessage('Base price must be a number')
      .custom((value) => {
        if (value < 0) {
          throw new Error('Base price must be non-negative');
        }
        return true;
      }),
    
    body('pricing.discountedPrice')
      .optional()
      .isNumeric()
      .withMessage('Discounted price must be a number')
      .custom((value, { req }) => {
        if (value < 0) {
          throw new Error('Discounted price must be non-negative');
        }
        if (value && req.body.pricing?.basePrice && value > req.body.pricing.basePrice) {
          throw new Error('Discounted price cannot be greater than base price');
        }
        return true;
      }),
    
    body('pricing.isNegotiable')
      .optional()
      .isBoolean()
      .withMessage('isNegotiable must be a boolean'),
    
    body('deliveryInfo.options')
      .isArray({ min: 1 })
      .withMessage('At least one delivery option is required')
      .custom((arr) => {
        if (!arr.every(option => DELIVERY_OPTIONS.includes(option))) {
          throw new Error('Invalid delivery option');
        }
        return true;
      }),
    
    body('deliveryInfo.timeRange.min')
      .isInt({ min: 0 })
      .withMessage('Minimum delivery time must be a non-negative integer'),
    
    body('deliveryInfo.timeRange.max')
      .isInt({ min: 0 })
      .withMessage('Maximum delivery time must be a non-negative integer')
      .custom((max, { req }) => {
        const min = req.body.deliveryInfo?.timeRange?.min;
        if (min !== undefined && max < min) {
          throw new Error('Maximum delivery time must be greater than or equal to minimum delivery time');
        }
        return true;
      }),
    
    body('deliveryInfo.areas')
      .optional()
      .isArray()
      .withMessage('Delivery areas must be an array')
      .custom((arr) => {
        if (arr && arr.length > 0) {
          const validation = validateDeliveryAreas(arr);
          if (!validation.isValid) {
            throw new Error(`Invalid delivery areas: ${validation.invalidAreas.join(', ')}. Supported cities: ${getSupportedCities().join(', ')}`);
          }
        }
        return true;
      }),
    
    // Cake-specific validations
    body('cakeDetails.availableSizes')
      .if(body('productType').equals('Cake'))
      .isArray({ min: 1 })
      .withMessage('At least one cake size is required for cake products')
      .custom((arr) => {
        if (!arr.every(size => CAKE_SIZES.includes(size))) {
          throw new Error('Invalid cake size');
        }
        return true;
      }),
    
    body('cakeDetails.flavors')
      .if(body('productType').equals('Cake'))
      .isArray({ min: 1 })
      .withMessage('At least one flavor is required for cake products'),
    
    body('cakeDetails.customizationAvailable')
      .if(body('productType').equals('Cake'))
      .optional()
      .isBoolean()
      .withMessage('Customization available must be a boolean'),
    
    body('cakeDetails.eggless')
      .if(body('productType').equals('Cake'))
      .optional()
      .isBoolean()
      .withMessage('Eggless must be a boolean'),
    
    body('cakeDetails.sugarFree')
      .if(body('productType').equals('Cake'))
      .optional()
      .isBoolean()
      .withMessage('Sugar free must be a boolean'),
    
    // Gift Hamper-specific validations
    body('hamperDetails.contents')
      .if(body('productType').equals('GiftHamper'))
      .isArray({ min: 1 })
      .withMessage('At least one content item is required for gift hamper products'),
    
    body('hamperDetails.weight')
      .if(body('productType').equals('GiftHamper'))
      .isNumeric()
      .withMessage('Weight must be a number')
      .custom((value) => {
        if (value <= 0) {
          throw new Error('Weight must be positive');
        }
        return true;
      }),
    
    body('hamperDetails.packaging')
      .if(body('productType').equals('GiftHamper'))
      .optional()
      .isIn(['Box', 'Basket', 'Bag', 'Custom'])
      .withMessage('Invalid packaging type')
  ],

  update: [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Product name must be between 2 and 200 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Product description must be between 10 and 1000 characters'),
    
    body('category')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Category cannot be empty'),
    
    body('pricing.basePrice')
      .optional()
      .isNumeric()
      .withMessage('Base price must be a number')
      .custom((value) => {
        if (value < 0) {
          throw new Error('Base price must be non-negative');
        }
        return true;
      }),
    
    body('pricing.discountedPrice')
      .optional()
      .isNumeric()
      .withMessage('Discounted price must be a number')
      .custom((value) => {
        if (value < 0) {
          throw new Error('Discounted price must be non-negative');
        }
        return true;
      }),
    
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'pending_approval'])
      .withMessage('Invalid status')
  ],

  getById: [
    param('id').isMongoId().withMessage('Invalid product ID')
  ],

  locationProducts: [
    param('city')
      .custom((city) => {
        if (!isSupportedCity(city)) {
          throw new Error(`Invalid city. Must be one of supported cities: ${getSupportedCities().join(', ')}`);
        }
        return true;
      })
  ],

  searchProducts: [
    query('city')
      .optional()
      .custom((city) => {
        if (city && !isSupportedCity(city)) {
          throw new Error(`Invalid city. Must be one of supported cities: ${getSupportedCities().join(', ')}`);
        }
        return true;
      }),
    query('productType')
      .optional()
      .isIn(['GiftHamper', 'Cake'])
      .withMessage('Product type must be either GiftHamper or Cake'),
    query('category')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Category cannot be empty'),
    query('minPrice')
      .optional()
      .isNumeric()
      .withMessage('Minimum price must be a number'),
    query('maxPrice')
      .optional()
      .isNumeric()
      .withMessage('Maximum price must be a number'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ]
};

// Create a new product
router.post('/', authVendor, checkVendorProductAccess, productValidations.create, validateRequest, async (req, res, next) => {
  try {
    const vendorId = req.vendor._id;

    // Check product limit (example: 50 products per vendor)
    const existingProductCount = await Product.countDocuments({ 
      vendorId: vendorId, 
      status: { $ne: 'inactive' } 
    });
    
    const productLimit = req.vendor.tier === 'premium' ? 100 : 50; // Example tier-based limits
    if (existingProductCount >= productLimit) {
      const error = new Error(`Product limit exceeded. Your current plan allows up to ${productLimit} active products. Consider upgrading your plan or removing inactive products.`);
      error.statusCode = 429;
      error.name = 'BusinessLogicError';
      error.errorCode = 'PRODUCT_LIMIT_EXCEEDED';
      throw error;
    }

    // Validate product type matches vendor service type
    if (req.body.productType === 'GiftHamper' && req.vendor.serviceType !== 'GiftHamper') {
      const error = new Error('Gift hamper products can only be created by gift hamper vendors.');
      error.statusCode = 400;
      error.name = 'BusinessLogicError';
      error.errorCode = 'INVALID_PRODUCT_TYPE_FOR_VENDOR';
      throw error;
    }

    if (req.body.productType === 'Cake' && req.vendor.serviceType !== 'Cake') {
      const error = new Error('Cake products can only be created by cake vendors.');
      error.statusCode = 400;
      error.name = 'BusinessLogicError';
      error.errorCode = 'INVALID_PRODUCT_TYPE_FOR_VENDOR';
      throw error;
    }

    // Validate pricing logic
    if (req.body.pricing?.discountedPrice && req.body.pricing?.basePrice) {
      if (req.body.pricing.discountedPrice > req.body.pricing.basePrice) {
        const error = new Error('Discounted price cannot be greater than base price.');
        error.statusCode = 400;
        error.name = 'FieldValidationError';
        error.field = 'pricing.discountedPrice';
        error.fieldMessage = 'Must be less than or equal to base price';
        throw error;
      }
    }

    // Prepare product data
    const productData = {
      ...req.body,
      vendorId: vendorId,
      status: 'active' // New products are active by default for approved vendors
    };

    // Create the product
    const product = new Product(productData);
    await product.save();

    // Populate vendor information
    await product.populate('vendorId', 'name address phoneNumber avgReviewScore serviceType');

    logger.info(`Product created: ${product._id} by vendor: ${vendorId}`, {
      productId: product._id,
      vendorId: vendorId,
      productType: product.productType,
      category: product.category,
      basePrice: product.pricing?.basePrice
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product: product,
        tips: {
          'GiftHamper': 'Consider adding high-quality images showcasing different hamper categories and contents.',
          'Cake': 'Upload photos of different cake designs, sizes, and flavors to attract more customers.'
        }[product.productType]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating product:', {
      error: error.message,
      vendorId: req.vendor?._id,
      productType: req.body?.productType,
      errorCode: error.errorCode
    });
    next(error);
  }
});

// Get product by ID
router.get('/:id', productValidations.getById, validateRequest, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendorId', 'name address phoneNumber avgReviewScore locations serviceType status');

    if (!product) {
      const error = new Error('Product not found or has been removed.');
      error.statusCode = 404;
      error.name = 'BusinessLogicError';
      error.errorCode = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    // Check access permissions
    const isOwner = req.vendor && req.vendor._id.toString() === product.vendorId._id.toString();
    const isPublicAccess = !req.vendor; // No vendor auth means public access
    
    // Only return active products to public, or any status to the vendor who owns it
    if (product.status !== 'active' && !isOwner) {
      const error = new Error('Product is not currently available.');
      error.statusCode = 404;
      error.name = 'BusinessLogicError';
      error.errorCode = 'PRODUCT_NOT_AVAILABLE';
      throw error;
    }

    // Check if vendor is still active (for public access)
    if (isPublicAccess && product.vendorId.status !== 'approved') {
      const error = new Error('Product is not currently available.');
      error.statusCode = 404;
      error.name = 'BusinessLogicError';
      error.errorCode = 'VENDOR_NOT_ACTIVE';
      throw error;
    }

    // Add view tracking for public access
    if (isPublicAccess) {
      // Increment view count (you might want to implement this in the Product model)
      await Product.findByIdAndUpdate(req.params.id, { 
        $inc: { viewCount: 1 },
        lastViewed: new Date()
      });
    }

    logger.info(`Product viewed: ${product._id}`, {
      productId: product._id,
      vendorId: product.vendorId._id,
      viewerType: isOwner ? 'owner' : 'public',
      productType: product.productType
    });

    res.json({
      success: true,
      data: {
        product: product,
        isOwner: isOwner,
        relatedInfo: {
          canEdit: isOwner,
          canDelete: isOwner,
          vendorContact: isPublicAccess ? {
            name: product.vendorId.name,
            phoneNumber: product.vendorId.phoneNumber,
            avgRating: product.vendorId.avgReviewScore
          } : null
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting product:', {
      error: error.message,
      productId: req.params.id,
      vendorId: req.vendor?._id,
      errorCode: error.errorCode
    });
    next(error);
  }
});

// Update product
router.put('/:id', authVendor, checkVendorProductAccess, productValidations.update, validateRequest, async (req, res, next) => {
  try {
    const productId = req.params.id;
    const vendorId = req.vendor._id;

    // Find the product
    const product = await Product.findById(productId);
    
    if (!product) {
      const error = new Error('Product not found or has been removed.');
      error.statusCode = 404;
      error.name = 'BusinessLogicError';
      error.errorCode = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    // Check if the vendor owns this product
    if (product.vendorId.toString() !== vendorId.toString()) {
      const error = new Error('You can only update your own products. This product belongs to another vendor.');
      error.statusCode = 403;
      error.name = 'BusinessLogicError';
      error.errorCode = 'INVALID_VENDOR_PRODUCT_ASSOCIATION';
      throw error;
    }



    // Validate pricing updates
    if (req.body.pricing) {
      const newPricing = { ...product.pricing.toObject(), ...req.body.pricing };
      if (newPricing.discountedPrice && newPricing.basePrice && 
          newPricing.discountedPrice > newPricing.basePrice) {
        const error = new Error('Discounted price cannot be greater than base price.');
        error.statusCode = 400;
        error.name = 'FieldValidationError';
        error.field = 'pricing.discountedPrice';
        error.fieldMessage = 'Must be less than or equal to base price';
        throw error;
      }
    }

    // Validate status transitions
    if (req.body.status && req.body.status !== product.status) {
      const validTransitions = {
        'active': ['inactive', 'pending_approval'],
        'inactive': ['active', 'pending_approval'],
        'pending_approval': ['active', 'inactive']
      };

      if (!validTransitions[product.status]?.includes(req.body.status)) {
        const error = new Error(`Cannot change product status from ${product.status} to ${req.body.status}.`);
        error.statusCode = 400;
        error.name = 'BusinessLogicError';
        error.errorCode = 'INVALID_STATUS_TRANSITION';
        throw error;
      }
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    ).populate('vendorId', 'name address phoneNumber avgReviewScore serviceType');

    logger.info(`Product updated: ${productId} by vendor: ${vendorId}`, {
      productId: productId,
      vendorId: vendorId,
      updatedFields: Object.keys(req.body),
      previousStatus: product.status,
      newStatus: updatedProduct.status
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product: updatedProduct,
        changes: Object.keys(req.body),
        statusChanged: product.status !== updatedProduct.status
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating product:', {
      error: error.message,
      productId: req.params.id,
      vendorId: req.vendor?._id,
      errorCode: error.errorCode
    });
    next(error);
  }
});

// Delete product (soft delete by setting status to inactive)
router.delete('/:id', authVendor, checkVendorProductAccess, productValidations.getById, validateRequest, async (req, res) => {
  try {
    const productId = req.params.id;
    const vendorId = req.vendor._id;

    // Find the product
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        success: false 
      });
    }

    // Check if the vendor owns this product
    if (product.vendorId.toString() !== vendorId.toString()) {
      return res.status(403).json({ 
        error: 'You can only delete your own products',
        success: false 
      });
    }

    // Soft delete by setting status to inactive
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { status: 'inactive', updatedAt: new Date() },
      { new: true }
    );

    logger.info(`Product deleted: ${productId} by vendor: ${vendorId}`);

    res.json({
      message: 'Product deleted successfully',
      product: updatedProduct,
      success: true
    });
  } catch (error) {
    logger.error('Error deleting product:', error);
    res.status(500).json({ 
      error: 'Failed to delete product',
      success: false 
    });
  }
});



// GET /api/locations/:city/products - Get products by city
router.get('/locations/:city/products', productValidations.locationProducts, validateRequest, async (req, res) => {
  try {
    const { city } = req.params;
    const { productType, category, page = 1, limit = 20 } = req.query;

    // Build location query using utility
    const locationQuery = buildProductLocationQuery(city);
    
    // Build base query
    const query = {
      status: 'active',
      ...locationQuery
    };

    // Add optional filters
    if (productType) {
      query.productType = productType;
    }
    
    if (category) {
      query.category = category;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find products with pagination
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .populate('vendorId', 'name address phoneNumber avgReviewScore locations')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      city,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalProducts: totalCount,
        limit: parseInt(limit)
      },
      filters: {
        productType,
        category
      },
      success: true
    });
  } catch (error) {
    logger.error('Error getting products by location:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve products for location',
      success: false 
    });
  }
});

// GET /api/products/search - Advanced product search with location and filters
router.get('/search', productValidations.searchProducts, validateRequest, async (req, res) => {
  try {
    const { 
      city, 
      productType, 
      category, 
      minPrice, 
      maxPrice, 
      page = 1, 
      limit = 20,
      sortBy = 'newest'
    } = req.query;

    // Build base query
    const query = { status: 'active' };

    // Add location filter if city is provided
    if (city) {
      const locationQuery = buildProductLocationQuery(city);
      Object.assign(query, locationQuery);
    }

    // Add product type filter
    if (productType) {
      query.productType = productType;
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) {
        query['pricing.basePrice'].$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query['pricing.basePrice'].$lte = parseFloat(maxPrice);
      }
    }

    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'price_low':
        sortOptions = { 'pricing.basePrice': 1 };
        break;
      case 'price_high':
        sortOptions = { 'pricing.basePrice': -1 };
        break;
      case 'rating':
        sortOptions = { 'vendorId.avgReviewScore': -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search with pagination
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .populate('vendorId', 'name address phoneNumber avgReviewScore locations')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalProducts: totalCount,
        limit: parseInt(limit)
      },
      filters: {
        city,
        productType,
        category,
        minPrice,
        maxPrice,
        sortBy
      },
      success: true
    });
  } catch (error) {
    logger.error('Error searching products:', error);
    res.status(500).json({ 
      error: 'Failed to search products',
      success: false 
    });
  }
});

// GET /api/products/cities - Get all supported cities
router.get('/cities', async (req, res) => {
  try {
    const cities = getSupportedCities();
    
    res.json({
      cities,
      totalCities: cities.length,
      success: true
    });
  } catch (error) {
    logger.error('Error getting supported cities:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve supported cities',
      success: false 
    });
  }
});

// POST /api/products/:id/images - Upload images for a product
router.post('/:id/images', 
  authVendor,
  checkVendorProductAccess, 
  param('id').isMongoId().withMessage('Invalid product ID'),
  validateRequest,
  handleProductImageUpload,
  async (req, res) => {
    try {
      const productId = req.params.id;
      const vendorId = req.vendor._id;

      // Find the product
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({ 
          error: 'Product not found',
          success: false 
        });
      }

      // Check if the vendor owns this product
      if (product.vendorId.toString() !== vendorId.toString()) {
        return res.status(403).json({ 
          error: 'You can only upload images for your own products',
          success: false 
        });
      }

      // Check if adding new images would exceed the limit
      const currentImageCount = product.images ? product.images.length : 0;
      const newImageCount = req.uploadedImages ? req.uploadedImages.length : 0;
      
      if (currentImageCount + newImageCount > 10) {
        // Clean up uploaded images since we can't use them
        if (req.uploadedImages && req.uploadedImages.length > 0) {
          await deleteProductImages(req.uploadedImages);
        }
        
        return res.status(400).json({
          error: `Cannot add ${newImageCount} images. Product already has ${currentImageCount} images. Maximum is 10.`,
          success: false
        });
      }

      // If no images were uploaded, return current images
      if (!req.uploadedImages || req.uploadedImages.length === 0) {
        return res.json({
          message: 'No new images uploaded',
          images: product.images || [],
          success: true
        });
      }

      // Add new images to existing ones with proper ordering
      const existingImages = product.images || [];
      const maxExistingOrder = existingImages.length > 0 
        ? Math.max(...existingImages.map(img => img.order)) 
        : 0;

      // Update order for new images to continue from existing ones
      const newImages = req.uploadedImages.map((img, index) => ({
        ...img,
        order: maxExistingOrder + index + 1
      }));

      // Combine existing and new images
      const allImages = [...existingImages, ...newImages];

      // Update the product with new images
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { 
          images: allImages,
          updatedAt: new Date() 
        },
        { new: true, runValidators: true }
      ).populate('vendorId', 'name address phoneNumber avgReviewScore');

      logger.info(`Added ${newImages.length} images to product: ${productId} by vendor: ${vendorId}`);

      res.json({
        message: `Successfully uploaded ${newImages.length} images`,
        images: updatedProduct.images,
        product: updatedProduct,
        success: true
      });
    } catch (error) {
      logger.error('Error uploading product images:', error);
      
      // Clean up uploaded images on error
      if (req.uploadedImages && req.uploadedImages.length > 0) {
        await deleteProductImages(req.uploadedImages);
      }
      
      res.status(500).json({ 
        error: 'Failed to upload product images',
        success: false 
      });
    }
  }
);

// PUT /api/products/:id/images - Update/reorder product images
router.put('/:id/images',
  authVendor,
  checkVendorProductAccess,
  param('id').isMongoId().withMessage('Invalid product ID'),
  validateRequest,
  handleProductImageUpdate,
  async (req, res) => {
    try {
      const productId = req.params.id;
      const vendorId = req.vendor._id;

      // Find the product
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({ 
          error: 'Product not found',
          success: false 
        });
      }

      // Check if the vendor owns this product
      if (product.vendorId.toString() !== vendorId.toString()) {
        return res.status(403).json({ 
          error: 'You can only update images for your own products',
          success: false 
        });
      }

      let updatedImages = product.images || [];

      // Handle image reordering if provided
      if (req.imageOrdering && req.imageOrdering.length > 0) {
        updatedImages = reorderProductImages(updatedImages, req.imageOrdering);
      }

      // Add new uploaded images if any
      if (req.uploadedImages && req.uploadedImages.length > 0) {
        // Check total image count
        if (updatedImages.length + req.uploadedImages.length > 10) {
          // Clean up uploaded images since we can't use them
          await deleteProductImages(req.uploadedImages);
          
          return res.status(400).json({
            error: `Cannot add ${req.uploadedImages.length} images. Would exceed maximum of 10 images.`,
            success: false
          });
        }

        // Add new images with proper ordering
        const maxOrder = updatedImages.length > 0 
          ? Math.max(...updatedImages.map(img => img.order)) 
          : 0;

        const newImages = req.uploadedImages.map((img, index) => ({
          ...img,
          order: maxOrder + index + 1
        }));

        updatedImages = [...updatedImages, ...newImages];
      }

      // Update the product
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { 
          images: updatedImages,
          updatedAt: new Date() 
        },
        { new: true, runValidators: true }
      ).populate('vendorId', 'name address phoneNumber avgReviewScore');

      logger.info(`Updated images for product: ${productId} by vendor: ${vendorId}`);

      res.json({
        message: 'Product images updated successfully',
        images: updatedProduct.images,
        product: updatedProduct,
        success: true
      });
    } catch (error) {
      logger.error('Error updating product images:', error);
      
      // Clean up uploaded images on error
      if (req.uploadedImages && req.uploadedImages.length > 0) {
        await deleteProductImages(req.uploadedImages);
      }
      
      res.status(500).json({ 
        error: 'Failed to update product images',
        success: false 
      });
    }
  }
);

// DELETE /api/products/:id/images/:imageOrder - Delete a specific product image
router.delete('/:id/images/:imageOrder',
  authVendor,
  checkVendorProductAccess,
  param('id').isMongoId().withMessage('Invalid product ID'),
  param('imageOrder').isInt({ min: 1, max: 10 }).withMessage('Image order must be between 1 and 10'),
  validateRequest,
  async (req, res) => {
    try {
      const productId = req.params.id;
      const imageOrder = parseInt(req.params.imageOrder);
      const vendorId = req.vendor._id;

      // Find the product
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({ 
          error: 'Product not found',
          success: false 
        });
      }

      // Check if the vendor owns this product
      if (product.vendorId.toString() !== vendorId.toString()) {
        return res.status(403).json({ 
          error: 'You can only delete images from your own products',
          success: false 
        });
      }

      // Find the image to delete
      const imageToDelete = product.images.find(img => img.order === imageOrder);
      
      if (!imageToDelete) {
        return res.status(404).json({
          error: `Image with order ${imageOrder} not found`,
          success: false
        });
      }

      // Remove the image from the array
      const remainingImages = product.images.filter(img => img.order !== imageOrder);

      // Reorder remaining images to fill gaps
      const reorderedImages = remainingImages
        .sort((a, b) => a.order - b.order)
        .map((img, index) => ({
          ...img,
          order: index + 1
        }));

      // Update the product
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { 
          images: reorderedImages,
          updatedAt: new Date() 
        },
        { new: true, runValidators: true }
      ).populate('vendorId', 'name address phoneNumber avgReviewScore');

      // Delete the image from Cloudinary
      await deleteProductImages([imageToDelete]);

      logger.info(`Deleted image (order: ${imageOrder}) from product: ${productId} by vendor: ${vendorId}`);

      res.json({
        message: `Image deleted successfully`,
        images: updatedProduct.images,
        product: updatedProduct,
        success: true
      });
    } catch (error) {
      logger.error('Error deleting product image:', error);
      res.status(500).json({ 
        error: 'Failed to delete product image',
        success: false 
      });
    }
  }
);

// GET /api/products/:id/images - Get product images with ordering
router.get('/:id/images',
  param('id').isMongoId().withMessage('Invalid product ID'),
  validateRequest,
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ 
          error: 'Product not found',
          success: false 
        });
      }

      // Only return images for active products to public, or any status to the vendor who owns it
      const isOwner = req.vendor && req.vendor._id.toString() === product.vendorId.toString();
      
      if (product.status !== 'active' && !isOwner) {
        return res.status(404).json({ 
          error: 'Product not found',
          success: false 
        });
      }

      // Return images sorted by order
      const orderedImages = product.images
        ? product.images.sort((a, b) => a.order - b.order)
        : [];

      res.json({
        productId: product._id,
        images: orderedImages,
        totalImages: orderedImages.length,
        success: true
      });
    } catch (error) {
      logger.error('Error getting product images:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve product images',
        success: false 
      });
    }
  }
);

module.exports = router;