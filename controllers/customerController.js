const Customer = require('../models/customer');
const Supplier = require('../models/supplier');
// Lấy danh sách khách hàng
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

    res.render('customer/customer-list', { 
      customers, 
      totalPurchaseAmount,
      totalDebt,
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
    const existingCustomer = await Customer.findOne({ customerId });
    if (existingCustomer) {
      req.flash('error', 'ID Khách hàng đã tồn tại, hãy chọn 1 ID khác.');
      return res.redirect('/customer');  
    }

    const newCustomer = new Customer({
      customerId,
      name,
      phone,
      email,
      address,
      note,
      dob,
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

    customer.customerId = customerId || customer.customerId;
    customer.name = name || customer.name;
    customer.phone = phone || customer.phone;
    customer.email = email || customer.email;
    customer.address = address || customer.address;
    customer.note = note || customer.note;
    customer.dob = dob || customer.dob;
    customer.gender = gender || customer.gender;

    await customer.save();
    req.flash('success', 'Thông tin khách hàng đã được cập nhật');
    res.redirect('/customer');
  } catch (error) {
    console.log(error);
    req.flash('error', 'Đã có lỗi khi cập nhật thông tin khách hàng');
    res.redirect('/customer');
  }
};
