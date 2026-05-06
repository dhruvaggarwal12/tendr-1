const Invoice = require('../models/Invoice');
const pdfGenerator = require('./pdfGenerator');
const storageService = require('./invoiceStorage');
const { calculateInvoiceAmounts } = require('../utils/invoiceCalculations');
const invoiceConfig = require('../config/invoice.config');
const logger = require('../middleware/logger');

/**
 * InvoiceService
 * Handles business logic for invoice operations
 */
class InvoiceService {
  /**
   * Create a new invoice with full workflow
   * @param {Object} invoiceData - Invoice data from request
   * @returns {Promise<Object>} Created invoice with PDF URL
   */
  async createInvoice(invoiceData) {
    try {
      // Generate invoice number if not provided
      const invoiceNumber = invoiceData.invoiceNumber || await this.generateInvoiceNumber();
      
      // Set invoice date if not provided
      const invoiceDate = invoiceData.invoiceDate || new Date();
      
      // Calculate amounts using utility functions
      const amounts = calculateInvoiceAmounts(
        invoiceData.lineItems,
        invoiceData.taxRate || invoiceConfig.DEFAULT_TAX_RATE,
        invoiceData.discount || 0
      );
      
      // Merge company info with defaults
      const companyInfo = {
        ...invoiceConfig.COMPANY_INFO,
        ...invoiceData.companyInfo
      };
      
      // Prepare complete invoice data for PDF generation
      const completeInvoiceData = {
        invoiceNumber,
        invoiceDate,
        customer: invoiceData.customer,
        lineItems: invoiceData.lineItems,
        subtotal: amounts.subtotal,
        taxRate: amounts.taxRate,
        taxAmount: amounts.taxAmount,
        discount: amounts.discount,
        total: amounts.total,
        companyInfo
      };
      
      // Generate PDF buffer using PDFGeneratorService
      logger.info(`Generating PDF for invoice ${invoiceNumber}`);
      const pdfBuffer = await pdfGenerator.generateInvoicePDF(completeInvoiceData);
      
      // Upload PDF to Cloudinary using StorageService
      logger.info(`Uploading PDF to Cloudinary for invoice ${invoiceNumber}`);
      const { url: pdfUrl, publicId: pdfPublicId } = await storageService.uploadPDF(
        pdfBuffer,
        invoiceNumber
      );
      
      // Store invoice metadata in MongoDB
      const invoice = new Invoice({
        ...completeInvoiceData,
        pdfUrl,
        pdfPublicId
      });
      
      await invoice.save();
      
      logger.info(`Invoice ${invoiceNumber} created successfully with ID: ${invoice._id}`);
      
      return {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        pdfUrl: invoice.pdfUrl,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        discount: invoice.discount,
        total: invoice.total,
        createdAt: invoice.createdAt
      };
    } catch (error) {
      logger.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Generate unique invoice number
   * @returns {Promise<string>} Generated invoice number
   */
  async generateInvoiceNumber() {
    try {
      // Find the latest invoice to get the last number
      const latestInvoice = await Invoice.findOne()
        .sort({ createdAt: -1 })
        .select('invoiceNumber')
        .lean();
      
      if (!latestInvoice) {
        // First invoice
        return `${invoiceConfig.INVOICE_NUMBER_PREFIX}-001`;
      }
      
      // Extract number from invoice number (e.g., "INV-001" -> "001")
      const lastNumber = latestInvoice.invoiceNumber.split('-').pop();
      const nextNumber = parseInt(lastNumber, 10) + 1;
      
      // Pad with zeros to maintain 3 digits
      const paddedNumber = String(nextNumber).padStart(3, '0');
      
      return `${invoiceConfig.INVOICE_NUMBER_PREFIX}-${paddedNumber}`;
    } catch (error) {
      logger.error('Error generating invoice number:', error);
      // Fallback to timestamp-based number
      const timestamp = Date.now();
      return `${invoiceConfig.INVOICE_NUMBER_PREFIX}-${timestamp}`;
    }
  }

  /**
   * Get invoice by ID
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Object>} Invoice metadata with Cloudinary URL
   */
  async getInvoiceById(invoiceId) {
    try {
      const invoice = await Invoice.findById(invoiceId).lean();
      
      if (!invoice) {
        const error = new Error('Invoice not found');
        error.statusCode = 404;
        error.code = 'INVOICE_NOT_FOUND';
        throw error;
      }
      
      logger.info(`Retrieved invoice ${invoice.invoiceNumber} (ID: ${invoiceId})`);
      
      return {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        customer: invoice.customer,
        lineItems: invoice.lineItems,
        subtotal: invoice.subtotal,
        taxRate: invoice.taxRate,
        taxAmount: invoice.taxAmount,
        discount: invoice.discount,
        total: invoice.total,
        companyInfo: invoice.companyInfo,
        pdfUrl: invoice.pdfUrl,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt
      };
    } catch (error) {
      if (error.statusCode === 404) {
        throw error;
      }
      logger.error(`Error retrieving invoice ${invoiceId}:`, error);
      throw error;
    }
  }

  /**
   * List invoices with pagination and filtering
   * @param {Object} filters - Filter options (startDate, endDate, customerName)
   * @param {Object} pagination - Pagination options (page, limit)
   * @returns {Promise<Object>} Paginated list of invoices
   */
  async listInvoices(filters = {}, pagination = {}) {
    try {
      const { startDate, endDate, customerName } = filters;
      const page = parseInt(pagination.page, 10) || 1;
      const limit = parseInt(pagination.limit, 10) || invoiceConfig.PAGINATION_LIMIT;
      const skip = (page - 1) * limit;
      
      // Build query
      const query = {};
      
      // Filter by date range
      if (startDate || endDate) {
        query.invoiceDate = {};
        if (startDate) {
          query.invoiceDate.$gte = new Date(startDate);
        }
        if (endDate) {
          // Set to end of day for endDate
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          query.invoiceDate.$lte = endOfDay;
        }
      }
      
      // Filter by customer name (case-insensitive partial match)
      if (customerName) {
        query['customer.name'] = { $regex: customerName, $options: 'i' };
      }
      
      // Execute query with pagination
      const [invoices, totalCount] = await Promise.all([
        Invoice.find(query)
          .select('invoiceNumber invoiceDate customer.name subtotal taxAmount discount total pdfUrl createdAt')
          .sort({ invoiceDate: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Invoice.countDocuments(query)
      ]);
      
      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);
      
      logger.info(`Listed ${invoices.length} invoices (page ${page} of ${totalPages})`);
      
      return {
        invoices: invoices.map(invoice => ({
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          customerName: invoice.customer?.name,
          subtotal: invoice.subtotal,
          taxAmount: invoice.taxAmount,
          discount: invoice.discount,
          total: invoice.total,
          pdfUrl: invoice.pdfUrl,
          createdAt: invoice.createdAt
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      logger.error('Error listing invoices:', error);
      throw error;
    }
  }
}

module.exports = new InvoiceService();
