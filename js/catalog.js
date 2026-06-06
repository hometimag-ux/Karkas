// ===== ИНИЦИАЛИЗАЦИЯ КАТАЛОГА =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница каталога загружена');
    
    // Загружаем товары из CRM
    if (typeof loadProductsFromCRM === 'function') {
        loadProductsFromCRM();
    } else {
        console.warn('loadProductsFromCRM не найдена');
    }
    
    // Обновляем счётчик корзины
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    
    // Кнопка "В каталог" на главной (если есть)
    const shopNowBtn = document.getElementById('shopNowBtn');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const productsGrid = document.getElementById('productsGrid');
            if (productsGrid) {
                productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
    
    // Открытие корзины
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const overlay = document.getElementById('overlay');
    const cartSidebar = document.getElementById('cartSidebar');
    
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            cartSidebar.classList.add('open');
            overlay.classList.add('active');
        });
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', function() {
            cartSidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', function() {
            cartSidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
    
    // Оформление заказа
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            if (cart.length === 0) {
                if (typeof showToast === 'function') {
                    showToast('Корзина пуста');
                } else {
                    alert('Корзина пуста');
                }
                return;
            }
            
            if (typeof showToast === 'function') {
                showToast('✅ Заказ оформлен! Спасибо за покупку! 💙');
            } else {
                alert('✅ Заказ оформлен! Спасибо за покупку! 💙');
            }
            
            localStorage.removeItem('cart');
            if (typeof updateCartCount === 'function') updateCartCount();
            if (typeof renderProducts === 'function') renderProducts();
            cartSidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
});
