const { logger } = require('./logger');
const { formatBusinessLogicError, formatFieldValidationError, formatApiResponse } = require('../utils/response');

// Central error handling middleware
const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    user: req.user ? req.user._id : 'anonymous',
    vendor: req.vendor ? req.vendor._id : null,
    errorType: err.name,
    statusCode: err.statusCode
  });

  // Handle business logic errors (gift hamper/cake specific)
  if (err.name === 'BusinessLogicError') {
    const errorResponse = formatBusinessLogicError(err);
    return res.status(err.statusCode || 400).json(errorResponse);
  }

  // Handle field validation errors
  if (err.name === 'FieldValidationError') {
    const errorResponse = formatFieldValidationError(err);
    return res.status(400).json(errorResponse);
  }

  // Handle Mongoose validation errors with enhanced formatting
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
      value: error.value,
      kind: error.kind
    }));

    return res.status(400).json(formatApiResponse(
      false,
      null,
      'Validation failed',
      errors,
      400
    ));
  }

  // Handle MongoDB duplicate key errors
  if (err.name === 'MongoError' && err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const value = err.keyValue[field];
    
    return res.status(409).json(formatApiResponse(
      false,
      null,
      'Duplicate entry detected',
      [{
        field: field,
        message: `${field} '${value}' already exists`,
        value: value,
        kind: 'duplicate'
      }],
      409
    ));
  }

  // Handle MongoDB cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return res.status(400).json(formatApiResponse(
      false,
      null,
      'Invalid data format',
      [{
        field: err.path,
        message: `Invalid ${err.kind} format for ${err.path}`,
        value: err.value,
        kind: 'cast_error'
      }],
      400
    ));
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(formatApiResponse(
      false,
      null,
      'Invalid authentication token',
      null,
      401
    ));
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(formatApiResponse(
      false,
      null,
      'Authentication token has expired',
      null,
      401
    ));
  }

  // Handle authorization errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json(formatApiResponse(
      false,
      null,
      err.message || 'Unauthorized access',
      null,
      401
    ));
  }

  // Handle not found errors
  if (err.name === 'NotFoundError') {
    return res.status(404).json(formatApiResponse(
      false,
      null,
      err.message || 'Resource not found',
      null,
      404
    ));
  }

  // Handle invoice-specific errors
  if (err.code === 'INVOICE_NOT_FOUND') {
    return res.status(404).json(formatApiResponse(
      false,
      null,
      err.message || 'Invoice not found',
      null,
      404
    ));
  }

  // Handle PDF not found errors
  if (err.code === 'PDF_NOT_FOUND') {
    return res.status(404).json(formatApiResponse(
      false,
      null,
      err.message || 'PDF file not found',
      null,
      404
    ));
  }

  // Handle PDF generation errors
  if (err.message && err.message.includes('PDF generation')) {
    logger.error('PDF generation error:', {
      message: err.message,
      stack: err.stack
    });
    
    return res.status(500).json(formatApiResponse(
      false,
      null,
      'Failed to generate PDF invoice. Please try again later.',
      null,
      500
    ));
  }

  // Handle Cloudinary upload/storage errors
  if (err.message && (err.message.includes('Cloudinary') || err.message.includes('upload failed'))) {
    logger.error('Cloudinary storage error:', {
      message: err.message,
      stack: err.stack
    });
    
    return res.status(500).json(formatApiResponse(
      false,
      null,
      'Failed to store invoice PDF. Please try again later.',
      null,
      500
    ));
  }

  // Handle rate limiting errors
  if (err.status === 429) {
    return res.status(429).json(formatApiResponse(
      false,
      null,
      'Too many requests. Please try again later.',
      null,
      429
    ));
  }

  // Handle file upload errors (multer)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json(formatApiResponse(
      false,
      null,
      'File size too large. Maximum size allowed is 10MB per file.',
      [{
        field: 'file',
        message: 'File size exceeds limit',
        kind: 'file_size_error'
      }],
      413
    ));
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json(formatApiResponse(
      false,
      null,
      'Too many files uploaded. Maximum 10 files allowed.',
      [{
        field: 'files',
        message: 'File count exceeds limit',
        kind: 'file_count_error'
      }],
      400
    ));
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  
  // In production, hide sensitive error details
  let message = err.message;
  if (process.env.NODE_ENV === 'production') {
    // Only show generic messages for server errors
    if (statusCode >= 500) {
      message = 'An unexpected error occurred. Please try again later.';
    }
    // For client errors (4xx), we can show the message as it's usually safe
  }

  // Log the full error for debugging
  if (statusCode >= 500) {
    logger.error('Unhandled server error:', {
      message: err.message,
      stack: err.stack,
      statusCode
    });
  }

  res.status(statusCode).json(formatApiResponse(
    false,
    null,
    message,
    null,
    statusCode
  ));
};

// Async handler wrapper to catch promise rejections
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 404,
    message: 'Resource not found',
    error: `${req.method} ${req.originalUrl} not found`
  });
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler
}; 