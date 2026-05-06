const Joi = require('joi');

// Custom GST number validator
const gstNumberValidator = (value, helpers) => {
  // GST format: 2 digits (state code) + 10 alphanumeric (PAN) + 1 digit (entity number) + 1 letter (Z) + 1 alphanumeric (checksum)
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  
  if (!gstRegex.test(value)) {
    return helpers.error('any.invalid');
  }
  
  return value;
};

// Custom date validator (YYYY-MM-DD format)
const dateFormatValidator = (value, helpers) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!dateRegex.test(value)) {
    return helpers.error('any.invalid');
  }
  
  // Validate it's a real date
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return helpers.error('any.invalid');
  }
  
  return value;
};

// Address schema
const addressSchema = Joi.object({
  line1: Joi.string().trim().required().messages({
    'string.empty': 'Address line 1 is required',
    'any.required': 'Address line 1 is required'
  }),
  line2: Joi.string().trim().allow('').optional(),
  city: Joi.string().trim().required().messages({
    'string.empty': 'City is required',
    'any.required': 'City is required'
  }),
  state: Joi.string().trim().required().messages({
    'string.empty': 'State is required',
    'any.required': 'State is required'
  }),
  pincode: Joi.string().trim().required().messages({
    'string.empty': 'Pincode is required',
    'any.required': 'Pincode is required'
  })
});

// Customer schema
const customerSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Customer name is required',
    'any.required': 'Customer name is required'
  }),
  gstNumber: Joi.string().trim().custom(gstNumberValidator).optional().messages({
    'any.invalid': 'Invalid GST number format. Expected format: 09AAACN3473H1ZE'
  }),
  address: addressSchema.required()
});

// Line item schema
const lineItemSchema = Joi.object({
  description: Joi.string().trim().required().messages({
    'string.empty': 'Line item description is required',
    'any.required': 'Line item description is required'
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Quantity must be a number',
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required'
  }),
  total: Joi.number().min(0).required().messages({
    'number.base': 'Total must be a number',
    'number.min': 'Total must be a non-negative number',
    'any.required': 'Total is required'
  })
});

// Bank details schema
const bankDetailsSchema = Joi.object({
  bankName: Joi.string().trim().required(),
  accountName: Joi.string().trim().required(),
  accountNumber: Joi.string().trim().required(),
  ifscCode: Joi.string().trim().required()
});

// Company info schema
const companyInfoSchema = Joi.object({
  name: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
  gstNumber: Joi.string().trim().custom(gstNumberValidator).required().messages({
    'any.invalid': 'Invalid company GST number format'
  }),
  email: Joi.string().trim().email().required(),
  bankDetails: bankDetailsSchema.required()
});

// Main invoice creation schema
const createInvoiceSchema = Joi.object({
  customer: customerSchema.required(),
  invoiceNumber: Joi.string().trim().optional(),
  invoiceDate: Joi.string().custom(dateFormatValidator).required().messages({
    'any.invalid': 'Invalid date format. Expected format: YYYY-MM-DD',
    'any.required': 'Invoice date is required'
  }),
  lineItems: Joi.array().items(lineItemSchema).min(1).required().messages({
    'array.min': 'At least one line item is required',
    'any.required': 'Line items are required'
  }),
  taxRate: Joi.number().min(0).max(100).required().messages({
    'number.base': 'Tax rate must be a number',
    'number.min': 'Tax rate must be at least 0',
    'number.max': 'Tax rate cannot exceed 100',
    'any.required': 'Tax rate is required'
  }),
  discount: Joi.number().min(0).optional().default(0).messages({
    'number.base': 'Discount must be a number',
    'number.min': 'Discount must be a non-negative number'
  }),
  companyInfo: companyInfoSchema.required()
});

// Validation middleware
const validateCreateInvoice = (req, res, next) => {
  const { error, value } = createInvoiceSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid invoice data',
        details: errors
      }
    });
  }

  // Replace request body with validated and sanitized data
  req.body = value;
  next();
};

// Query parameter validation for listing invoices
const listInvoicesSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  startDate: Joi.string().custom(dateFormatValidator).optional().messages({
    'any.invalid': 'Invalid start date format. Expected format: YYYY-MM-DD'
  }),
  endDate: Joi.string().custom(dateFormatValidator).optional().messages({
    'any.invalid': 'Invalid end date format. Expected format: YYYY-MM-DD'
  }),
  customerName: Joi.string().trim().optional()
});

const validateListInvoices = (req, res, next) => {
  const { error, value } = listInvoicesSchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
        details: errors
      }
    });
  }

  // Replace query with validated data
  req.query = value;
  next();
};

// MongoDB ObjectId validation
const validateInvoiceId = (req, res, next) => {
  const idSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/).required();
  
  const { error } = idSchema.validate(req.params.id);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid invoice ID format'
      }
    });
  }
  
  next();
};

module.exports = {
  validateCreateInvoice,
  validateListInvoices,
  validateInvoiceId,
  // Export schemas for testing
  createInvoiceSchema,
  listInvoicesSchema
};
