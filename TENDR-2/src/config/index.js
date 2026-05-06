require('dotenv').config();

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // MongoDB Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/event-marketplace',
  MONGODB_USER: process.env.MONGODB_USER,
  MONGODB_PASSWORD: process.env.MONGODB_PASSWORD,
  
  // Redis Configuration
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_USERNAME: process.env.REDIS_USERNAME || 'default',
  REDIS_URL: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
 MESSAGE_CENTRAL_CUSTOMER_ID: process.env.MESSAGE_CENTRAL_CUSTOMER_ID || 'C-4397C80258E24D9',
  MESSAGE_CENTRAL_AUTH_TOKEN:  process.env.MESSAGE_CENTRAL_AUTH_TOKEN  || 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLTQzOTdDODAyNThFMjREOSIsImlhdCI6MTc0ODg4NjQ2MiwiZXhwIjoxOTA2NTY2NDYyfQ.HBNfYLKSMPCvKongorbOkFPH0uFdpUsf6w2ukzySFgpqduL858qd55cBaK3y8vzXMofqG-IEsyRClgYYzb52iA',

  
  // Payment Gateway Configuration (Razorpay)
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  
  // File Upload
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
  MAX_FILES: process.env.MAX_FILES || 10,
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  
  // Cache Configuration
  CACHE_TTL: process.env.CACHE_TTL || 3600, // 1 hour
  CACHE_ENABLED: process.env.CACHE_ENABLED === 'true',
  
  // CORS Configuration
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || 'logs/app.log',
  
  // Analytics
  ANALYTICS_ENABLED: process.env.ANALYTICS_ENABLED === 'true',
  ANALYTICS_RETENTION_DAYS: parseInt(process.env.ANALYTICS_RETENTION_DAYS) || 90,
  
  // Security
  SESSION_SECRET: process.env.SESSION_SECRET,
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  HELMET_ENABLED: process.env.HELMET_ENABLED === 'true',
  
  // Socket.IO Configuration
  SOCKET_IO_PORT: process.env.SOCKET_IO_PORT || 3001,
  SOCKET_IO_CORS_ORIGIN: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3000',
  
  // Error Reporting
  SENTRY_DSN: process.env.SENTRY_DSN,
  ERROR_REPORTING_ENABLED: process.env.ERROR_REPORTING_ENABLED === 'true',
  
  // Admin Configuration
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
}; 