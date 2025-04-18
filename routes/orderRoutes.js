const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');  // Đảm bảo bạn đã import đúng orderController

// POST request để tạo đơn hàng mới
router.post('/create', orderController.createOrder);

// GET request để lấy danh sách đơn hàng (partials)
router.get('/partials/order', orderController.getOrders);

// GET request để lấy giá sản phẩm
router.get('/getPrice/:productName', orderController.getPrice);  // Đổi từ productId sang productName

// Route tìm kiếm sản phẩm
router.get('/search/products', orderController.searchProducts);

// Route tìm kiếm khách hàng
router.get('/search/customers', orderController.searchCustomers);

// Route tìm kiếm nhân viên bán hàng
router.get('/search/users', orderController.searchUsers);

module.exports = router;
