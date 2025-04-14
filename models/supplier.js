// models/supplier.js
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  lastPurchaseDate: { type: Date },
  totalPurchaseAmount: { type: Number },
  totalDebt: { type: Number }
});

module.exports = mongoose.model('Supplier', supplierSchema);
