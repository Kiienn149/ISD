const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: String,
  name: String,
  phone: String,
  address: String,
  lastPurchaseDate: Date,
  totalPurchaseAmount: Number,
  totalDebt: Number
});

module.exports = mongoose.model('Customer', customerSchema);
