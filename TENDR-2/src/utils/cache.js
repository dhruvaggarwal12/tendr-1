const crypto = require('crypto');
const redisClient = require('../config/redis');
const { CACHE_TTL } = require('../constants');

// Generate cache key from request
const generateCacheKey = (req) => {
  const parts = [
    req.originalUrl,
    req.method,
    req.user ? req.user._id : 'anonymous'
  ];

  if (req.body && Object.keys(req.body).length > 0) {
    // Only include relevant parts of the body
    const relevantBody = {
      ...req.body,
      // Remove large fields that shouldn't be part of cache key
      images: undefined,
      file: undefined,
      password: undefined
    };
    parts.push(JSON.stringify(relevantBody));
  }

  // Create a hash of the parts to ensure consistent length
  return crypto
    .createHash('md5')
    .update(parts.join(':'))
    .digest('hex');
};

// Clear cache by pattern
const clearCache = async (pattern) => {
  try {
    const keys = await redisClient.keysAsync(pattern);
    if (keys.length > 0) {
      await redisClient.delAsync(...keys);
    }
  } catch (error) {
    console.error('Clear cache error:', error);
  }
};

// Cache middleware
const cache = (duration = CACHE_TTL) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const key = generateCacheKey(req);
      const cachedResponse = await redisClient.getAsync(key);

      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      }

      // Store the original res.json method
      const originalJson = res.json.bind(res);

      // Override res.json method to cache the response
      res.json = (body) => {
        redisClient.setAsync(key, JSON.stringify(body), 'EX', duration)
          .catch(error => console.error('Cache error:', error));
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

module.exports = {
  generateCacheKey,
  clearCache,
  cache
}; 