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

    res.render('supplier/supplier-list', { 
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
    const existingSupplier = await Supplier.findOne({ supplierId });
    if (existingSupplier) {
      req.flash('error', 'ID Nhà cung cấp đã tồn tại, hãy chọn 1 ID khác.');
      return res.redirect('/supplier');  
    }

    const newSupplier = new Supplier({
      supplierId,
      name,
      phone,
      email,
      address,
      note
    });

    await newSupplier.save();
    req.flash('success', 'Nhà cung cấp đã được thêm thành công');
    res.redirect('/supplier');  
  } catch (error) {
    console.log(error);
    req.flash('error', 'Đã có lỗi khi thêm nhà cung cấp');
    res.redirect('/supplier');
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
