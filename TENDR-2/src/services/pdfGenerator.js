const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const invoiceConfig = require('../config/invoice.config');

/**
 * PDFGeneratorService
 * Handles PDF generation for invoices using PDFKit
 */
class PDFGeneratorService {
  /**
   * Generate complete invoice PDF
   * @param {Object} invoiceData - Invoice data containing all required fields
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generateInvoicePDF(invoiceData) {
    return new Promise((resolve, reject) => {
      try {
        // Initialize PDFKit document with A4 size and margins
        const doc = new PDFDocument({
          size: invoiceConfig.PDF_LAYOUT.PAGE_SIZE,
          margins: {
            top: invoiceConfig.PDF_LAYOUT.MARGINS.TOP,
            bottom: invoiceConfig.PDF_LAYOUT.MARGINS.BOTTOM,
            left: invoiceConfig.PDF_LAYOUT.MARGINS.LEFT,
            right: invoiceConfig.PDF_LAYOUT.MARGINS.RIGHT
          }
        });

        // Collect PDF data in buffer
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (error) => reject(error));

        // Generate PDF sections
        this.addHeader(doc, invoiceData);
        this.addCustomerInfo(doc, invoiceData.customer);
        this.addLineItems(doc, invoiceData.lineItems);
        this.addTotals(doc, {
          subtotal: invoiceData.subtotal,
          taxRate: invoiceData.taxRate,
          taxAmount: invoiceData.taxAmount,
          discount: invoiceData.discount,
          total: invoiceData.total
        });
        this.addThankYouMessage(doc);
        this.addFooter(doc, invoiceData.companyInfo);

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add header section with logo, invoice title, number and date
   * @param {PDFDocument} doc - PDFKit document instance
   * @param {Object} invoiceData - Invoice data
   */
  addHeader(doc, invoiceData) {
    const { LOGO_PATH, LOGO_SIZE } = invoiceConfig.PDF_LAYOUT;
    const startY = doc.y;

    // Add Tendr logo on the left
    if (fs.existsSync(invoiceConfig.LOGO_PATH)) {
      doc.image(invoiceConfig.LOGO_PATH, 50, startY, {
        width: LOGO_SIZE.WIDTH,
        height: LOGO_SIZE.HEIGHT
      });
    }

    // Add "Invoice" title on the right
    doc.font(invoiceConfig.PDF_LAYOUT.FONTS.BOLD)
       .fontSize(36)
       .text('Invoice', 350, startY, {
         align: 'right'
       });

    // Add invoice number and date below title
    doc.font(invoiceConfig.PDF_LAYOUT.FONTS.REGULAR)
       .fontSize(10)
       .text(`Invoice #: ${invoiceData.invoiceNumber}`, 350, startY + 45, {
         align: 'right'
       })
       .text(`Date: ${this.formatDate(invoiceData.invoiceDate)}`, 350, startY + 60, {
         align: 'right'
       });

    // Move cursor below header
    doc.moveDown(3);
  }

  /**
   * Add customer billing information section
   * @param {PDFDocument} doc - PDFKit document instance
   * @param {Object} customer - Customer details
   */
  addCustomerInfo(doc, customer) {
    const startY = doc.y;

    // Add "Billed to:" label
    doc.font(invoiceConfig.PDF_LAYOUT.FONTS.BOLD)
       .fontSize(12)
       .text('Billed to:', 50, startY);

    doc.moveDown(0.5);

    // Add customer name (bold)
    doc.font(invoiceConfig.PDF_LAYOUT.FONTS.BOLD)
       .fontSize(11)
       .text(customer.name);

    // Add GST number if available
    if (customer.gstNumber) {
      doc.font(invoiceConfig.PDF_LAYOUT.FONTS.REGULAR)
         .fontSize(10)
         .text(`GST: ${customer.gstNumber}`);
    }

    // Add multi-line address
    if (customer.address) {
      const addressLines = [];
      
      if (customer.address.line1) addressLines.push(customer.address.line1);
      if (customer.address.line2) addressLines.push(customer.address.line2);
      
      const cityStatePincode = [
        customer.address.city,
        customer.address.state,
        customer.address.pincode
      ].filter(Boolean).join(', ');
      
      if (cityStatePincode) addressLines.push(cityStatePincode);

      doc.font(invoiceConfig.PDF_LAYOUT.FONTS.REGULAR)
         .fontSize(10)
         .text(addressLines.join('\n'));
    }

    doc.moveDown(2);
  }

  /**
   * Add line items table with Item, Quantity, Total columns
   * @param {PDFDocument} doc - PDFKit document instance
   * @param {Array} lineItems - Array of line items
   */
  addLineItems(doc, lineItems) {
    const tableTop = doc.y;
    const itemX = 50;
    const quantityX = 350;
    const totalX = 450;
    const pageWidth = 595 - 100; // A4 width minus margins

    // Table header
    doc.font(invoiceConfig.PDF_LAYOUT.FONTS.BOLD)
       .fontSize(11);

    doc.text('Item', itemX, tableTop);
    doc.text('Quantity', quantityX, tableTop, { width: 90, align: 'center' });
    doc.text('Total', totalX, tableTop, { width: 95, align: 'right' });

    // Draw line under header
    const lineY = tableTop + 20;
    doc.moveTo(itemX, lineY)
       .lineTo(545, lineY)
       .stroke();

    // Table rows
    let currentY = lineY + 10;
    doc.font(invoiceConfig.PDF_LAYOUT.FONTS.REGULAR)
       .fontSize(10);

    lineItems.forEach((item, index) => {
      // Check if we need a new page
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      // Item description (60% width)
      doc.text(item.description, itemX, currentY, { 
        width: 290, 
        align: 'left' 
      });

      // Quantity (20% width, centered)
      doc.text(item.quantity.toString(), quantityX, currentY, { 
        width: 90, 
        align: 'center' 
      });

      // Total (20% width, right-aligned)
      doc.text(this.formatCurrency(item.total), totalX, currentY, { 
        width: 95, 
        align: 'right' 
      });

      currentY += 25;
    });

    doc.moveDown(2);
  }

