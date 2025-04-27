const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const bcrypt = require('bcrypt');
const path = require('path');

const User = require('./models/user');
const Order = require('./models/order'); // Đảm bảo bạn đã require đúng mô hình Order
const settingsRoutes = require('./routes/settingsRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const profitRoutes = require('./routes/profitRoutes');
const importRoutes = require('./routes/importRoutes'); // Add this line
const { isOwner } = require('./middlewares/auth');
const app = express();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình Mailtrap SMTP thông qua Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nguyentrungkienhs2004@gmail.com',  // Thay bằng email của bạn
    pass: 'oerp afjz yevk cpaf'  // Thay bằng mật khẩu ứng dụng bạn đã tạo cho Gmail
  }
});

app.use(session({
  secret: 'vlxd_secret',
  resave: false,
  saveUninitialized: true
}));
app.use(express.json());
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_message = req.flash('success');
  res.locals.error_message = req.flash('error');
  next();
});

const orderRoutes = require('./routes/orderRoutes');
app.use('/order', orderRoutes);
app.use(settingsRoutes);
app.use(userRoutes);
app.use('/products', productRoutes);
app.use('/', customerRoutes);
app.use('/', supplierRoutes);
app.use('/', inventoryRoutes);
app.use('/profit', isOwner, profitRoutes);
app.use('/', importRoutes);

// MongoDB connect
mongoose.connect('mongodb://localhost:27017/construction-store')
  .then(() => {
    console.log('✅ Đã kết nối MongoDB');
  })
  .catch(err => console.error('❌ MongoDB lỗi:', err));

// Route: GET home
app.get('/home', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('home', { user: req.session.user });
});

// Route: GET login
app.get('/login', (req, res) => {
  res.render('login', { messages: req.flash() });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    req.flash('error', 'Tài khoản đăng nhập không hợp lệ');
    return res.redirect('/login');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    req.flash('error', 'Mật khẩu không chính xác');
    return res.redirect('/login');
  }

  req.session.user = user; // Lưu thông tin người dùng vào session
  res.redirect('/home');
});

// Route: GET /register
app.get('/register', (req, res) => {
  res.render('register', { messages: req.flash() });
});

// Route: POST /register
app.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Email đã tồn tại!');
      return res.redirect('/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword, phone });
    await newUser.save();

    req.flash('success', 'Đăng ký thành công! Mời đăng nhập');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Lỗi đăng ký!');
    res.redirect('/register');
  }
});

// Route: GET /forgot (Hiển thị trang quên mật khẩu)
app.get('/forgot', (req, res) => {
  res.render('forgot'); // Hiển thị trang forgot.ejs
});

// Route: POST /forgot (Xử lý yêu cầu quên mật khẩu)
app.post('/forgot', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      req.flash('error', 'Email không tồn tại');
      return res.redirect('/forgot');
    }

    // Tạo một mật khẩu ngẫu nhiên
    const randomPassword = crypto.randomBytes(8).toString('hex'); // Tạo mật khẩu ngẫu nhiên 16 ký tự

    // Cập nhật mật khẩu mới vào cơ sở dữ liệu (mã hóa mật khẩu nếu cần)
    user.password = await bcrypt.hash(randomPassword, 10);
    await user.save();

    // Gửi email
    const mailOptions = {
      from: 'nguyentrungkienhs2004@gmail.com', 
      to: email,
      subject: 'Mật khẩu mới của bạn',
      text: `Mật khẩu mới của bạn là: ${randomPassword}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Lỗi khi gửi email:', error);
      } else {
        console.log('Email gửi thành công:', info.response);
      }
    });

    req.flash('success', 'Mật khẩu mới đã được gửi tới email của bạn.');
    res.redirect('/login');
  } catch (err) {
    console.error('Lỗi khi thay đổi mật khẩu:', err);
    req.flash('error', 'Đã có lỗi xảy ra khi thay đổi mật khẩu');
    res.redirect('/forgot');
  }
});

// Route: GET account (xem thông tin tài khoản)
app.get('/account', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('account', { user: req.session.user });
});

// Đăng xuất
app.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.log('Lỗi khi logout:', err);
        return res.redirect('/home');
      }
      res.redirect('/login');
    });
  } else {
    res.redirect('/login');
  }
});

app.listen(3000, () => {
  console.log('🚀 Server chạy tại http://localhost:3000');
});
