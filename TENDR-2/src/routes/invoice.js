const express = require('express');
const invoiceService = require('../services/invoiceService');
const {
  validateCreateInvoice,
  validateListInvoices,
  validateInvoiceId
} = require('../middleware/invoiceValidator');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../middleware/logger');

const router = express.Router();

/**
 * POST /api/invoices
 * Create a new invoice and generate PDF
 */
router.post(
  '/',
  validateCreateInvoice,
  asyncHandler(async (req, res) => {
    logger.info('Creating new invoice');
    
    const invoice = await invoiceService.createInvoice(req.body);
    
    return res.status(201).json({
      success: true,
      data: invoice
    });
  })
);

/**
 * GET /api/invoices/:id
 * Retrieve invoice metadata by ID
 */
router.get(
  '/:id',
  validateInvoiceId,
  asyncHandler(async (req, res) => {
    const invoiceId = req.params.id;
    logger.info(`Retrieving invoice metadata for ID: ${invoiceId}`);
    
    const invoice = await invoiceService.getInvoiceById(invoiceId);
    
    return res.status(200).json({
      success: true,
      data: invoice
    });
  })
);

/**
 * GET /api/invoices/:id/download
 * Download invoice PDF (redirect to Cloudinary URL)
 */
router.get(
  '/:id/download',
  validateInvoiceId,
  asyncHandler(async (req, res) => {
    const invoiceId = req.params.id;
    logger.info(`Downloading invoice PDF for ID: ${invoiceId}`);
    
    const invoice = await invoiceService.getInvoiceById(invoiceId);
    
    // Redirect to Cloudinary URL for PDF download
    if (invoice.pdfUrl) {
      logger.info(`Redirecting to Cloudinary URL: ${invoice.pdfUrl}`);
      return res.redirect(302, invoice.pdfUrl);
    }
    
    // Fallback if PDF URL is missing
    const error = new Error('PDF file not found for this invoice');
    error.statusCode = 404;
    error.code = 'PDF_NOT_FOUND';
    throw error;
  })
);

/**
 * GET /api/invoices
 * List all invoices with pagination and filtering
 */
router.get(
  '/',
  validateListInvoices,
  asyncHandler(async (req, res) => {
    const { page, limit, startDate, endDate, customerName } = req.query;
    
    logger.info('Listing invoices with filters:', { page, limit, startDate, endDate, customerName });
    
    const filters = {
      startDate,
      endDate,
      customerName
    };
    
    const pagination = {
      page,
      limit
    };
    
    const result = await invoiceService.listInvoices(filters, pagination);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  })
);

module.exports = router;
