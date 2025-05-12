const express = require('express');
const router = express.Router();
const { isManager } = require('../middlewares/auth');
const { getCustomerList, createCustomer, editCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');  // Thêm deleteCustomer vào require

// Hiển thị danh sách khách hàng
router.get('/customer', isManager, getCustomerList);

// Tạo khách hàng mới (Route được dùng khi form modal được gửi)
router.post('/customer/create', isManager, createCustomer);

// Chỉnh sửa thông tin khách hàng
router.get('/customer/edit/:id', isManager, editCustomer);

// Cập nhật thông tin khách hàng
router.post('/customer/update/:id', isManager, updateCustomer);

// Xóa khách hàng
router.post('/customer/delete/:id', isManager, deleteCustomer);  // Sử dụng deleteCustomer đúng cách

module.exports = router;
