// middlewares/auth.js
exports.requireLogin = (req, res, next) => {
  console.log('Checking if user is logged in:', req.session && req.session.user ? 'Logged in' : 'Not logged in');
  
  if (!req.session || !req.session.user) {
    return res.redirect('/login?alertMessage=Bạn cần đăng nhập để tiếp tục');  // Redirect with alertMessage in query params
  }

  next();  // If logged in, proceed
};

// Middleware chỉ cho phép owner truy cập
exports.isOwner = (req, res, next) => {
  console.log('User role:', req.session.user ? req.session.user.role : 'No user session');  // Log debug

  if (req.session && req.session.user && req.session.user.role === 'owner') {
    return next();  // If owner, proceed
  }
  
  return res.redirect('/home?alertMessage=Bạn không có quyền truy cập vào trang này');  // Redirect with alert message
};

// Middleware cho phép cả owner và manager truy cập
exports.isManager = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/login?alertMessage=Bạn cần đăng nhập để tiếp tục');  // Redirect with alertMessage for login
  }

  const { role } = req.session.user;  // Get role from session
  if (role === 'owner' || role === 'manager') {
    return next();  // Allow if owner or manager
  }

  return res.redirect('/home?alertMessage=Bạn không có quyền truy cập');  // Redirect with alert message
};

// Middleware cho phép owner, manager và staff truy cập
exports.isStaff = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/login?alertMessage=Bạn cần đăng nhập để tiếp tục');  // Redirect with alertMessage for login
  }

  const { role } = req.session.user;  // Get role from session
  if (['owner', 'manager', 'staff'].includes(role)) {
    return next();  // Allow if owner, manager, or staff
  }

  return res.redirect('/home?alertMessage=Bạn không có quyền truy cập');  // Redirect with alert message
};
