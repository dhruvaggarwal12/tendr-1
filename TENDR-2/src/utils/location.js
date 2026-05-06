const { DEFAULTS, SUPPORTED_CITIES } = require('../constants');

const parseLocation = (query) => {
  if (!query['location.coordinates'] && !query['location.city']) {
    return null;
  }
  const location = {};
  if (query['location.coordinates']) {
    const coordinates = Array.isArray(query['location.coordinates']) 
      ? query['location.coordinates'] 
      : JSON.parse(query['location.coordinates']);
    location.coordinates = coordinates;
    location.radius = parseInt(query['location.radius']) || DEFAULTS.LOCATION_RADIUS;
  }
  if (query['location.city']) {
    location.city = query['location.city'];
  }
  return location;
};

const buildGeoQuery = (coordinates, maxDistance = DEFAULTS.LOCATION_RADIUS) => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    return null;
  }
  return {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: coordinates
      },
      $maxDistance: maxDistance
    }
  };
};

/**
 * Validate if a city is supported
 * @param {string} city - City name to validate
 * @returns {boolean} True if city is supported
 */
const isSupportedCity = (city) => {
  return SUPPORTED_CITIES.includes(city);
};

/**
 * Build location filter for product queries
 * @param {string} city - City name
 * @returns {Object} MongoDB query object for location filtering
 */
const buildProductLocationQuery = (city) => {
  if (!city || !isSupportedCity(city)) {
    return {};
  }

  return {
    $or: [
      { 'deliveryInfo.areas': city },
      { 'deliveryInfo.areas': { $size: 0 } }, // Products available everywhere
      { 'deliveryInfo.areas': { $exists: false } } // Products without specific delivery areas
    ]
  };
};

/**
 * Build location filter for vendor queries
 * @param {string} city - City name
 * @returns {Object} MongoDB query object for vendor location filtering
 */
const buildVendorLocationQuery = (city) => {
  if (!city || !isSupportedCity(city)) {
    return {};
  }

  return {
    locations: { $in: [city] }
  };
};

/**
 * Get all supported cities
 * @returns {Array} Array of supported city names
 */
const getSupportedCities = () => {
  return [...SUPPORTED_CITIES];
};

/**
 * Validate delivery areas for products
 * @param {Array} areas - Array of delivery area names
 * @returns {Object} Validation result with isValid and invalidAreas
 */
const validateDeliveryAreas = (areas) => {
  if (!Array.isArray(areas)) {
    return { isValid: false, invalidAreas: [], error: 'Delivery areas must be an array' };
  }

  const invalidAreas = areas.filter(area => !isSupportedCity(area));
  
  return {
    isValid: invalidAreas.length === 0,
    invalidAreas,
    validAreas: areas.filter(area => isSupportedCity(area))
  };
};

module.exports = { 
  parseLocation, 
  buildGeoQuery,
  isSupportedCity,
  buildProductLocationQuery,
  buildVendorLocationQuery,
  getSupportedCities,
  validateDeliveryAreas
}; 