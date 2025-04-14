const Product = require('../models/product');  // Đảm bảo đã có model Product

// Lấy danh sách tồn kho
exports.getInventoryList = async (req, res) => {
  try {
    // Lấy tất cả sản phẩm từ Product model
    const products = await Product.find();  // Giả sử có model Product

    let totalQuantity = 0;
    let totalStockValue = 0;
    let totalSalesValue = 0;

    const inventoryItems = products.map(item => {
      // Tính toán vốn tồn kho và giá trị tồn kho
      const stockValue = item.quantity * item.capital; // Vốn tồn kho = Số lượng * Giá vốn
      const salesValue = item.quantity * item.price; // Giá trị tồn kho = Số lượng * Giá bán

      totalQuantity += item.quantity;
      totalStockValue += stockValue;
      totalSalesValue += salesValue;

      return {
        productId: item.sku,         // Mã sản phẩm
        productName: item.name,      // Tên sản phẩm
        quantityInStock: item.quantity, // Số lượng tồn
        stockValue: stockValue,      // Vốn tồn kho
        salesValue: salesValue      // Giá trị tồn kho
      };
    });

    // Truyền dữ liệu vào view
    res.render('inventory/inventory-list', {
      inventoryItems,
      totalQuantity,
      totalStockValue,
      totalSalesValue
    });
  } catch (err) {
    console.log(err);
    req.flash('error', 'Không thể tải danh sách sản phẩm trong kho');
    res.redirect('/home');
  }
};
