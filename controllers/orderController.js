const Order = require('../models/order');

exports.createOrder = async (req, res) => {
  const { product, customer, quantity, price } = req.body;

  if (!product || !customer || !quantity || !price) {
    req.flash('error', 'Vui lòng điền đầy đủ thông tin');
    return res.redirect('/home');
  }

  const total = quantity * price;

  try {
    const newOrder = new Order({
      product,
      customer,
      quantity,
      price,
      total,
      date: new Date(),
      status: 'đang chờ'
    });

    await newOrder.save();
    req.flash('success', 'Tạo đơn hàng thành công!');
    res.redirect('/home');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Lỗi khi tạo đơn hàng');
    res.redirect('/home');
  }
};
