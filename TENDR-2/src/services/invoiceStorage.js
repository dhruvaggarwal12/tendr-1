const { cloudinary } = require('../config/cloudinary');
const { CLOUDINARY_FOLDER } = require('../config/invoice.config');
const logger = require('../middleware/logger');

/**
 * StorageService for managing invoice PDF storage in Cloudinary
 */
class StorageService {
  /**
   * Upload PDF buffer to Cloudinary
   * @param {Buffer} pdfBuffer - The PDF file as a buffer
   * @param {string} invoiceNumber - Invoice number for filename generation
   * @returns {Promise<{url: string, publicId: string}>} Cloudinary URL and public ID
   */
  async uploadPDF(pdfBuffer, invoiceNumber) {
    try {
      const filename = this.generateFilename(invoiceNumber);
      
      // Upload PDF to Cloudinary using upload_stream
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: CLOUDINARY_FOLDER,
            public_id: filename,
            resource_type: 'raw', // Use 'raw' for PDF files
            format: 'pdf',
            overwrite: false
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        
        // Write buffer to stream
        uploadStream.end(pdfBuffer);
      });

      logger.info(`PDF uploaded successfully to Cloudinary: ${uploadResult.public_id}`);

      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      };
    } catch (error) {
      logger.error('Failed to upload PDF to Cloudinary:', error);
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  /**
   * Delete PDF from Cloudinary using public ID
   * @param {string} publicId - The Cloudinary public ID of the PDF
   * @returns {Promise<void>}
   */
  async deletePDF(publicId) {
    try {
      if (!publicId) {
        throw new Error('Public ID is required for deletion');
      }

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw'
      });

      if (result.result === 'ok') {
        logger.info(`PDF deleted successfully from Cloudinary: ${publicId}`);
      } else if (result.result === 'not found') {
        logger.warn(`PDF not found in Cloudinary: ${publicId}`);
        throw new Error('PDF not found in storage');
      } else {
        logger.error(`Unexpected deletion result: ${result.result}`);
        throw new Error(`Failed to delete PDF: ${result.result}`);
      }
    } catch (error) {
      logger.error('Failed to delete PDF from Cloudinary:', error);
      throw new Error(`Cloudinary deletion failed: ${error.message}`);
    }
  }

  /**
   * Generate unique filename for Cloudinary storage
   * @param {string} invoiceNumber - Invoice number
   * @returns {string} Unique filename
   */
  generateFilename(invoiceNumber) {
    const timestamp = Date.now();
    const sanitizedInvoiceNumber = invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, '-');
    return `INV-${sanitizedInvoiceNumber}-${timestamp}`;
  }
}

module.exports = new StorageService();
