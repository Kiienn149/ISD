const User = require('../models/user');

// View the employee list
exports.getEmployeeList = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all employees
    res.render('settings', { users, user: req.session.user }); // Pass users to the view
  } catch (err) {
    console.error(err);
    req.flash('error', 'Không thể tải danh sách nhân viên');
    res.redirect('/home');
  }
};

// Edit employee form
exports.editEmployeeForm = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id); // Fetch user details
    if (!user) {
      req.flash('error', 'Nhân viên không tồn tại');
      return res.redirect('/settings');
    }
    res.render('edit-employee', { user, user: req.session.user }); // Pass user data to the edit form
  } catch (err) {
    console.error(err);
    req.flash('error', 'Không thể tải thông tin nhân viên');
    res.redirect('/settings');
  }
};




exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
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
};
exports.createEmployeeForm = (req, res) => {
  res.render('create-employee', { user: req.session.user });
};


exports.createEmployee = async (req, res) => {
  const { name, email, phone, role, isActive, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Email đã tồn tại, vui lòng chọn email khác');
      return res.redirect('/settings/create');
    }

    const newUser = new User({
      name,
      email,
      phone,
      role,
      isActive,
      password
    });

    await newUser.save();
    req.flash('success', 'Nhân viên đã được tạo');
    res.redirect('/settings');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Không thể tạo nhân viên');
    res.redirect('/settings/create');
  }
};


exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, isActive } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      req.flash('error', 'Nhân viên không tồn tại');
      return res.redirect('/settings');
    }

    // Chuyển isActive từ 'on' thành true, các giá trị khác thành false
    const isActiveBoolean = isActive === 'on'; // 'on' => true, bất kỳ giá trị nào khác => false

    // Kiểm tra email có bị trùng lặp không
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== id) {
      req.flash('error', 'Email đã tồn tại, vui lòng chọn email khác');
      return res.redirect(`/settings/edit/${id}`);
    }

    // Cập nhật thông tin nhân viên
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.isActive = isActiveBoolean !== undefined ? isActiveBoolean : user.isActive;

    await user.save();
    req.flash('success', 'Thông tin nhân viên đã được cập nhật');
    res.redirect('/settings');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Không thể cập nhật thông tin nhân viên');
    res.redirect(`/settings/edit/${id}`);
  }
};


