const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vendorBankDetailsSchema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, unique: true },
  accountHolderName: { type: String, required: true },
  bankName: { type: String, required: true },
  branch: { type: String },
  accountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  upiId: { type: String }, // optional
  bankVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('VendorBankDetails', vendorBankDetailsSchema); 