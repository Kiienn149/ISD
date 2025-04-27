// models/importRecord.js
const mongoose = require('mongoose');

const importRecordSchema = new mongoose.Schema({
  importId: { type: String, required: true }, // Mã phiếu nhập
  warehouse: { type: String, required: true },  // Kho nhập
  status: { type: String, required: true },    // Tình trạng
  date: { type: Date, default: Date.now },     // Ngày nhập
  user: { type: String, required: true },      // Người nhập
  totalAmount: { type: Number, required: true },// Tổng tiền
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true }, // Số lượng
  }] 
});

module.exports = mongoose.model('ImportRecord', importRecordSchema);
