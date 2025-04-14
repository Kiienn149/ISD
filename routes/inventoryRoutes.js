const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middlewares/auth');
const { isManager } = require('../middlewares/auth');
const { getInventoryList } = require('../controllers/inventoryController');

// Route hiển thị danh sách sản phẩm trong kho
router.get('/inventory', isManager, getInventoryList);

module.exports = router;
