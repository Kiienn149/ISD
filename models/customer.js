// models/customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  lastPurchaseDate: { type: Date },
  totalPurchaseAmount: { type: Number, default: 0 },  // Đảm bảo có giá trị mặc định
  totalDebt: { type: Number, default: 0 }  // Đảm bảo có giá trị mặc định
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
