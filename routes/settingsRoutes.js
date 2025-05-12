const express = require('express');
const router = express.Router();
const { requireLogin, isOwner } = require('../middlewares/auth');
const {
  getEmployeeList,
  editEmployeeForm,
  updateEmployee,
  deleteEmployee,
  createEmployeeForm,
  createEmployee
} = require('../controllers/settingsController');

// Danh sách nhân viên
router.get('/settings', requireLogin, isOwner, getEmployeeList);

// Form tạo nhân viên
router.get('/settings/create', requireLogin, isOwner, createEmployeeForm);

// Xử lý tạo nhân viên
router.post('/settings/create', requireLogin, isOwner, createEmployee);

// Form chỉnh sửa nhân viên
router.get('/settings/edit/:id', requireLogin, isOwner, editEmployeeForm);

// Xử lý cập nhật nhân viên
router.post('/settings/edit/:id', requireLogin, isOwner, updateEmployee);

// Xử lý xoá nhân viên
router.post('/settings/delete/:id', requireLogin, isOwner, deleteEmployee);

module.exports = router;
