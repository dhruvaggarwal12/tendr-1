const formatError = (error) => {
  if (error.name === 'ValidationError') {
    return {
      status: 400,
      message: 'Validation Error',
      errors: Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }))
    };
  }
  if (error.name === 'MongoError' && error.code === 11000) {
    return {
      status: 409,
      message: 'Duplicate Entry',
      error: error.message
    };
  }
  return {
    status: 500,
    message: 'Internal Server Error',
    error: error.message
  };
};

const formatSuccess = (data, message = 'Success') => ({
  status: 'success',
  message,
  data
});

// Enhanced error handling for gift hamper and cake functionality
const createBusinessLogicError = (message, statusCode = 400, errorCode = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errorCode = errorCode;
  error.name = 'BusinessLogicError';
  return error;
};

const createValidationError = (field, message, value = null) => {
  const error = new Error(`Validation failed for field: ${field}`);
  error.statusCode = 400;
  error.name = 'FieldValidationError';
  error.field = field;
  error.fieldMessage = message;
  error.value = value;
  return error;
};

const formatBusinessLogicError = (error) => {
  return {
    status: 'error',
    message: error.message,
    errorCode: error.errorCode || 'BUSINESS_LOGIC_ERROR',
    statusCode: error.statusCode || 400,
    timestamp: new Date().toISOString()
  };
};

const formatFieldValidationError = (error) => {
  return {
    status: 'error',
    message: 'Validation Error',
    errors: [{
      field: error.field,
      message: error.fieldMessage,
      value: error.value
    }],
    statusCode: 400,
    timestamp: new Date().toISOString()
  };
};

const formatApiResponse = (success, data = null, message = null, errors = null, statusCode = 200) => {
  const response = {
    success,
    timestamp: new Date().toISOString()
  };

  if (message) response.message = message;
  if (data) response.data = data;
  if (errors) response.errors = errors;
  if (!success) response.statusCode = statusCode;

  return response;
};

// Common business logic error types for gift hamper and cake vendors
const BUSINESS_ERRORS = {
  VENDOR_NOT_APPROVED: {
    message: 'Only approved vendors can perform this action',
    code: 'VENDOR_NOT_APPROVED',
    statusCode: 403
  },
  VENDOR_SUSPENDED: {
    message: 'Your vendor account is currently suspended',
    code: 'VENDOR_SUSPENDED', 
    statusCode: 403
  },
  PRODUCT_LIMIT_EXCEEDED: {
    message: 'Product limit exceeded for your vendor tier',
    code: 'PRODUCT_LIMIT_EXCEEDED',
    statusCode: 429
  },
  INVALID_VENDOR_PRODUCT_ASSOCIATION: {
    message: 'You can only manage your own products',
    code: 'INVALID_VENDOR_PRODUCT_ASSOCIATION',
    statusCode: 403
  },
  PRODUCT_NOT_FOUND: {
    message: 'Product not found or no longer available',
    code: 'PRODUCT_NOT_FOUND',
    statusCode: 404
  },
  VENDOR_NOT_FOUND: {
    message: 'Vendor not found',
    code: 'VENDOR_NOT_FOUND',
    statusCode: 404
  },
  DUPLICATE_VENDOR_REGISTRATION: {
    message: 'A vendor with this information already exists',
    code: 'DUPLICATE_VENDOR_REGISTRATION',
    statusCode: 409
  },
  PHONE_NOT_VERIFIED: {
    message: 'Phone number must be verified before registration',
    code: 'PHONE_NOT_VERIFIED',
    statusCode: 400
  },
  INVALID_LOCATION: {
    message: 'Invalid location specified',
    code: 'INVALID_LOCATION',
    statusCode: 400
  },
  IMAGE_UPLOAD_FAILED: {
    message: 'Failed to upload one or more images',
    code: 'IMAGE_UPLOAD_FAILED',
    statusCode: 422
  },
  IMAGE_LIMIT_EXCEEDED: {
    message: 'Maximum image limit exceeded',
    code: 'IMAGE_LIMIT_EXCEEDED',
    statusCode: 400
  },
  INVALID_PRODUCT_STATUS: {
    message: 'Invalid product status for this operation',
    code: 'INVALID_PRODUCT_STATUS',
    statusCode: 400
  }
};

module.exports = { 
  formatError, 
  formatSuccess,
  createBusinessLogicError,
  createValidationError,
  formatBusinessLogicError,
  formatFieldValidationError,
  formatApiResponse,
  BUSINESS_ERRORS
}; 