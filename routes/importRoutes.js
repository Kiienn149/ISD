// routes/importRoutes.js
const express = require('express');
const router = express.Router();
const importController = require('../controllers/importController');
const { isOwner } = require('../middlewares/auth'); // Middleware để chỉ owner mới được truy cập

// Hiển thị danh sách phiếu nhập kho
router.get('/import', importController.getImportRecords);  // Route để hiển thị danh sách phiếu nhập

// Route để tạo phiếu nhập kho (chỉ cho phép owner)
router.get('/importForm', isOwner, (req, res) => {
  res.render('partials/importForm');  // Chuyển đến form tạo phiếu nhập
});

// Các route khác
router.get('/import/search/suppliers', importController.searchSuppliers);
router.get('/import/search/products', importController.searchProducts);
router.get('/import/getPrice/:productName', importController.getPrice);
router.post('/import/create', isOwner, importController.createImportRecord);  // Route để tạo phiếu nhập kho

module.exports = router;
