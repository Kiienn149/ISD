const Supplier = require('../models/supplier');

// Lấy danh sách nhà cung cấp
// Lấy danh sách nhà cung cấp
exports.getSupplierList = async (req, res) => {
  try {
    const suppliers = await Supplier.find();  
    let totalPurchaseAmount = 0;
    let totalDebt = 0;

    // Tính tổng tiền hàng và tổng nợ của nhà cung cấp
    suppliers.forEach(supplier => {
      totalPurchaseAmount += supplier.totalPurchaseAmount || 0;
      totalDebt += supplier.totalDebt || 0;
    });

    // Lấy danh sách khách hàng
    const customers = await Customer.find();
    let customerTotalPurchaseAmount = 0;
    let customerTotalDebt = 0;

    // Tính tổng tiền hàng và tổng nợ của khách hàng
    customers.forEach(customer => {
      customerTotalPurchaseAmount += customer.totalPurchaseAmount || 0;
      customerTotalDebt += customer.totalDebt || 0;
    });

    // Truyền dữ liệu vào view
    res.render('customer/customer-list', { 
      customers, // Truyền danh sách khách hàng
      totalPurchaseAmount: customerTotalPurchaseAmount, // Tổng tiền hàng của khách hàng
      totalDebt: customerTotalDebt, // Tổng nợ của khách hàng
      suppliers, // Truyền danh sách nhà cung cấp
      supplierTotalPurchaseAmount: totalPurchaseAmount, // Tổng tiền hàng của nhà cung cấp
      supplierTotalDebt: totalDebt // Tổng nợ của nhà cung cấp
    });
  } catch (error) {
    console.log(error);
    req.flash('error', 'Không thể tải danh sách nhà cung cấp');
    res.redirect('/customer');
  }
};


// Tạo nhà cung cấp mới
exports.createSupplier = async (req, res) => {
  const { supplierId, name, phone, email, address, note } = req.body;

  try {
    // Kiểm tra nếu mã nhà cung cấp đã tồn tại
    const existingSupplier = await Supplier.findOne({ supplierId });
    if (existingSupplier) {
      req.flash('error', 'Mã nhà cung cấp đã tồn tại, hãy chọn 1 ID khác.');
      return res.redirect('/customer');  // Redirect to the supplier page if the ID exists
    }

    // Kiểm tra tên nhà cung cấp không được bỏ trống
    if (!name) {
      req.flash('error', 'Vui lòng nhập tên nhà cung cấp');
      return res.redirect('/customer');  // Redirect to the supplier creation page
    }

    // Kiểm tra các trường khác và tự động điền "chưa có" nếu để trống
    const requiredFields = {
      phone: phone || 'chưa có',
      address: address || 'chưa có',
      note: note || 'chưa có',
      email: email || 'chưa có'
    };

    const newSupplier = new Supplier({
      supplierId,
      name,
      phone: requiredFields.phone,
      email: requiredFields.email,
      address: requiredFields.address,
      note: requiredFields.note
    });

    await newSupplier.save();
    req.flash('success', 'Tạo nhà cung cấp thành công');

    // Sau khi tạo nhà cung cấp thành công, lấy lại danh sách khách hàng và nhà cung cấp
    const customers = await Customer.find();
    const suppliers = await Supplier.find();
    let totalPurchaseAmount = 0;
    let totalDebt = 0;
    
    customers.forEach(customer => {
      totalPurchaseAmount += customer.totalPurchaseAmount || 0;
      totalDebt += customer.totalDebt || 0;
    });

    let supplierTotalPurchaseAmount = 0;
    let supplierTotalDebt = 0;

    suppliers.forEach(supplier => {
      supplierTotalPurchaseAmount += supplier.totalPurchaseAmount || 0;
      supplierTotalDebt += supplier.totalDebt || 0;
    });

    // Render lại view và truyền tất cả dữ liệu vào
    res.render('customer/customer-list', { 
      customers, 
      totalPurchaseAmount,
      totalDebt,
      suppliers,
      supplierTotalPurchaseAmount,
      supplierTotalDebt
    });

  } catch (error) {
    console.log(error);
    req.flash('error', 'Tạo nhà cung cấp thành công');
    res.redirect('/customer');  // In case of error, redirect to the supplier page
  }
};



// Chỉnh sửa thông tin nhà cung cấp
exports.editSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      req.flash('error', 'Nhà cung cấp không tồn tại');
      return res.redirect('/customer');
    }
    res.render('/customer/edit-supplier', { supplier });
  } catch (err) {
    console.log(err);
    req.flash('error', 'Không thể chỉnh sửa nhà cung cấp');
    res.redirect('/customer');
  }
};

// Cập nhật thông tin nhà cung cấp
exports.updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { supplierId, name, phone, email, address, note } = req.body;

  try {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      req.flash('error', 'Không tìm thấy nhà cung cấp');
      return res.redirect('/customer');
    }

    supplier.supplierId = supplierId || supplier.supplierId;
    supplier.name = name || supplier.name;
    supplier.phone = phone || supplier.phone;
    supplier.email = email || supplier.email;
    supplier.address = address || supplier.address;
    supplier.note = note || supplier.note;

    await supplier.save();
    req.flash('success', 'Thông tin nhà cung cấp đã được cập nhật');
    res.redirect('/supplier');
  } catch (error) {
    console.log(error);
    req.flash('error', 'Đã có lỗi khi cập nhật thông tin nhà cung cấp');
    res.redirect('/customer');
  }
};
exports.deleteSupplier = async (req, res) => {
  const { id } = req.params;
  try {
    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) {
      req.flash('error', 'Nhà cung cấp không tồn tại');
      return res.redirect('/customer');
    }
    req.flash('success', 'Bạn đã xóa nhà cung cấp thành công');
    res.redirect('/customer');  // Trở lại trang danh sách nhà cung cấp
  } catch (err) {
    console.log(err);
    req.flash('error', 'Không thể xóa nhà cung cấp');
    res.redirect('/customer');
  }
};