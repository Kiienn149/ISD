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
  const inventoryRoutes = require('./routes/inventoryRoutes');
  const profitRoutes = require('./routes/profitRoutes');
  const { isOwner } = require('./middlewares/auth');
  const app = express();
  const crypto = require('crypto');
  const nodemailer = require('nodemailer'); // Cần cài đặt nodemailer

  // Middleware
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static('public'));
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(express.static(path.join(__dirname, 'public')));
  // Cấu hình Mailtrap SMTP thông qua Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Dùng Gmail để gửi email
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
  const orderRoutes = require('./routes/orderRoutes');
  app.use('/', orderRoutes);
  app.use(settingsRoutes);  // Add settings routes for employee management
  app.use(userRoutes);  
  app.use('/products', productRoutes);
  app.use('/', customerRoutes);
  app.use('/', inventoryRoutes);
  app.use('/profit', isOwner, profitRoutes);

  // MongoDB connect
  mongoose.connect('mongodb://localhost:27017/construction-store')
    .then(() => {
      console.log('✅ Đã kết nối MongoDB');
      addSampleOrders(); // Gọi hàm thêm đơn hàng mẫu khi kết nối thành công
    })
    .catch(err => console.error('❌ MongoDB lỗi:', err));

  // Hàm tạo đơn hàng mẫu
  const addSampleOrders = async () => {
    const orders = [
      {
        product: 'Cement',
        customer: 'Nguyễn Văn A',
        quantity: 10,
        price: 100000,
        total: 1000000,
        date: new Date(),
        status: 'Đang chờ'
      },
      {
        product: 'Bricks',
        customer: 'Trần Thị B',
        quantity: 50,
        price: 20000,
        total: 1000000,
        date: new Date(),
        status: 'Đang xử lý'
      },
      {
        product: 'Steel',
        customer: 'Lê Minh C',
        quantity: 20,
        price: 50000,
        total: 1000000,
        date: new Date(),
        status: 'Đã giao'
      }
    ];

    try {
      // Xóa tất cả các đơn hàng cũ trước khi thêm đơn hàng mẫu
      await Order.deleteMany({});
      // Thêm đơn hàng mẫu vào cơ sở dữ liệu
      await Order.insertMany(orders);
      console.log('Đã thêm đơn hàng mẫu thành công');
    } catch (err) {
      console.error('Lỗi khi thêm đơn hàng mẫu:', err);
    }
  };

  app.get('/home', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('home', {
      user: req.session.user,
      partial: 'partials/home' 
    });
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
    console.log('Session người dùng:', req.session.user); // Log để kiểm tra thông tin session
    res.redirect('/home');
  });
  


  // Route: GET /register
  app.get('/register', (req, res) => {
    res.render('register', { messages: req.flash() }); // Đảm bảo đúng cấu trúc khi truyền messages vào render
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
        return res.redirect('/forgot'); // Nếu email không tồn tại, quay lại trang quên mật khẩu
      }

      // Tạo một mật khẩu ngẫu nhiên
      const randomPassword = crypto.randomBytes(8).toString('hex'); // Tạo mật khẩu ngẫu nhiên 16 ký tự

      // Cập nhật mật khẩu mới vào cơ sở dữ liệu (mã hóa mật khẩu nếu cần)
      user.password = await bcrypt.hash(randomPassword, 10); // Mã hóa mật khẩu trước khi lưu
      await user.save();

      // Gửi email
      const mailOptions = {
        from: 'nguyentrungkienhs2004@gmail.com', // Thay thế bằng email của bạn
        to: email,
        subject: 'Mật khẩu mới của bạn',
        text: `Mật khẩu mới của bạn là: ${randomPassword}` // Nội dung email
      };

      // Gửi email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Lỗi khi gửi email:', error);
        } else {
          console.log('Email gửi thành công:', info.response);
        }
      });

      // Hiển thị thông báo mật khẩu đã được thay đổi
      req.flash('success', 'Mật khẩu mới đã được gửi tới email của bạn.');

      // Redirect về trang login và giữ flash message
      res.redirect('/login');
    } catch (err) {
      console.error('Lỗi khi thay đổi mật khẩu:', err);
      req.flash('error', 'Đã có lỗi xảy ra khi thay đổi mật khẩu');
      res.redirect('/forgot');
    }
  });


  // Route: GET home
  app.get('/home', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('home', { user: req.session.user });
  });

  app.get('/partial/order', async (req, res) => {
    if (!req.session.user) {
      console.log('User is not logged in');
      return res.redirect('/login');
    }

    try {
      const orders = await Order.find(); // Kiểm tra xem có lỗi khi tìm đơn hàng không
      console.log('Orders found:', orders); // Log đơn hàng để xem có dữ liệu không
      res.render('partials/order', { orders });
    } catch (err) {
      console.error('Error fetching orders:', err); // Log chi tiết lỗi
      res.status(500).send('Unable to load orders');
    }
  });



  app.get('/order', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    try {
      const orders = await Order.find(); // Lấy tất cả đơn hàng

      // Truyền chỉ orders vào EJS mà không cần tính tổng
      res.render('partials/order', { orders });
    } catch (err) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', err);
      req.flash('error', 'Không thể tải danh sách đơn hàng');
      res.redirect('/home');
    }
  });
  // Route: GET /order/create (Hiển thị form tạo đơn hàng)
  app.get('/order/create', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('create-order'); // Tạo trang EJS mới để hiển thị form
  });


  // Route: POST /order/create (Xử lý form tạo đơn hàng)
  app.post('/order/create', async (req, res) => {
    const { product, customer, quantity, price } = req.body;

    if (!product || !customer || !quantity || !price) {
      req.flash('error', 'Vui lòng nhập đầy đủ thông tin đơn hàng');
      return res.redirect('/order'); // Quay lại trang đơn hàng nếu thiếu thông tin
    }

    try {
      const total = quantity * price; // Tính tổng tiền
      const newOrder = new Order({ product, customer, quantity, price, total });

      await newOrder.save(); // Lưu đơn hàng vào cơ sở dữ liệu
      req.flash('success', 'Tạo đơn hàng thành công');
      res.redirect('/home'); // Quay lại trang danh sách đơn hàng
    } catch (err) {
      console.error('Lỗi khi tạo đơn hàng:', err);
      req.flash('error', 'Không thể tạo đơn hàng');
      res.redirect('/order');
    }
  });

  // ✅ Route: GET account (xem thông tin tài khoản)
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
  // Lắng nghe port
  app.listen(3000, () => {
    console.log('🚀 Server chạy tại http://localhost:3000');
  });
