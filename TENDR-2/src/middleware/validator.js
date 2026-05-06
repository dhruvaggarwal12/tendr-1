const { body, param, validationResult, query } = require('express-validator');
const { EVENT_TYPES, CURRENCIES, SERVICE_TYPES, SUPPORTED_CITIES, DJ_SETUP_OPTIONS, DJ_EVENT_TYPES, DECORATOR_VENUE_COVERAGE, DECORATOR_THEMES, CATERER_CUISINE, CATERER_SERVICE_STYLE, CATERER_MENU_TYPE, CAKE_SIZES, DELIVERY_OPTIONS, PRODUCT_CATEGORIES } = require('../constants');

// Common validation chains
const phoneNumberValidation = body('phoneNumber')
  .trim()
  .matches(/^[0-9]{10}$/)
  .withMessage('Invalid phone number');

const emailValidation = body('email')
  .optional()
  .trim()
  .isEmail()
  .normalizeEmail()
  .withMessage('Invalid email format');

const nameValidation = body('name')
  .optional()
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters');

// Auth validation
const authValidation = {
  requestOTP: [
    phoneNumberValidation,
    body('purpose')
      .isIn(['signup', 'login', 'reset-password'])
      .withMessage('Invalid purpose')
  ],
  verifyOTP: [
    phoneNumberValidation,
    body('otp')
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('OTP must be 6 digits'),
    body('purpose')
      .isIn(['signup', 'login', 'reset-password'])
      .withMessage('Invalid purpose')
  ]
};

// Consumer validation
const consumerValidation = {
  updateProfile: [
    nameValidation,
    emailValidation,
    body('profilePhotoUrl')
      .optional()
      .isURL()
      .withMessage('Invalid profile photo URL'),
    body('phoneNumber')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Invalid phone number')
  ],
  getById: [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID')
  ],
  signup: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phoneNumber').matches(/^[0-9]{10}$/).withMessage('Invalid phone number'),
    body('address.street').trim().notEmpty().withMessage('Street is required'),
    body('address.city').trim().notEmpty().withMessage('City is required'),
    body('address.state').trim().notEmpty().withMessage('State is required')
  ],
  login: [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ]
};

// Common validation rules
const commonValidations = {
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],

  location: [
    query('location.coordinates')
      .optional()
      .custom((value) => {
        try {
          const coords = Array.isArray(value) ? value : JSON.parse(value);
          if (!Array.isArray(coords) || coords.length !== 2) {
            throw new Error('Invalid coordinates format');
          }
          const [longitude, latitude] = coords;
          if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
            throw new Error('Coordinates out of range');
          }
          return true;
        } catch (error) {
          throw new Error('Invalid coordinates format');
        }
      }),
    query('location.radius')
      .optional()
      .isInt({ min: 1, max: 100000 })
      .withMessage('Radius must be between 1 and 100000 meters')
  ],

  timeframe: [
    query('timeframe')
      .optional()
      .matches(/^[1-9]\d*[dwy]$/)
      .withMessage('Timeframe must be in format: number + d/w/y (e.g., 7d, 2w, 1y)')
  ]
};

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: errors.array()
    });
  }
  next();
};

