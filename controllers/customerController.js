const Customer = require('../models/customer');
const Supplier = require('../models/supplier');

// Lấy danh sách khách hàng và nhà cung cấp
exports.getCustomerList = async (req, res) => {
  try {
    // Lấy danh sách khách hàng
    const customers = await Customer.find();
    let totalPurchaseAmount = 0;
    let totalDebt = 0;

    // Tính tổng tiền hàng và tổng nợ của khách hàng
    customers.forEach(customer => {
      totalPurchaseAmount += customer.totalPurchaseAmount || 0;
      totalDebt += customer.totalDebt || 0;
    });

    // Lấy danh sách nhà cung cấp
    const suppliers = await Supplier.find();
    let supplierTotalPurchaseAmount = 0;
    let supplierTotalDebt = 0;

    // Tính tổng tiền hàng và tổng nợ của nhà cung cấp
    suppliers.forEach(supplier => {
      supplierTotalPurchaseAmount += supplier.totalPurchaseAmount || 0;
      supplierTotalDebt += supplier.totalDebt || 0;
    });

    // Truyền dữ liệu vào view
    res.render('customer/customer-list', { 
      customers, 
      totalPurchaseAmount,  // Tổng tiền hàng của khách hàng
      totalDebt,  // Tổng nợ của khách hàng
      suppliers,  // Truyền suppliers vào ejs
      supplierTotalPurchaseAmount,  // Tổng tiền hàng của nhà cung cấp
      supplierTotalDebt  // Tổng nợ của nhà cung cấp
    });
  } catch (error) {
    console.log(error);
    req.flash('error', 'Không thể tải danh sách khách hàng và nhà cung cấp');
    res.redirect('/home');
  }
};



// Tạo khách hàng mới
exports.createCustomer = async (req, res) => {
  const { customerId, name, phone, email, address, note, dob, gender } = req.body;

  try {
    // Kiểm tra nếu mã khách hàng đã tồn tại
    const existingCustomer = await Customer.findOne({ customerId });
    if (existingCustomer) {
      req.flash('error', 'Mã khách hàng đã tồn tại, vui lòng chọn mã khác.');
      return res.redirect('/customer');  // Ensure the error is passed to the view
    }

    // Kiểm tra tên khách hàng không được bỏ trống
    if (!name) {
      req.flash('error', 'Vui lòng nhập tên khách hàng');
      return res.redirect('/customer');
    }

    // Kiểm tra số điện thoại (chỉ chứa chữ số và đúng độ dài)
    const phoneRegex = /^\d{9,11}$/;
    if (phone && !phoneRegex.test(phone)) {
      req.flash('error', 'Số điện thoại chỉ được chứa chữ số và có độ dài từ 9 đến 11 chữ số.');
      return res.redirect('/customer');
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      req.flash('error', 'Định dạng email không hợp lệ. Vui lòng nhập địa chỉ email hợp lệ.');
      return res.redirect('/customer');
    }

    // Kiểm tra các trường bắt buộc khác
    const requiredFields = {
      phone: phone || 'chưa có',
      address: address || 'chưa có',
      note: note || 'chưa có',
      dob: dob || 'chưa có',
      email: email || 'chưa có'
    };

    const newCustomer = new Customer({
      customerId,
      name,
      phone: requiredFields.phone,
      email: requiredFields.email,
      address: requiredFields.address,
      note: requiredFields.note,
      dob: requiredFields.dob,
      gender
    });

    await newCustomer.save();
    req.flash('success', 'Khách hàng đã được thêm thành công');
    res.redirect('/customer');  
  } catch (error) {
    console.log(error);
    req.flash('error', 'Đã có lỗi khi thêm khách hàng');
    res.redirect('/customer');
  }
};


// Chỉnh sửa thông tin khách hàng
exports.editCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      req.flash('error', 'Khách hàng không tồn tại');
      return res.redirect('/customer');
    }
    res.render('customer/edit-customer', { customer });
  } catch (err) {
    console.log(err);
    req.flash('error', 'Không thể chỉnh sửa khách hàng');
    res.redirect('/customer');
  }
};

// Cập nhật thông tin khách hàng
exports.updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { customerId, name, phone, email, address, note, dob, gender } = req.body;

  try {
    const customer = await Customer.findById(id);
    if (!customer) {
      req.flash('error', 'Không tìm thấy khách hàng');
      return res.redirect('/customer');
    }

    // Kiểm tra mã khách hàng mới
    if (customerId && customerId !== customer.customerId) {
      const existingCustomer = await Customer.findOne({ customerId });
      if (existingCustomer) {
        req.flash('error', 'Mã khách hàng đã tồn tại, hãy chọn 1 ID khác.');
        return res.redirect(`/customer/edit/${id}`);
      }
    }

    // Kiểm tra tên khách hàng không trống
    if (!name) {
      req.flash('error', 'Vui lòng nhập tên khách hàng');
      return res.redirect(`/customer/edit/${id}`);
    }

    // Kiểm tra các trường bắt buộc
    const requiredFields = {
      phone: phone || 'chưa có',
      address: address || 'chưa có',
      note: note || 'chưa có',
      dob: dob || 'chưa có',
      email: email || 'chưa có'
    };

    customer.customerId = customerId || customer.customerId;
    customer.name = name || customer.name;
    customer.phone = requiredFields.phone;
    customer.email = requiredFields.email;
    customer.address = requiredFields.address;
    customer.note = requiredFields.note;
    customer.dob = requiredFields.dob;
    customer.gender = gender || customer.gender;

    await customer.save();
    req.flash('success', 'Thông tin khách hàng đã được cập nhật');
    res.redirect('/customer');
  } catch (error) {
    console.log(error);
    req.flash('error', 'Đã có lỗi khi cập nhật thông tin khách hàng');
    res.redirect(`/customer/edit/${id}`);
  }
};
