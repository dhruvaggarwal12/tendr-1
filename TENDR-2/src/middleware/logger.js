const winston = require('winston');
const morgan = require('morgan');
const config = require('../config');

// Configure Winston logger
const logger = winston.createLogger({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// Create custom Morgan token for response time
morgan.token('response-time', (req, res) => {
  if (!req._startAt || !res._startAt) {
    return '';
  }
  
  const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
    (res._startAt[1] - req._startAt[1]) * 1e-6;
  
  return ms.toFixed(3);
});

// Create custom Morgan token for user ID
morgan.token('user-id', (req) => {
  return req.user ? req.user._id : 'anonymous';
});

// Create custom Morgan format
const morganFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

// Request logging middleware
const requestLogger = morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  },
  skip: (req) => {
    // Skip logging for health check endpoints
    return req.url === '/health' || req.url === '/ping';
  }
});

// Performance logging middleware
const performanceLogger = (req, res, next) => {
  const start = process.hrtime();

  // Log when the response is finished
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1e6;

    logger.debug('Performance metrics', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration.toFixed(3)}ms`,
      user: req.user ? req.user._id : 'anonymous'
    });
  });

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error('Error occurred', {
    error: {
      message: err.message,
      stack: err.stack
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      query: req.query,
      params: req.params,
      user: req.user ? req.user._id : 'anonymous',
      ip: req.ip
    }
  });

  next(err);
};

// Export logger instance and middleware
module.exports = {
  logger,
  requestLogger,
  performanceLogger,
  errorLogger
}; 