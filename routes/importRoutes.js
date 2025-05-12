const express = require('express');
const router = express.Router();
const importController = require('../controllers/importController');
const { isOwner } = require('../middlewares/auth'); // Middleware để chỉ owner mới được truy cập

// ✅ Hiển thị danh sách phiếu nhập kho
router.get('/import', importController.getImportRecords);

// ✅ Hiển thị giao diện tạo phiếu nhập (SPA-friendly)
router.get('/import/create', isOwner, importController.getImportForm);

// ✅ API lấy dữ liệu phụ trợ
router.get('/import/search/suppliers', importController.searchSuppliers);
router.get('/import/search/products', importController.searchProducts);
router.get('/import/getPrice/:productName', importController.getPrice);

// ✅ Xử lý tạo phiếu nhập
router.post('/import/create', isOwner, importController.createImportRecord);

module.exports = router;
