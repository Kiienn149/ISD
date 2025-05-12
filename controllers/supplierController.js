const Supplier = require('../models/supplier');

// Lấy danh sách nhà cung cấp
exports.getSupplierList = async (req, res) => {
  try {
    const suppliers = await Supplier.find();  
    let totalPurchaseAmount = 0;
    let totalDebt = 0;

    suppliers.forEach(supplier => {
      totalPurchaseAmount += supplier.totalPurchaseAmount || 0;
      totalDebt += supplier.totalDebt || 0;
    });

    res.render('customer/customer-list', { 
      suppliers, 
      totalPurchaseAmount,
      totalDebt 
    });
  } catch (error) {
    console.log(error);
    req.flash('error', 'Không thể tải danh sách nhà cung cấp');
    res.redirect('/home');
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
      return res.redirect('/supplier');  // Redirect to the supplier page if the ID exists
    }

    // Kiểm tra tên nhà cung cấp không được bỏ trống
    if (!name) {
      req.flash('error', 'Vui lòng nhập tên nhà cung cấp');
      return res.redirect('/supplier');  // Redirect to the supplier creation page
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
    req.flash('success', 'Nhà cung cấp đã được thêm thành công');
    res.redirect('/supplier');  // Redirect to the supplier page after creation
  } catch (error) {
    console.log(error);
    req.flash('error', 'Đã có lỗi khi thêm nhà cung cấp');
    res.redirect('/supplier');  // In case of error, redirect to the supplier page
  }
};


// Chỉnh sửa thông tin nhà cung cấp
exports.editSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      req.flash('error', 'Nhà cung cấp không tồn tại');
      return res.redirect('/supplier');
    }
    res.render('supplier/edit-supplier', { supplier });
  } catch (err) {
    console.log(err);
    req.flash('error', 'Không thể chỉnh sửa nhà cung cấp');
    res.redirect('/supplier');
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
      return res.redirect('/supplier');
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
    res.redirect('/supplier');
  }
};
exports.deleteSupplier = async (req, res) => {
  const { id } = req.params;
  try {
    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) {
      req.flash('error', 'Nhà cung cấp không tồn tại');
      return res.redirect('/supplier');
    }
    req.flash('success', 'Bạn đã xóa nhà cung cấp thành công');
    res.redirect('/supplier');  // Trở lại trang danh sách nhà cung cấp
  } catch (err) {
    console.log(err);
    req.flash('error', 'Không thể xóa nhà cung cấp');
    res.redirect('/supplier');
  }
};