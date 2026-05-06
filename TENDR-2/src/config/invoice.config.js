const path = require('path');

/**
 * Invoice Generator Configuration
 * Contains all settings and constants for invoice generation
 */
module.exports = {
  // Cloudinary storage settings
  CLOUDINARY_FOLDER: 'invoices',
  
  // Logo path (local file)
  LOGO_PATH: path.join(__dirname, '../../assets/tendr-logo-secondary.png'),
  
  // Invoice settings
  INVOICE_NUMBER_PREFIX: 'INV',
  DEFAULT_TAX_RATE: 18,
  PAGINATION_LIMIT: 10,
  
  // PDF Layout specifications
  PDF_LAYOUT: {
    PAGE_SIZE: 'A4',
    MARGINS: {
      TOP: 50,
      BOTTOM: 50,
      LEFT: 50,
      RIGHT: 50
    },
    FONTS: {
      REGULAR: 'Helvetica',
      BOLD: 'Helvetica-Bold',
      ITALIC: 'Helvetica-Oblique',
      BOLD_ITALIC: 'Helvetica-BoldOblique'
    },
    COLORS: {
      BLACK: '#000000',
      WHITE: '#FFFFFF',
      GRAY: '#666666',
      LIGHT_GRAY: '#CCCCCC'
    },
    LOGO_SIZE: {
      WIDTH: 200,
      HEIGHT: 80
    }
  },
  
  // Company information (default values, can be overridden in API request)
  COMPANY_INFO: {
    name: 'Tendr',
    address: 'R-11/70 Raj Nagar, Ghaziabad, U.P, India',
    gstNumber: '09AAYFT2273N1Z5',
    email: 'contacttendr@gmail.com',
    bankDetails: {
      bankName: 'HDFC BANK',
      accountName: 'Tendr',
      accountNumber: '50200114536264',
      ifscCode: 'HDFC0000153'
    }
  },
  
  // Date format settings
  DATE_FORMAT: 'DD/MM/YYYY',
  
  // Currency settings
  CURRENCY: {
    SYMBOL: '₹',
    CODE: 'INR',
    DECIMAL_PLACES: 2
  },
  
  // Validation settings
  VALIDATION: {
    MAX_LINE_ITEMS: 50,
    MAX_DESCRIPTION_LENGTH: 200,
    MIN_QUANTITY: 1,
    MAX_QUANTITY: 999999,
    MIN_AMOUNT: 0,
    MAX_AMOUNT: 99999999.99
  }
};
