const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { SUPPORTED_CITIES, DELIVERY_OPTIONS, PRODUCT_CATEGORIES, CAKE_SIZES } = require('../constants');

/*
Product Schema Structure:
- Core fields: vendorId, name, description, productType, category, images, pricing, deliveryInfo, status
- Product type discrimination: GiftHamper vs Cake
- Image management with ordering support
- Location-based delivery areas
- Discriminators for product-specific fields
*/

// Base Product Schema
const productBaseSchema = new Schema({
  vendorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Vendor', 
    required: true,
    index: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  description: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 1000
  },
  productType: { 
    type: String, 
    required: true, 
    enum: ['GiftHamper', 'Cake'],
    index: true
  },
  category: { 
    type: String, 
    required: true,
    validate: {
      validator: function(value) {
        if (this.productType === 'GiftHamper') {
          return PRODUCT_CATEGORIES.GIFT_HAMPER.includes(value);
        } else if (this.productType === 'Cake') {
          return PRODUCT_CATEGORIES.CAKE.includes(value);
        }
        return false;
      },
      message: 'Category must be valid for the product type'
    }
  },
  images: {
    type: [{
      url: { type: String, required: true },
      order: { type: Number, required: true, min: 1, max: 10 }
    }],
    validate: [
      {
        validator: function(arr) {
          return arr.length <= 10;
        },
        message: 'Cannot have more than 10 images'
      },
      {
        validator: function(arr) {
          // Check for unique order values
          const orders = arr.map(img => img.order);
          return orders.length === new Set(orders).size;
        },
        message: 'Image order values must be unique'
      }
    ],
    default: []
  },
  pricing: {
    basePrice: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    discountedPrice: { 
      type: Number, 
      min: 0,
      validate: {
        validator: function(value) {
          return !value || value <= this.pricing.basePrice;
        },
        message: 'Discounted price cannot be greater than base price'
      }
    },
    isNegotiable: { 
      type: Boolean, 
      default: false 
    }
  },
  deliveryInfo: {
    options: [{ 
      type: String, 
      enum: DELIVERY_OPTIONS, 
      required: true 
    }],
    timeRange: {
      min: { type: Number, required: true, min: 0 }, // minimum hours/days
      max: { type: Number, required: true, min: 0 }  // maximum hours/days
    },
    areas: [{ 
      type: String, 
      enum: SUPPORTED_CITIES 
    }]
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'pending_approval'], 
    default: 'pending_approval',
    index: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  discriminatorKey: 'productType',
  timestamps: true
});

// Indexes for efficient querying
productBaseSchema.index({ vendorId: 1, status: 1 });
productBaseSchema.index({ productType: 1, status: 1 });
productBaseSchema.index({ 'deliveryInfo.areas': 1, status: 1 });
productBaseSchema.index({ 'pricing.basePrice': 1 });
productBaseSchema.index({ createdAt: -1 });
productBaseSchema.index({ category: 1, status: 1 });

// Location-based compound indexes for efficient filtering
productBaseSchema.index({ 
  'deliveryInfo.areas': 1, 
  productType: 1, 
  status: 1 
});
productBaseSchema.index({ 
  'deliveryInfo.areas': 1, 
  'pricing.basePrice': 1, 
  status: 1 
});
productBaseSchema.index({ 
  'deliveryInfo.areas': 1, 
  category: 1, 
  status: 1 
});
productBaseSchema.index({ 
  'deliveryInfo.options': 1, 
  status: 1 
});

// Text search index for name and description
productBaseSchema.index({ 
  name: 'text', 
  description: 'text' 
}, {
  weights: {
    name: 10,
    description: 5
  },
  name: 'product_text_index'
});

// Pre-save middleware to update timestamps
productBaseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for effective price (discounted or base)
productBaseSchema.virtual('effectivePrice').get(function() {
  return this.pricing.discountedPrice || this.pricing.basePrice;
});

// Method to check if product is available in a specific location
productBaseSchema.methods.isAvailableInLocation = function(city) {
  return this.deliveryInfo.areas.includes(city) || this.deliveryInfo.areas.length === 0;
};

// Method to get ordered images
productBaseSchema.methods.getOrderedImages = function() {
  return this.images.sort((a, b) => a.order - b.order);
};

