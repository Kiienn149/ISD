// File: models/user.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');  // Thêm bcrypt để mã hóa mật khẩu

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['owner', 'manager', 'staff'],
    default: 'staff'
  },
  isActive: {
    type: String,
    default: true
  }
}, { timestamps: true }); // ✅ timestamps để ngoài schema object

// Mã hóa mật khẩu trước khi lưu vào DB
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // Kiểm tra nếu mật khẩu chưa thay đổi
  this.password = await bcrypt.hash(this.password, 10); // Mã hóa mật khẩu
  next();
});

module.exports = mongoose.model('User', userSchema);
