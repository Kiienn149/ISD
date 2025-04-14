document.addEventListener('DOMContentLoaded', () => {
    // Hiệu ứng hover cho sản phẩm
    const productItems = document.querySelectorAll('.product-item');
    productItems.forEach(item => {
        item.addEventListener('mouseover', () => {
            item.style.transform = 'scale(1.05)';
        });
        item.addEventListener('mouseout', () => {
            item.style.transform = 'scale(1)';
        });
    });

    // Giỏ hàng - thêm sản phẩm vào giỏ
    const addToCartButtons = document.querySelectorAll('.btn-add');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            alert('Sản phẩm đã được thêm vào giỏ hàng!');
        });
    });
});

