/**
 * Invoice calculation utility functions
 * Handles all financial calculations for invoice generation
 */

/**
 * Calculate subtotal from line items
 * @param {Array} lineItems - Array of line items with quantity and total
 * @returns {number} Subtotal amount
 */
const calculateSubtotal = (lineItems) => {
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    return 0;
  }

  const subtotal = lineItems.reduce((sum, item) => {
    const itemTotal = parseFloat(item.total) || 0;
    return sum + itemTotal;
  }, 0);

  // Round to 2 decimal places
  return Math.round(subtotal * 100) / 100;
};

/**
 * Calculate tax amount based on subtotal and tax rate
 * @param {number} subtotal - Subtotal amount
 * @param {number} taxRate - Tax rate as percentage (e.g., 18 for 18%)
 * @returns {number} Tax amount
 */
const calculateTax = (subtotal, taxRate) => {
  const subtotalValue = parseFloat(subtotal) || 0;
  const rate = parseFloat(taxRate) || 0;

  if (rate < 0 || rate > 100) {
    throw new Error('Tax rate must be between 0 and 100');
  }

  const taxAmount = (subtotalValue * rate) / 100;

  // Round to 2 decimal places
  return Math.round(taxAmount * 100) / 100;
};

/**
 * Apply discount to amount
 * @param {number} amount - Amount before discount
 * @param {number} discount - Discount amount (not percentage)
 * @returns {number} Amount after discount
 */
const applyDiscount = (amount, discount) => {
  const amountValue = parseFloat(amount) || 0;
  const discountValue = parseFloat(discount) || 0;

  if (discountValue < 0) {
    throw new Error('Discount cannot be negative');
  }

  if (discountValue > amountValue) {
    throw new Error('Discount cannot exceed the amount');
  }

  const finalAmount = amountValue - discountValue;

  // Round to 2 decimal places
  return Math.round(finalAmount * 100) / 100;
};

/**
 * Calculate total amount (subtotal + tax - discount)
 * @param {number} subtotal - Subtotal amount
 * @param {number} taxAmount - Tax amount
 * @param {number} discount - Discount amount
 * @returns {number} Total amount
 */
const calculateTotal = (subtotal, taxAmount, discount = 0) => {
  const subtotalValue = parseFloat(subtotal) || 0;
  const taxValue = parseFloat(taxAmount) || 0;
  const discountValue = parseFloat(discount) || 0;

  const total = subtotalValue + taxValue - discountValue;

  if (total < 0) {
    throw new Error('Total amount cannot be negative');
  }

  // Round to 2 decimal places
  return Math.round(total * 100) / 100;
};

/**
 * Calculate all invoice amounts in one go
 * @param {Array} lineItems - Array of line items
 * @param {number} taxRate - Tax rate as percentage
 * @param {number} discount - Discount amount
 * @returns {Object} Object containing subtotal, taxAmount, discount, and total
 */
const calculateInvoiceAmounts = (lineItems, taxRate, discount = 0) => {
  const subtotal = calculateSubtotal(lineItems);
  const taxAmount = calculateTax(subtotal, taxRate);
  const total = calculateTotal(subtotal, taxAmount, discount);

  return {
    subtotal,
    taxRate: parseFloat(taxRate) || 0,
    taxAmount,
    discount: parseFloat(discount) || 0,
    total
  };
};

/**
 * Format currency amount for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, currency = 'INR') => {
  const value = parseFloat(amount) || 0;
  
  if (currency === 'INR') {
    // Indian number format with commas
    return value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  
  // Default format
  return value.toFixed(2);
};

module.exports = {
  calculateSubtotal,
  calculateTax,
  applyDiscount,
  calculateTotal,
  calculateInvoiceAmounts,
  formatCurrency
};
