const Order = require('../models/order');  // Giả sử bạn có model Order

// Lấy báo cáo lợi nhuận
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
    
    // Áp dụng lọc theo customer, paymentMethod, salesperson, store nếu có
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

    // Lấy danh sách đơn hàng thỏa mãn điều kiện lọc
    const orders = await Order.find(filter);  // Tìm các đơn hàng theo điều kiện lọc

    // Tính toán các thông tin báo cáo: tổng số đơn hàng, tổng số tiền chiết khấu, doanh thu, vốn và lợi nhuận
    const totalOrders = orders.length;
    const totalDiscount = orders.reduce((acc, order) => acc + (order.discount || 0), 0);
    const salesRevenue = orders.reduce((acc, order) => acc + (order.salesRevenue || 0), 0);
    const capital = orders.reduce((acc, order) => acc + (order.capital || 0), 0);
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
