const User = require('../models/user');
const bcrypt = require('bcrypt');

// Hiển thị form đăng ký
exports.showRegisterForm = (req, res) => {
  res.render('register', { messages: req.flash() });
};

// Đăng ký người dùng mới
exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    req.flash('error', 'Vui lòng nhập đầy đủ thông tin');
    return res.redirect('/register');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    req.flash('error', 'Email đã tồn tại');
    return res.redirect('/register');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword, phone });

  try {
    await newUser.save();
    req.flash('success', 'Đăng ký thành công! Hãy đăng nhập');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Lỗi khi đăng ký');
    res.redirect('/register');
  }
};

// Hiển thị form đăng nhập
exports.showLoginForm = (req, res) => {
  res.render('login', { messages: req.flash() });
};

// Đăng nhập
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    req.flash('error', 'Email hoặc mật khẩu không đúng');
    return res.redirect('/login');
  }

  req.session.user = user;
  res.redirect('/home');
};

// Đăng xuất
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

exports.showSettings = async (req, res) => {
  try {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!req.session.user) {
      return res.redirect('/login'); // Nếu chưa đăng nhập, chuyển đến trang đăng nhập
    }

    // Lấy danh sách người dùng từ DB
    const users = await User.find();

    // Render trang settings và truyền thông tin người dùng vào view
    res.render('settings', {
      users: users,
      user: req.session.user,  // Truyền thông tin người dùng vào view
      messages: req.flash()     // Hiển thị thông báo lỗi nếu có
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi hệ thống');
  }
};