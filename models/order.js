const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  product: { type: String, required: true },  // Tên sản phẩm
  customer: { type: String, required: true }, // Tên khách hàng
  quantity: { type: Number, required: true }, // Số lượng
  price: { type: Number, required: true },    // Giá sản phẩm
  total: { type: Number, required: true },    // Tổng tiền
  date: { type: Date, default: Date.now },    // Ngày bán
  status: { type: String, default: 'Đang chờ' } // Trạng thái đơn hàng
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;