  /**
   * Add totals section with subtotal, tax, discount, and total
   * @param {PDFDocument} doc - PDFKit document instance
   * @param {Object} amounts - Object containing subtotal, taxRate, taxAmount, discount, total
   */
  addTotals(doc, amounts) {
    const labelX = 350;
    const amountX = 450;
    let currentY = doc.y + 20;

    doc.font(invoiceConfig.PDF_LAYOUT.FONTS.REGULAR)
       .fontSize(10);

    // Subtotal
    doc.text('Subtotal:', labelX, currentY);
    doc.text(this.formatCurrency(amounts.subtotal), amountX, currentY, {
      width: 95,
      align: 'right'
    });
    currentY += 20;

    // Tax with percentage
    doc.text(`Tax (${amounts.taxRate}%):`, labelX, currentY);
    doc.text(this.formatCurrency(amounts.taxAmount), amountX, currentY, {
      width: 95,
      align: 'right'
    });
    currentY += 20;

    // Discount (if applicable)
    if (amounts.discount > 0) {
      doc.text('Discount:', labelX, currentY);
      doc.text(`-${this.formatCurrency(amounts.discount)}`, amountX, currentY, {
        width: 95,
        align: 'right'
      });
      currentY += 20;
    }

    // Total in black box with white text
    currentY += 10;
    const boxHeight = 30;
    const boxWidth = 195;

    // Draw black rectangle
    doc.rect(labelX, currentY, boxWidth, boxHeight)
       .fill(invoiceConfig.PDF_LAYOUT.COLORS.BLACK);

    // Add white text for total
    doc.font(invoiceConfig.PDF_LAYOUT.FONTS.BOLD)
       .fontSize(12)
       .fillColor(invoiceConfig.PDF_LAYOUT.COLORS.WHITE)
       .text('Total:', labelX + 10, currentY + 8, {
         width: 80,
         align: 'left'
       })
       .text(this.formatCurrency(amounts.total), amountX, currentY + 8, {
         width: 95,
         align: 'right'
       });

    // Reset fill color to black for subsequent text
    doc.fillColor(invoiceConfig.PDF_LAYOUT.COLORS.BLACK);

    doc.moveDown(3);
  }

  /**
   * Add "Thank You!" message in cursive style
   * @param {PDFDocument} doc - PDFKit document instance
   */
  addThankYouMessage(doc) {
    const currentY = doc.y + 20;

    doc.font(invoiceConfig.PDF_LAYOUT.FONTS.BOLD_ITALIC)
       .fontSize(18)
       .text('Thank You!', 50, currentY, {
         align: 'center',
         width: 495
       });

    doc.moveDown(2);
  }

  /**
   * Add footer with payment information and company details
   * @param {PDFDocument} doc - PDFKit document instance
   * @param {Object} companyInfo - Company information including bank details
   */
  addFooter(doc, companyInfo) {
    const footerY = doc.y + 30;
    const leftColumnX = 50;
    const rightColumnX = 320;

    doc.font(invoiceConfig.PDF_LAYOUT.FONTS.REGULAR)
       .fontSize(9);

    // Left column - Payment Information
    doc.font(invoiceConfig.PDF_LAYOUT.FONTS.BOLD)
       .fontSize(10)
       .text('Payment Information', leftColumnX, footerY);

    doc.font(invoiceConfig.PDF_LAYOUT.FONTS.REGULAR)
       .fontSize(9)
       .text(`Bank: ${companyInfo.bankDetails.bankName}`, leftColumnX, footerY + 15)
       .text(`Account Name: ${companyInfo.bankDetails.accountName}`, leftColumnX, footerY + 28)
       .text(`Account Number: ${companyInfo.bankDetails.accountNumber}`, leftColumnX, footerY + 41)
       .text(`IFSC Code: ${companyInfo.bankDetails.ifscCode}`, leftColumnX, footerY + 54);

    // Right column - Company Information
    doc.font(invoiceConfig.PDF_LAYOUT.FONTS.BOLD)
       .fontSize(10)
       .text(companyInfo.name, rightColumnX, footerY);

    doc.font(invoiceConfig.PDF_LAYOUT.FONTS.REGULAR)
       .fontSize(9)
       .text(companyInfo.address, rightColumnX, footerY + 15, {
         width: 225
       });

    const addressHeight = doc.heightOfString(companyInfo.address, { width: 225 });
    
    doc.text(`GST: ${companyInfo.gstNumber}`, rightColumnX, footerY + 15 + addressHeight + 5)
       .text(`Email: ${companyInfo.email}`, rightColumnX, footerY + 15 + addressHeight + 18);
  }

  /**
   * Format currency amount
   * @param {Number} amount - Amount to format
   * @returns {String} - Formatted currency string
   */
  formatCurrency(amount) {
    const { SYMBOL, DECIMAL_PLACES } = invoiceConfig.CURRENCY;
    return `${SYMBOL}${amount.toFixed(DECIMAL_PLACES).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }

  /**
   * Format date
   * @param {String|Date} date - Date to format
   * @returns {String} - Formatted date string
   */
  formatDate(date) {
    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }
}

module.exports = new PDFGeneratorService();
