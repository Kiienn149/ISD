const Product = require('../models/product'); // Đảm bảo đã có model Product

// Hiển thị danh sách sản phẩm
exports.showProductList = async (req, res) => {
  try {
    const products = await Product.find(); // Lấy danh sách sản phẩm từ database
    res.render('product/product-list', { products, user: req.session.user });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', err);
    req.flash('error', 'Không thể lấy danh sách sản phẩm');
    res.redirect('/home');
  }
};

// Hiển thị chi tiết sản phẩm
exports.showProductDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id); // Tìm sản phẩm theo ID
    if (!product) {
      req.flash('error', 'Sản phẩm không tồn tại');
      return res.redirect('/products');
    }
    res.render('product/product-detail', { product, user: req.session.user });
  } catch (err) {
    console.error('Lỗi khi lấy chi tiết sản phẩm:', err);
    req.flash('error', 'Không thể lấy thông tin sản phẩm');
    res.redirect('/products');
  }
};

// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
  const { name, sku, price, quantity, category, manufacturer, capital } = req.body;  // Thêm 'capital' vào

  // Kiểm tra giá bán không thể thấp hơn giá vốn
  if (price < capital) {
    req.flash('error', 'Giá sản phẩm không thể thấp hơn giá vốn');
    return res.redirect('/products/create');
  }

  try {
    // Kiểm tra mã sản phẩm đã tồn tại chưa
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      req.flash('error', 'Mã sản phẩm đã tồn tại. Vui lòng chọn mã khác.');
      return res.redirect('/products/create');
    }

    const newProduct = new Product({
      name,
      sku,
      price,
      quantity,
      category,
      manufacturer,
      capital  // Lưu giá vốn
    });

    await newProduct.save();
    req.flash('success', 'Sản phẩm đã được thêm');
    res.redirect('/products');
  } catch (err) {
    console.error('Lỗi khi tạo sản phẩm:', err);
    req.flash('error', 'Không thể tạo sản phẩm');
    res.redirect('/products/create');
  }
};



// Sửa thông tin sản phẩm
exports.editProduct = async (req, res) => {
  const { id } = req.params;
  const { name, sku, price, capital, quantity, category, manufacturer } = req.body;

  try {
    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await Product.findById(id);
    if (!product) {
      req.flash('error', 'Sản phẩm không tồn tại');
      return res.redirect('/products');
    }

    // Kiểm tra mã sản phẩm có bị thay đổi không
    if (sku !== product.sku) {
      req.flash('error', 'Không thể sửa mã sản phẩm vì nó được liên kết với các mặt hàng tồn kho');
      return res.redirect(`/products/edit/${id}`);
    }

    // Kiểm tra giá bán không thể thấp hơn giá vốn
    if (price < capital) {
      req.flash('error', 'Giá sản phẩm không thể thấp hơn giá vốn');
      return res.redirect(`/products/edit/${id}`);
    }

    // Cập nhật thông tin sản phẩm
    product.name = name || product.name;
    product.sku = sku || product.sku;
    product.price = price || product.price;
    product.capital = capital || product.capital;  // Cập nhật giá vốn
    product.quantity = quantity || product.quantity;
    product.category = category || product.category;
    product.manufacturer = manufacturer || product.manufacturer;

    await product.save();
    req.flash('success', 'Sản phẩm đã được cập nhật');
    res.redirect('/products');
  } catch (err) {
    console.error('Lỗi khi cập nhật sản phẩm:', err);
    req.flash('error', 'Không thể cập nhật sản phẩm');
    res.redirect(`/products/edit/${id}`);
  }
};




// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await Product.findByIdAndDelete(id);
    req.flash('success', 'Sản phẩm đã được xóa');
    res.redirect('/products');
  } catch (err) {
    console.error('Lỗi khi xóa sản phẩm:', err);
    req.flash('error', 'Không thể xóa sản phẩm');
    res.redirect('/products');
  }
};