// Static method to find products by location
productBaseSchema.statics.findByLocation = function(city, options = {}) {
  const query = {
    status: 'active',
    $or: [
      { 'deliveryInfo.areas': city },
      { 'deliveryInfo.areas': { $size: 0 } } // Products available everywhere
    ]
  };
  
  if (options.productType) {
    query.productType = options.productType;
  }
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.priceRange) {
    if (options.priceRange.min !== undefined) {
      query['pricing.basePrice'] = { $gte: options.priceRange.min };
    }
    if (options.priceRange.max !== undefined) {
      query['pricing.basePrice'] = { 
        ...query['pricing.basePrice'], 
        $lte: options.priceRange.max 
      };
    }
  }
  
  if (options.deliveryOptions) {
    query['deliveryInfo.options'] = { $in: options.deliveryOptions };
  }
  
  const queryBuilder = this.find(query).populate('vendorId', 'name address phoneNumber avgReviewScore');
  
  // Apply sorting
  if (options.sortBy) {
    switch (options.sortBy) {
      case 'price_low':
        queryBuilder.sort({ 'pricing.basePrice': 1 });
        break;
      case 'price_high':
        queryBuilder.sort({ 'pricing.basePrice': -1 });
        break;
      case 'newest':
        queryBuilder.sort({ createdAt: -1 });
        break;
      case 'rating':
        queryBuilder.sort({ 'vendorId.avgReviewScore': -1 });
        break;
      default:
        queryBuilder.sort({ createdAt: -1 });
    }
  }
  
  // Apply pagination
  if (options.page && options.limit) {
    const skip = (options.page - 1) * options.limit;
    queryBuilder.skip(skip).limit(options.limit);
  }
  
  return queryBuilder;
};

// Static method for advanced location-based search
productBaseSchema.statics.searchByLocationAndCriteria = function(searchParams) {
  const {
    city,
    productType,
    category,
    priceRange,
    deliveryOptions,
    searchText,
    sortBy = 'newest',
    page = 1,
    limit = 10
  } = searchParams;
  
  const query = { status: 'active' };
  
  // Location filtering
  if (city) {
    query.$or = [
      { 'deliveryInfo.areas': city },
      { 'deliveryInfo.areas': { $size: 0 } }
    ];
  }
  
  // Product type filtering
  if (productType) {
    query.productType = productType;
  }
  
  // Category filtering
  if (category) {
    query.category = category;
  }
  
  // Price range filtering
  if (priceRange) {
    if (priceRange.min !== undefined) {
      query['pricing.basePrice'] = { $gte: priceRange.min };
    }
    if (priceRange.max !== undefined) {
      query['pricing.basePrice'] = { 
        ...query['pricing.basePrice'], 
        $lte: priceRange.max 
      };
    }
  }
  
  // Delivery options filtering
  if (deliveryOptions && deliveryOptions.length > 0) {
    query['deliveryInfo.options'] = { $in: deliveryOptions };
  }
  
  // Text search
  if (searchText) {
    query.$text = { $search: searchText };
  }
  
  const queryBuilder = this.find(query)
    .populate('vendorId', 'name address phoneNumber avgReviewScore locations');
  
  // Apply sorting
  switch (sortBy) {
    case 'price_low':
      queryBuilder.sort({ 'pricing.basePrice': 1 });
      break;
    case 'price_high':
      queryBuilder.sort({ 'pricing.basePrice': -1 });
      break;
    case 'newest':
      queryBuilder.sort({ createdAt: -1 });
      break;
    case 'rating':
      queryBuilder.sort({ 'vendorId.avgReviewScore': -1 });
      break;
    case 'relevance':
      if (searchText) {
        queryBuilder.sort({ score: { $meta: 'textScore' } });
      } else {
        queryBuilder.sort({ createdAt: -1 });
      }
      break;
    default:
      queryBuilder.sort({ createdAt: -1 });
  }
  
  // Apply pagination
  const skip = (page - 1) * limit;
  queryBuilder.skip(skip).limit(limit);
  
  return queryBuilder;
};

// Static method to get products count by location
productBaseSchema.statics.getLocationStats = function(city) {
  const matchStage = {
    status: 'active'
  };
  
  if (city) {
    matchStage.$or = [
      { 'deliveryInfo.areas': city },
      { 'deliveryInfo.areas': { $size: 0 } }
    ];
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$productType',
        count: { $sum: 1 },
        avgPrice: { $avg: '$pricing.basePrice' },
        minPrice: { $min: '$pricing.basePrice' },
        maxPrice: { $max: '$pricing.basePrice' }
      }
    }
  ]);
};

// Static method to find nearby vendors with products
productBaseSchema.statics.findVendorsWithProductsInLocation = function(city, options = {}) {
  const matchStage = {
    status: 'active'
  };
  
  if (city) {
    matchStage.$or = [
      { 'deliveryInfo.areas': city },
      { 'deliveryInfo.areas': { $size: 0 } }
    ];
  }
  
  if (options.productType) {
    matchStage.productType = options.productType;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'vendors',
        localField: 'vendorId',
        foreignField: '_id',
        as: 'vendor'
      }
    },
    { $unwind: '$vendor' },
    {
      $group: {
        _id: '$vendorId',
        vendor: { $first: '$vendor' },
        productCount: { $sum: 1 },
        avgPrice: { $avg: '$pricing.basePrice' },
        products: { $push: '$$ROOT' }
      }
    },
    { $sort: { 'vendor.avgReviewScore': -1, productCount: -1 } }
  ]);
};

