const { cloudinary, productUpload } = require('../config/cloudinary');
const { logger } = require('./logger');

/**
 * Middleware for handling product image uploads with ordering support
 * Supports up to 10 images with order validation
 */

// Create specialized multer instance for product images
const productImageUpload = productUpload.array('images', 10);

/**
 * Middleware to handle product image upload with validation and ordering
 */
const handleProductImageUpload = async (req, res, next) => {
  try {
    // Use the existing multer upload middleware
    productImageUpload(req, res, async (err) => {
      if (err) {
        logger.error('Product image upload error:', err);
        
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            error: 'Maximum 10 images allowed per product',
            success: false
          });
        }
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'File size too large. Maximum 5MB per image',
            success: false
          });
        }
        
        return res.status(400).json({
          error: 'Image upload failed: ' + err.message,
          success: false
        });
      }

      // If no files uploaded, continue to next middleware
      if (!req.files || req.files.length === 0) {
        return next();
      }

      try {
        // Process uploaded images and create image objects with ordering
        const processedImages = req.files.map((file, index) => ({
          url: file.path, // Cloudinary URL
          order: index + 1, // Default ordering based on upload sequence
          publicId: file.filename // Cloudinary public ID for deletion
        }));

        // Attach processed images to request for use in route handlers
        req.uploadedImages = processedImages;
        
        logger.info(`Successfully uploaded ${processedImages.length} product images`);
        next();
        
      } catch (processingError) {
        logger.error('Error processing uploaded images:', processingError);
        
        // Clean up uploaded files on processing error
        if (req.files && req.files.length > 0) {
          await cleanupUploadedImages(req.files);
        }
        
        return res.status(500).json({
          error: 'Failed to process uploaded images',
          success: false
        });
      }
    });
  } catch (error) {
    logger.error('Product image upload middleware error:', error);
    return res.status(500).json({
      error: 'Image upload service unavailable',
      success: false
    });
  }
};

/**
 * Middleware to handle product image updates with ordering
 * Supports reordering existing images and adding new ones
 */
const handleProductImageUpdate = async (req, res, next) => {
  try {
    productImageUpload(req, res, async (err) => {
      if (err) {
        logger.error('Product image update error:', err);
        
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            error: 'Maximum 10 images allowed per product',
            success: false
          });
        }
        
        return res.status(400).json({
          error: 'Image upload failed: ' + err.message,
          success: false
        });
      }

      // Handle image ordering from request body
      let imageOrdering = [];
      
      try {
        // Parse image ordering if provided
        if (req.body.imageOrdering) {
          imageOrdering = JSON.parse(req.body.imageOrdering);
        }
      } catch (parseError) {
        return res.status(400).json({
          error: 'Invalid image ordering format. Must be valid JSON array',
          success: false
        });
      }

      // Validate image ordering
      if (imageOrdering.length > 0) {
        const validationResult = validateImageOrdering(imageOrdering);
        if (!validationResult.isValid) {
          return res.status(400).json({
            error: validationResult.error,
            success: false
          });
        }
      }

      // Process new uploaded images if any
      let newImages = [];
      if (req.files && req.files.length > 0) {
        newImages = req.files.map((file, index) => ({
          url: file.path,
          order: imageOrdering.length + index + 1, // Continue ordering after existing images
          publicId: file.filename
        }));
      }

      // Attach processed data to request
      req.uploadedImages = newImages;
      req.imageOrdering = imageOrdering;
      
      next();
    });
  } catch (error) {
    logger.error('Product image update middleware error:', error);
    return res.status(500).json({
      error: 'Image update service unavailable',
      success: false
    });
  }
};

/**
 * Validate image ordering array
 */
