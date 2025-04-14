const express = require('express');
const router = express.Router();
const { requireLogin, isManager } = require('../middlewares/auth');
const Product = require('../models/product');
const {
  showProductList,
  showProductDetail,
  createProduct,
  editProduct,
  deleteProduct
} = require('../controllers/productController');

// Hiển thị danh sách sản phẩm
router.get('/', requireLogin, isManager, showProductList);

// Chi tiết sản phẩm
router.get('/detail/:id', requireLogin, isManager, showProductDetail);

// Tạo sản phẩm mới
router.get('/create', requireLogin, isManager, (req, res) => {
  res.render('product/create-product');
});
router.post('/create', requireLogin, isManager, createProduct);

// Sửa thông tin sản phẩm
router.get('/edit/:id', requireLogin, isManager, async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  res.render('product/edit-product', { product });
});
router.post('/edit/:id', requireLogin, isManager, editProduct);

// Xóa sản phẩm
router.post('/delete/:id', requireLogin, isManager, deleteProduct);

module.exports = router;
