const Order = require('../models/order');
const Product = require('../models/product');

exports.getProfitReport = async (req, res) => {
  try {
    // Lấy các tham số filter từ query string
    const { startDate, endDate, customer, paymentMethod, salesperson, store } = req.query;

    // Tạo bộ lọc cho việc tìm kiếm đơn hàng
    const filter = {};

    // Áp dụng lọc theo ngày nếu có
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Áp dụng lọc theo các tham số khác nếu có
    if (customer) {
      filter.customer = customer;
    }
    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }
    if (salesperson) {
      filter.salesperson = salesperson;
    }
    if (store) {
      filter.store = store;
    }

    // Lấy danh sách đơn hàng thỏa mãn điều kiện lọc và populate dữ liệu sản phẩm và khách hàng
    const orders = await Order.find(filter)
      .populate('customer')  // Populate dữ liệu khách hàng
      .populate('product');  // Populate dữ liệu sản phẩm

    // Tính toán các thông tin báo cáo
    const totalOrders = orders.length;
    const totalDiscount = orders.reduce((acc, order) => acc + (order.discount || 0), 0);
    const salesRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);

    // Kiểm tra capital và tính vốn
    const capital = orders.reduce((acc, order) => {
      // Kiểm tra nếu sản phẩm có thông tin capital
      if (order.product && order.product.capital) {
        return acc + (order.product.capital * order.quantity || 0);
      }
      return acc;
    }, 0);

    const profit = salesRevenue - capital - totalDiscount;

    // Render báo cáo lợi nhuận với các thông tin cần thiết
    res.render('profit/profit-report', {
      orders,
      totalOrders,
      totalDiscount,
      salesRevenue,
      capital,
      profit,
      startDate,
      endDate,
      customer,
      paymentMethod,
      salesperson,
      store
    });
  } catch (error) {
    console.log(error);
    req.flash('error', 'Không thể tải báo cáo lợi nhuận');
    res.redirect('/home');
  }
};
