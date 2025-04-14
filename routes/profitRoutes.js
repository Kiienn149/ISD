const express = require('express');
const router = express.Router();
const { getProfitReport } = require('../controllers/profitController');  // Import controller xử lý báo cáo lợi nhuận

// Hiển thị báo cáo lợi nhuận
router.get('/', getProfitReport);  // Route cho báo cáo lợi nhuận

module.exports = router;
