const Product = require('../models/product');
const Supplier = require('../models/supplier');
const ImportRecord = require('../models/importRecord');

// 🔍 API: Tìm kiếm nhà cung cấp
exports.searchSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi tìm kiếm nhà cung cấp' });
  }
};

// 🔍 API: Tìm kiếm sản phẩm
exports.searchProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi tìm kiếm sản phẩm' });
  }
};

// 💰 API: Lấy giá sản phẩm theo tên
exports.getPrice = async (req, res) => {
  try {
    const productName = decodeURIComponent(req.params.productName);
    const product = await Product.findOne({ name: productName });

    if (product) {
      res.json({ price: product.price });
    } else {
      res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Lỗi hệ thống khi lấy giá sản phẩm' });
  }
};

// 💾 Tạo phiếu nhập kho
exports.createImportRecord = async (req, res) => {
  try {
    const { warehouse, status, totalAmount, products } = req.body;
    const user = req.session.user?.name || 'unknown';

    if (!warehouse || !status || !user || !totalAmount) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc.' });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Không có sản phẩm để nhập kho' });
    }

    let total = 0;
    const productData = [];

    for (const item of products) {
      const product = await Product.findOne({ name: item.product });
      if (product) {
        const itemTotal = item.quantity * product.capital;
        total += itemTotal;

        productData.push({
          product: product._id,
          quantity: item.quantity
        });

        product.quantity += item.quantity;
        await product.save();
      } else {
        return res.status(404).json({ error: `Sản phẩm ${item.product} không tồn tại` });
      }
    }

    const newImportRecord = new ImportRecord({
      importId: `PN${Date.now()}`,
      warehouse,
      status,
      user,
      totalAmount: total,
      products: productData
    });

    await newImportRecord.save();
    res.redirect('/import');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi tạo phiếu nhập kho' });
  }
};

// 📄 Giao diện: Danh sách phiếu nhập
exports.getImportRecords = async (req, res) => {
  try {
    const importRecords = await ImportRecord.find().populate('products.product');
    res.render('layout', {
      body: 'import/index',
      importRecords,  
      user: req.session.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi hệ thống khi tải danh sách phiếu nhập' });
  }
};

// 📄 Giao diện: Form tạo phiếu nhập
exports.getImportForm = (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  res.render('layout', {
    body: 'import/create',
    user: req.session.user
  });
};