// Base Model
const Product = mongoose.model('Product', productBaseSchema);

// Cake Discriminator Schema
const cakeSchema = new Schema({
  cakeDetails: {
    availableSizes: [{ 
      type: String, 
      enum: CAKE_SIZES, 
      required: true 
    }],
    flavors: [{ 
      type: String, 
      required: true,
      trim: true
    }],
    customizationAvailable: { 
      type: Boolean, 
      default: false 
    },
    customizationOptions: [{
      type: String,
      trim: true
    }],
    eggless: { 
      type: Boolean, 
      default: false 
    },
    sugarFree: { 
      type: Boolean, 
      default: false 
    }
  }
});

// Gift Hamper Discriminator Schema
const giftHamperSchema = new Schema({
  hamperDetails: {
    contents: [{ 
      type: String, 
      required: true,
      trim: true
    }],
    weight: { 
      type: Number, 
      min: 0,
      required: true 
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 }
    },
    packaging: {
      type: String,
      enum: ['Box', 'Basket', 'Bag', 'Custom'],
      default: 'Box'
    },
    occasion: [{
      type: String,
      enum: ['Birthday', 'Anniversary', 'Wedding', 'Corporate', 'Festival', 'Thank You', 'Other']
    }]
  }
});

// Add discriminators
const CakeProduct = Product.discriminator('Cake', cakeSchema);
const GiftHamperProduct = Product.discriminator('GiftHamper', giftHamperSchema);

// Add indexes for cake-specific fields
cakeSchema.index({ 'cakeDetails.availableSizes': 1 });
cakeSchema.index({ 'cakeDetails.flavors': 1 });
cakeSchema.index({ 'cakeDetails.customizationAvailable': 1 });
cakeSchema.index({ 'cakeDetails.eggless': 1 });
cakeSchema.index({ 'cakeDetails.sugarFree': 1 });

// Add indexes for gift hamper-specific fields
giftHamperSchema.index({ 'hamperDetails.weight': 1 });
giftHamperSchema.index({ 'hamperDetails.packaging': 1 });
giftHamperSchema.index({ 'hamperDetails.occasion': 1 });

// Cake-specific methods
cakeSchema.methods.getAvailableSizesWithPricing = function() {
  return this.cakeDetails.availableSizes.map(size => ({
    size,
    basePrice: this.pricing.basePrice,
    effectivePrice: this.effectivePrice
  }));
};

cakeSchema.methods.supportsCustomization = function() {
  return this.cakeDetails.customizationAvailable && 
         this.cakeDetails.customizationOptions && 
         this.cakeDetails.customizationOptions.length > 0;
};

// Gift Hamper-specific methods
giftHamperSchema.methods.getTotalWeight = function() {
  return this.hamperDetails.weight;
};

giftHamperSchema.methods.getContentsCount = function() {
  return this.hamperDetails.contents.length;
};

giftHamperSchema.methods.isOccasionSuitable = function(occasion) {
  return this.hamperDetails.occasion.includes(occasion) || 
         this.hamperDetails.occasion.includes('Other');
};

// Static methods for product-specific queries
Product.findCakesBySize = function(size, location, options = {}) {
  const query = {
    productType: 'Cake',
    status: 'active',
    'cakeDetails.availableSizes': size
  };
  
  if (location) {
    query.$or = [
      { 'deliveryInfo.areas': location },
      { 'deliveryInfo.areas': { $size: 0 } }
    ];
  }
  
  return this.find(query).populate('vendorId', 'name address phoneNumber avgReviewScore');
};

Product.findGiftHampersByOccasion = function(occasion, location, options = {}) {
  const query = {
    productType: 'GiftHamper',
    status: 'active',
    'hamperDetails.occasion': occasion
  };
  
  if (location) {
    query.$or = [
      { 'deliveryInfo.areas': location },
      { 'deliveryInfo.areas': { $size: 0 } }
    ];
  }
  
  if (options.maxWeight) {
    query['hamperDetails.weight'] = { $lte: options.maxWeight };
  }
  
  if (options.minWeight) {
    query['hamperDetails.weight'] = { 
      ...query['hamperDetails.weight'], 
      $gte: options.minWeight 
    };
  }
  
  return this.find(query).populate('vendorId', 'name address phoneNumber avgReviewScore');
};

module.exports = Product;