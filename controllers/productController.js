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
// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
  const { name, sku, price, quantity, category, manufacturer, capital } = req.body;

  // Kiểm tra giá bán, giá vốn, và số lượng phải lớn hơn 0
  if (price <= 0 || capital <= 0 || quantity <= 0) {
    req.flash('error', 'Giá bán, giá vốn và số lượng phải lớn hơn 0');
    return res.redirect('/products/create');
  }

  // Tạo mã sản phẩm nếu chưa có mã
  const productSku = sku || generateUniqueSku();  // Hàm tạo mã sản phẩm duy nhất nếu không nhập mã

  try {
    // Kiểm tra mã sản phẩm đã tồn tại chưa
    const existingProduct = await Product.findOne({ sku: productSku });
    if (existingProduct) {
      req.flash('error', 'Mã sản phẩm đã tồn tại. Vui lòng chọn mã khác.');
      return res.redirect('/products/create');
    }

    const newProduct = new Product({
      name,
      sku: productSku,
      price,
      quantity,
      category,
      manufacturer,
      capital  
    });

    await newProduct.save();
    req.flash('success', 'Tạo sản phẩm thành công');
    res.redirect('/products');  // Redirect về trang danh sách sản phẩm
  } catch (err) {
    console.error('Lỗi khi tạo sản phẩm:', err);
    req.flash('error', 'Không thể tạo sản phẩm');
    res.redirect('/products/create');
  }
};

function generateUniqueSku() {
  return 'SKU-' + Math.random().toString(36).substr(10000, 100000);  // Tạo mã ngẫu nhiên (có thể thay đổi theo yêu cầu)
}


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
