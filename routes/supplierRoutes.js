const express = require('express');
const router = express.Router();
const { isManager } = require('../middlewares/auth');
const { getSupplierList, createSupplier, editSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');

// Hiển thị danh sách nhà cung cấp
router.get('/supplier', isManager, getSupplierList);

// Tạo nhà cung cấp mới (Route được dùng khi form modal được gửi)
router.post('/supplier/create', isManager, createSupplier);

// Chỉnh sửa thông tin nhà cung cấp
router.get('/supplier/edit/:id', isManager, editSupplier);

// Cập nhật thông tin nhà cung cấp
router.post('/supplier/update/:id', isManager, updateSupplier);

// Xóa nhà cung cấp
router.post('/supplier/delete/:id', isManager, deleteSupplier);  // Sử dụng deleteSupplier đúng cách

module.exports = router;
