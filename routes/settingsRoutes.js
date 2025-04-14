const express = require('express');
const router = express.Router();
const User = require('../models/user');  // Ensure this line is present

const { requireLogin, isOwner } = require('../middlewares/auth');
const {
  getEmployeeList,
  editEmployeeForm,
  updateEmployee,
  deleteEmployee,
  createEmployee
} = require('../controllers/settingsController');

// Route for viewing employee list
router.get('/settings', requireLogin, isOwner, getEmployeeList);

// Route for editing employee information
router.get('/settings/edit/:id', requireLogin, isOwner, editEmployeeForm);

// Route for updating employee information
router.post('/settings/edit/:id', requireLogin, isOwner, updateEmployee);

// routes/settingsRoutes.js
router.post('/settings/delete/:id', requireLogin, isOwner, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id); // Xóa nhân viên theo ID
    if (!user) {
      req.flash('error', 'Nhân viên không tồn tại');
      return res.redirect('/settings');
    }
    req.flash('success', 'Nhân viên đã bị xóa');
    res.redirect('/settings');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Không thể xóa nhân viên');
    res.redirect('/settings');
  }
});

// File: routes/settingsRoutes.js

router.get('/settings/create', requireLogin, isOwner, (req, res) => {
  res.render('create-employee', { user: req.session.user });
});

router.post('/settings/create', requireLogin, isOwner, async (req, res) => {
  const { name, email, phone, role, isActive, password } = req.body;
  try {
    // Kiểm tra email trùng lặp
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Email đã tồn tại, vui lòng chọn email khác');
      return res.redirect('/settings/create');
    }

    // Tạo nhân viên mới với mật khẩu đã mã hóa
    const newUser = new User({
      name,
      email,
      phone,
      role,
      isActive,
      password // Lưu mật khẩu (mật khẩu sẽ được mã hóa trong schema)
    });

    await newUser.save();
    req.flash('success', 'Nhân viên đã được tạo');
    res.redirect('/settings');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Không thể tạo nhân viên');
    res.redirect('/settings/create');
  }
});


module.exports = router;
