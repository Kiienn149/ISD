const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const Customer = require('../models/customer');

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  try {
    const { productName, customerId, userName, quantity } = req.body;
    const product = await Product.findOne({ name: productName });  // Sử dụng tên sản phẩm thay vì productId
    const customer = await Customer.findById(customerId);
    const user = await User.findOne({ name: userName });

    // Kiểm tra nếu sản phẩm, khách hàng, hoặc nhân viên không tồn tại
    if (!product || !customer || !user) {
      return res.status(404).json({ error: 'Dữ liệu không hợp lệ, không tìm thấy sản phẩm, khách hàng, hoặc nhân viên bán hàng' });
    }

    // Kiểm tra nếu số lượng sản phẩm không đủ trong kho
    if (product.quantity < quantity) {
      return res.status(400).json({ error: 'Không đủ hàng trong kho' });
    }

    // Tính toán tổng tiền của đơn hàng
    const totalPrice = product.price * quantity;

    // Cập nhật tổng tiền mua hàng của khách hàng
    customer.totalPurchaseAmount += totalPrice; // Cộng tổng tiền vào `totalPurchaseAmount` của khách hàng
    await customer.save(); // Lưu thay đổi của khách hàng vào cơ sở dữ liệu

    // Tạo một đơn hàng mới
    const newOrder = new Order({
      product: product.name,   // Lưu tên sản phẩm vào đơn hàng
      customer: customerId,
      user: user.name,         // Lưu tên nhân viên bán hàng
      quantity,
      price: product.price,
      total: totalPrice,       // Tổng tiền của đơn hàng
      status: 'Đang xử lý',
      date: new Date(),
    });

    // Lưu đơn hàng mới
    await newOrder.save();

    // Giảm số lượng sản phẩm trong kho
    product.quantity -= quantity;
    await product.save();

    // Trả về thông báo thành công
    res.status(201).json({ message: 'Đơn hàng đã được tạo thành công', order: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};




// Lấy danh sách đơn hàng
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('product')   // Populating để lấy dữ liệu sản phẩm từ productId
      .populate('customer'); // Populating để lấy dữ liệu khách hàng từ customerId
    res.render('partials/order', { orders });
  } catch (err) {
    console.error(err);
    res.status(500).send('Không thể tải danh sách đơn hàng');
  }
};

// Route lấy giá sản phẩm
exports.getPrice = async (req, res) => {
  try {
    const productName = decodeURIComponent(req.params.productName);  // Giải mã tên sản phẩm
    const product = await Product.findOne({ name: new RegExp(productName, 'i') }); // Tìm kiếm không phân biệt chữ hoa chữ thường

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



// Route tìm kiếm sản phẩm theo tên
exports.searchProducts = async (req, res) => {
  try {
    const query = req.query.query || '';  // Lấy từ khóa tìm kiếm từ query string
    const products = await Product.find({ name: { $regex: query, $options: 'i' } }).limit(10);  // Tìm kiếm sản phẩm có tên chứa từ khóa (không phân biệt chữ hoa chữ thường)
    
    res.json(products);  // Trả về kết quả tìm kiếm dưới dạng JSON
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Lỗi hệ thống khi tìm kiếm sản phẩm' });  // Xử lý lỗi
  }
};





// Route tìm kiếm khách hàng
exports.searchCustomers = async (req, res) => {
  try {
    const query = req.query.query || '';
    const customers = await Customer.find({ name: { $regex: query, $options: 'i' } }).limit(10);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi hệ thống khi tìm kiếm khách hàng' });
  }
};

// Route tìm kiếm nhân viên bán hàng
exports.searchUsers = async (req, res) => {
  try {
    const query = req.query.query || '';
    const users = await User.find({ name: { $regex: query, $options: 'i' } }).limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi hệ thống khi tìm kiếm nhân viên' });
  }
};
