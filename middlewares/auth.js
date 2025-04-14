// middleware yêu cầu đăng nhập
exports.requireLogin = (req, res, next) => {
  console.log('Checking if user is logged in:', req.session && req.session.user ? 'Logged in' : 'Not logged in');
  
  if (!req.session || !req.session.user) {
    req.flash('error', 'Bạn cần đăng nhập để tiếp tục');
    return res.redirect('/login');  // Nếu người dùng chưa đăng nhập, điều hướng đến trang đăng nhập
  }

  next();  // Nếu đã đăng nhập, tiếp tục
};

// Middleware chỉ cho phép owner truy cập
exports.isOwner = (req, res, next) => {
  console.log('User role:', req.session.user ? req.session.user.role : 'No user session');  // Log debug

  if (req.session && req.session.user && req.session.user.role === 'owner') {
    return next();  // Nếu là owner, tiếp tục
  }
  
  req.flash('error', 'Bạn không có quyền truy cập vào trang này');
  return res.redirect('/home');  // Nếu không phải owner, điều hướng đến trang home
};

// Middleware cho phép cả owner và manager truy cập
exports.isManager = (req, res, next) => {
  if (!req.session || !req.session.user) {
    req.flash('error', 'Bạn cần đăng nhập để tiếp tục');
    return res.redirect('/login');  // Nếu không có session, yêu cầu đăng nhập
  }

  const { role } = req.session.user;  // Lấy role từ session
  if (role === 'owner' || role === 'manager') {
    return next();  // Cho phép nếu là owner hoặc manager
  }

  req.flash('error', 'Bạn không có quyền truy cập');
  return res.redirect('/home');  // Nếu không phải owner hoặc manager, quay lại trang home
};

// Middleware cho phép owner, manager và staff truy cập
exports.isStaff = (req, res, next) => {
  if (!req.session || !req.session.user) {
    req.flash('error', 'Bạn cần đăng nhập để tiếp tục');
    return res.redirect('/login');  // Nếu không có session, yêu cầu đăng nhập
  }

  const { role } = req.session.user;  // Lấy role từ session
  if (['owner', 'manager', 'staff'].includes(role)) {
    return next();  // Cho phép nếu là owner, manager hoặc staff
  }

  req.flash('error', 'Bạn không có quyền truy cập');
  return res.redirect('/home');  // Nếu không phải owner, manager hay staff, quay lại trang home
};
