const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    unique: true,
    required: true
  },
  quantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: true
  },
  capital: { // Thêm trường Giá vốn
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['Đang kinh doanh', 'Đã ngừng kinh doanh', 'Xóa'],
    default: 'Đang kinh doanh'
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
