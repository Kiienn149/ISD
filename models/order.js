// models/order.js 
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },  // Lưu ObjectId của sản phẩm thay vì tên sản phẩm
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  user: { type: String, required: true },     // Lưu tên nhân viên bán hàng
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
  capital: { type: Number, required: false },  // Thêm capital vào Order (nếu cần lưu)
  status: { type: String, default: 'Đang xử lý' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
