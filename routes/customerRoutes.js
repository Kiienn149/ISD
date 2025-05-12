const express = require('express');
const router = express.Router();
const { isManager } = require('../middlewares/auth');
const { getCustomerList, createCustomer, editCustomer, updateCustomer } = require('../controllers/customerController');

// Hiển thị danh sách khách hàng
router.get('/customer', isManager, getCustomerList);

// Tạo khách hàng mới (Route được dùng khi form modal được gửi)
router.post('/customer/create', isManager, createCustomer);

// Chỉnh sửa thông tin khách hàng
router.get('/customer/edit/:id', isManager, editCustomer);

// Cập nhật thông tin khách hàng
router.post('/customer/update/:id', isManager, updateCustomer);

module.exports = router;

// Route AJAX: render nội dung khách hàng (không layout)
router.get('/customer/content', isManager, async (req, res) => {
  try {
    const customers = await Customer.find();
    let totalPurchaseAmount = 0;
    let totalDebt = 0;

    customers.forEach(customer => {
      totalPurchaseAmount += customer.totalPurchaseAmount || 0;
      totalDebt += customer.totalDebt || 0;
    });

    // Trả về HTML cho phần thân khách hàng
    res.render('customer/partials/customer-content', {
      customers,
      totalPurchaseAmount,
      totalDebt,
      suppliers: [], // tránh lỗi EJS nếu dùng chung giao diện
      supplierTotalPurchaseAmount: 0,
      supplierTotalDebt: 0
    });
  } catch (error) {
    console.error('[Lỗi /customer/content]', error);
    res.status(500).send('Không thể tải nội dung khách hàng');
  }
});

