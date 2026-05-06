
const mongoose = require('mongoose');

const RequirementsSchema = new mongoose.Schema({
  item: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: '' },
  customNote: { type: String, default: '' }
});

module.exports = RequirementsSchema;  