// Vendor-specific validation rules
const vendorValidations = {
  create: [
    body('displayName')
      .trim()
      .notEmpty()
      .withMessage('Display name is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Display name must be between 3 and 100 characters'),

    body('shortBio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Short bio must not exceed 500 characters'),

    body('location.coordinates')
      .isArray()
      .withMessage('Coordinates must be an array')
      .custom((coords) => {
        if (coords.length !== 2) {
          throw new Error('Coordinates must contain exactly 2 values');
        }
        const [longitude, latitude] = coords;
        if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
          throw new Error('Invalid coordinates range');
        }
        return true;
      }),

    body('location.address').trim().notEmpty().withMessage('Address is required'),
    body('location.city').trim().notEmpty().withMessage('City is required'),
    body('location.state').trim().notEmpty().withMessage('State is required'),
    body('location.country').trim().notEmpty().withMessage('Country is required'),
    body('location.zipCode').trim().notEmpty().withMessage('Zip code is required'),

    body('eventTypes')
      .isArray()
      .withMessage('Event types must be an array')
      .custom((types) => {
        if (!types.every(type => Object.values(EVENT_TYPES).includes(type))) {
          throw new Error('Invalid event type');
        }
        return true;
      }),

    body('capacity.min')
      .isInt({ min: 1 })
      .withMessage('Minimum capacity must be at least 1'),
    
    body('capacity.max')
      .isInt({ min: 1 })
      .custom((max, { req }) => {
        if (max < req.body.capacity.min) {
          throw new Error('Maximum capacity must be greater than minimum capacity');
        }
        return true;
      }),

    body('pricing.baseRate')
      .isNumeric()
      .withMessage('Base rate must be a number')
      .custom((value) => value >= 0),

    body('pricing.perPersonRate')
      .isNumeric()
      .withMessage('Per person rate must be a number')
      .custom((value) => value >= 0),

    body('pricing.currency')
      .isIn(Object.values(CURRENCIES))
      .withMessage('Invalid currency'),

    body('services')
      .optional()
      .isObject()
      .custom((services) => {
        const validServices = Object.values(SERVICE_TYPES);
        const invalidServices = Object.keys(services).filter(
          service => !validServices.includes(service)
        );
        if (invalidServices.length > 0) {
          throw new Error(`Invalid services: ${invalidServices.join(', ')}`);
        }
        return true;
      })
  ],

  update: [
    param('id').isMongoId().withMessage('Invalid vendor ID'),
    body('name').optional().trim().notEmpty().withMessage('Name is required'),
    body('gstNumber').optional().trim().notEmpty().withMessage('GST number is required'),
    body('teamSize').optional().isInt({ min: 1 }).withMessage('Team size is required'),
    body('phoneNumber').optional().matches(/^[0-9]{10}$/).withMessage('Invalid phone number'),
    body('locations').optional().isArray({ min: 1 }).withMessage('At least one location is required')
      .custom((arr) => arr.every(city => SUPPORTED_CITIES.includes(city))).withMessage('All locations must be supported cities'),
    body('serviceType').optional().isIn(['DJ', 'Decorator', 'Photographer', 'Caterer']).withMessage('Invalid service type'),
    body('address.street').optional().trim().notEmpty().withMessage('Street is required'),
    body('address.city').optional().isIn(SUPPORTED_CITIES).withMessage('City must be one of the supported cities'),
    body('address.state').optional().trim().notEmpty().withMessage('State is required'),
    body('yearsOfExperience').optional().isInt({ min: 0 }).withMessage('Years of experience must be a non-negative integer'),
    body('reviews').optional().isArray().withMessage('Reviews must be an array'),
    body('panNumber').optional().notEmpty().withMessage('PAN number is required'),
    body('upiId').optional().trim(),
    // DJ
    body('setup').optional().isIn(DJ_SETUP_OPTIONS).withMessage('Invalid DJ setup'),
    body('lightsIncluded').optional().isBoolean(),
    body('eventTypes').optional().isIn(DJ_EVENT_TYPES).withMessage('Invalid DJ event type'),
    // Decorator
    body('venueCoverage').optional().isIn(DECORATOR_VENUE_COVERAGE).withMessage('Invalid venue coverage'),
    body('themes').optional().isIn(DECORATOR_THEMES).withMessage('Invalid theme value'),
    // Photographer
    body('photographersCount').optional().isInt({ min: 0 }),
    body('videographersCount').optional().isInt({ min: 0 }),
    body('socialMedia').optional().isBoolean(),
    body('album').optional().isBoolean(),
    // Caterer
    body('cuisine').optional().isIn(CATERER_CUISINE).withMessage('Invalid cuisine'),
    body('serviceStyle').optional().isIn(CATERER_SERVICE_STYLE).withMessage('Invalid service style'),
    body('menuType').optional().isIn(CATERER_MENU_TYPE).withMessage('Invalid menu type'),
    body('beverages').optional().isBoolean()
  ],

  // Gift Hamper vendor registration
  giftHamperRegistration: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('gstNumber').trim().notEmpty().withMessage('GST number is required'),
    body('teamSize').isInt({ min: 1 }).withMessage('Team size must be at least 1'),
    body('locations').isArray({ min: 1 }).withMessage('At least one location is required')
      .custom((arr) => arr.every(city => SUPPORTED_CITIES.includes(city))).withMessage('All locations must be supported cities'),
    body('phoneNumber').matches(/^[0-9]{10}$/).withMessage('Invalid phone number'),
    body('address.street').trim().notEmpty().withMessage('Street is required'),
    body('address.city').isIn(SUPPORTED_CITIES).withMessage('City must be one of the supported cities'),
    body('address.state').trim().notEmpty().withMessage('State is required'),
    body('yearsOfExperience').isInt({ min: 0 }).withMessage('Years of experience must be a non-negative integer'),
    body('panNumber').trim().notEmpty().withMessage('PAN number is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('deliveryOptions').isArray({ min: 1 }).withMessage('At least one delivery option is required')
      .custom((arr) => arr.every(option => DELIVERY_OPTIONS.includes(option))).withMessage('Invalid delivery option'),
    body('panIndiaDelivery').isBoolean().withMessage('Pan India delivery must be a boolean'),
    body('deliveryAreas').optional().isArray().withMessage('Delivery areas must be an array')
      .custom((arr, { req }) => {
        if (!req.body.panIndiaDelivery && (!arr || arr.length === 0)) {
          throw new Error('Delivery areas are required when pan India delivery is false');
        }
        if (arr && !arr.every(city => SUPPORTED_CITIES.includes(city))) {
          throw new Error('All delivery areas must be supported cities');
        }
        return true;
      }),
    body('maxDeliveryCapacity').isInt({ min: 1 }).withMessage('Max delivery capacity must be at least 1'),
    body('deliveryTimeRange.min').isInt({ min: 1 }).withMessage('Minimum delivery time must be at least 1 day'),
    body('deliveryTimeRange.max').isInt({ min: 1 }).withMessage('Maximum delivery time must be at least 1 day')
      .custom((max, { req }) => {
        if (max < req.body.deliveryTimeRange?.min) {
          throw new Error('Maximum delivery time must be greater than or equal to minimum delivery time');
        }
        return true;
      })
  ],

  // Cake vendor registration
  cakeRegistration: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('gstNumber').trim().notEmpty().withMessage('GST number is required'),
    body('teamSize').isInt({ min: 1 }).withMessage('Team size must be at least 1'),
    body('locations').isArray({ min: 1 }).withMessage('At least one location is required')
      .custom((arr) => arr.every(city => SUPPORTED_CITIES.includes(city))).withMessage('All locations must be supported cities'),
    body('phoneNumber').matches(/^[0-9]{10}$/).withMessage('Invalid phone number'),
    body('address.street').trim().notEmpty().withMessage('Street is required'),
    body('address.city').isIn(SUPPORTED_CITIES).withMessage('City must be one of the supported cities'),
    body('address.state').trim().notEmpty().withMessage('State is required'),
    body('yearsOfExperience').isInt({ min: 0 }).withMessage('Years of experience must be a non-negative integer'),
    body('panNumber').trim().notEmpty().withMessage('PAN number is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('availableSizes').isArray({ min: 1 }).withMessage('At least one cake size is required')
      .custom((arr) => arr.every(size => CAKE_SIZES.includes(size))).withMessage('Invalid cake size'),
    body('customFlavors').optional().isArray().withMessage('Custom flavors must be an array'),
    body('pricesNegotiable').isBoolean().withMessage('Prices negotiable must be a boolean'),
    body('deliveryOptions').isArray({ min: 1 }).withMessage('At least one delivery option is required')
      .custom((arr) => arr.every(option => DELIVERY_OPTIONS.includes(option))).withMessage('Invalid delivery option'),
    body('pickupAddress').optional().trim().withMessage('Pickup address must be a string')
      .custom((address, { req }) => {
        if (req.body.deliveryOptions?.includes('Pickup Only') || req.body.deliveryOptions?.includes('Both')) {
          if (!address || address.trim() === '') {
            throw new Error('Pickup address is required when pickup option is available');
          }
        }
        return true;
      })
  ]
};

// Export all validation rules and middleware
module.exports = {
  validateRequest,
  authValidation,
  consumerValidation,
  commonValidations,
  vendorValidations
}; 