const Vendor = require('./Vendor');
const Booking = require('./Booking');
const View = require('./View');
const IndividualConsumer = require('./IndividualConsumer');
const CorporateConsumer = require('./CorporateConsumer');
const Payment = require('./Payment');
const VendorBankDetails = require('./VendorBankDetails');
const CorporateSubscription = require('./CorporateSubscription');
const CorporateEvent = require('./CorporateEvent');
const Timeline = require('./Timeline');
const Checklist = require('./Checklist');
const Product = require('./Product');
const Invoice = require('./Invoice');
const VendorApplication = require('./VendorApplication');

module.exports = {
  Vendor,
  Booking,
  View,
  IndividualConsumer,
  CorporateConsumer,
  Consumer: IndividualConsumer, // Alias for backward compatibility
  Payment,
  VendorBankDetails,
  CorporateSubscription,
  CorporateEvent,
  Timeline,
  Checklist,
  Product,
  Invoice,
  VendorApplication,
  EventPlan: require('./EventPlan'),
}; 