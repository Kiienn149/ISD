// controllers/importController.js
const Product = require('../models/product');
const Supplier = require('../models/supplier');
const ImportRecord = require('../models/importRecord');

// Tìm kiếm nhà cung cấp
exports.searchSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi tìm kiếm nhà cung cấp' });
  }
};

// Tìm kiếm sản phẩm
exports.searchProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi tìm kiếm sản phẩm' });
  }
};

// Lấy giá sản phẩm
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

// controllers/importController.js
exports.createImportRecord = async (req, res) => {
    try {
      const { warehouse, status, totalAmount, products } = req.body;
  
      const user = req.session.user.name;  // Lấy tên người nhập từ session
  
      // Kiểm tra nếu các trường bắt buộc có giá trị
      if (!warehouse || !status || !user || !totalAmount) {
        return res.status(400).json({ error: 'Các trường bắt buộc (warehouse, status, user, totalAmount) không được để trống.' });
      }
  
      // Kiểm tra nếu products là mảng và có dữ liệu
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'Không có sản phẩm để nhập kho' });
      }
  
      let total = 0;  // Tổng tiền của phiếu nhập
  
      // Lấy sản phẩm từ cơ sở dữ liệu và cập nhật số lượng
      const productData = [];
      for (const productDataItem of products) {
        const product = await Product.findOne({ name: productDataItem.product });
        if (product) {
          const productTotal = productDataItem.quantity * product.capital;  // Tính tổng tiền của sản phẩm (quantity * capital)
          total += productTotal;  // Cộng tổng tiền vào tổng của phiếu nhập
  
          // Thêm sản phẩm vào danh sách phiếu nhập kho
          productData.push({
            product: product._id,
            quantity: productDataItem.quantity
          });
  
          // Cập nhật số lượng sản phẩm trong kho
          product.quantity += productDataItem.quantity;
          await product.save();
        } else {
          return res.status(404).json({ error: `Sản phẩm ${productDataItem.product} không tồn tại` });
        }
      }
  
      // Tạo phiếu nhập kho với tổng tiền đã tính
      const newImportRecord = new ImportRecord({
        importId: `PN${Date.now()}`,
        warehouse,
        status,
        user,
        totalAmount: total,  // Sử dụng tổng tiền tính được
        products: productData
      });
  
      // Lưu phiếu nhập kho vào cơ sở dữ liệu
      await newImportRecord.save();
  
      // Chuyển hướng đến trang danh sách phiếu nhập
      res.redirect('/import');  // Chuyển hướng đến trang danh sách phiếu nhập
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi khi tạo phiếu nhập kho' });
    }
  };
  



// controllers/importController.js
exports.getImportRecords = async (req, res) => {
    try {
      const importRecords = await ImportRecord.find().populate('products.product');
      
      // Truyền đối tượng user vào view
      res.render('partials/importRecords', { 
        importRecords,
        user: req.session.user  // Truyền thông tin user từ session vào view
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi hệ thống khi tải danh sách phiếu nhập' });
    }
  };
  
  // controllers/importController.js
exports.getImportForm = (req, res) => {
    if (!req.session.user) {
      // Nếu không có user trong session, chuyển hướng về trang login hoặc thông báo lỗi
      return res.redirect('/login');
    }
  
    // Truyền thông tin người dùng từ session vào view
    res.render('partials/importForm', { 
      user: req.session.user // Truyền thông tin người dùng vào view
    });
  };
  