const validateImageOrdering = (ordering) => {
  if (!Array.isArray(ordering)) {
    return { isValid: false, error: 'Image ordering must be an array' };
  }

  if (ordering.length > 10) {
    return { isValid: false, error: 'Cannot have more than 10 images' };
  }

  // Check for required fields in each image object
  for (let i = 0; i < ordering.length; i++) {
    const image = ordering[i];
    
    if (!image.url || typeof image.url !== 'string') {
      return { isValid: false, error: `Image ${i + 1}: URL is required and must be a string` };
    }
    
    if (!image.order || typeof image.order !== 'number' || image.order < 1 || image.order > 10) {
      return { isValid: false, error: `Image ${i + 1}: Order must be a number between 1 and 10` };
    }
  }

  // Check for duplicate order values
  const orders = ordering.map(img => img.order);
  const uniqueOrders = new Set(orders);
  
  if (orders.length !== uniqueOrders.size) {
    return { isValid: false, error: 'Image order values must be unique' };
  }

  // Check for sequential ordering (1, 2, 3, etc.)
  const sortedOrders = [...orders].sort((a, b) => a - b);
  for (let i = 0; i < sortedOrders.length; i++) {
    if (sortedOrders[i] !== i + 1) {
      return { isValid: false, error: 'Image order values must be sequential starting from 1' };
    }
  }

  return { isValid: true };
};

/**
 * Clean up uploaded images from Cloudinary in case of errors
 */
const cleanupUploadedImages = async (files) => {
  try {
    const deletePromises = files.map(file => {
      if (file.filename) {
        return cloudinary.uploader.destroy(file.filename);
      }
    });
    
    await Promise.all(deletePromises);
    logger.info(`Cleaned up ${files.length} uploaded images due to error`);
  } catch (cleanupError) {
    logger.error('Error cleaning up uploaded images:', cleanupError);
  }
};

/**
 * Delete images from Cloudinary
 */
const deleteProductImages = async (images) => {
  try {
    if (!images || images.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    const deletePromises = images.map(image => {
      if (image.publicId) {
        return cloudinary.uploader.destroy(image.publicId);
      } else if (image.url) {
        // Extract public ID from Cloudinary URL if publicId not available
        const publicId = extractPublicIdFromUrl(image.url);
        if (publicId) {
          return cloudinary.uploader.destroy(publicId);
        }
      }
      return Promise.resolve(null);
    });

    const results = await Promise.all(deletePromises);
    const successfulDeletes = results.filter(result => result && result.result === 'ok').length;
    
    logger.info(`Deleted ${successfulDeletes} product images from Cloudinary`);
    
    return { 
      success: true, 
      deletedCount: successfulDeletes,
      totalAttempted: images.length 
    };
  } catch (error) {
    logger.error('Error deleting product images:', error);
    return { 
      success: false, 
      error: error.message,
      deletedCount: 0 
    };
  }
};

/**
 * Extract Cloudinary public ID from URL
 */
const extractPublicIdFromUrl = (url) => {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    return matches ? matches[1] : null;
  } catch (error) {
    logger.error('Error extracting public ID from URL:', error);
    return null;
  }
};

/**
 * Reorder existing product images
 */
const reorderProductImages = (existingImages, newOrdering) => {
  try {
    if (!newOrdering || newOrdering.length === 0) {
      return existingImages;
    }

    // Create a map of existing images by URL for quick lookup
    const imageMap = new Map();
    existingImages.forEach(img => {
      imageMap.set(img.url, img);
    });

    // Create new ordered array
    const reorderedImages = newOrdering.map(orderItem => {
      const existingImage = imageMap.get(orderItem.url);
      if (existingImage) {
        return {
          ...existingImage,
          order: orderItem.order
        };
      }
      return null;
    }).filter(img => img !== null);

    return reorderedImages;
  } catch (error) {
    logger.error('Error reordering product images:', error);
    return existingImages;
  }
};

module.exports = {
  handleProductImageUpload,
  handleProductImageUpdate,
  validateImageOrdering,
  cleanupUploadedImages,
  deleteProductImages,
  extractPublicIdFromUrl,
  reorderProductImages
};