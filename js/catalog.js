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
    
    // Открытие корзины
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const overlay = document.getElementById('overlay');
    const cartSidebar = document.getElementById('cartSidebar');
    
    if (cartBtn && cartSidebar && overlay) {
        cartBtn.addEventListener('click', function() {
            cartSidebar.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeCart && cartSidebar && overlay) {
        closeCart.addEventListener('click', function() {
            cartSidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        overlay.addEventListener('click', function() {
            cartSidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
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
                }
                return;
            }
            
            if (typeof showToast === 'function') {
                showToast('✅ Заказ оформлен! Спасибо за покупку! 💙');
            }
            
            localStorage.removeItem('cart');
            if (typeof updateCartCount === 'function') updateCartCount();
            if (typeof updateCartDisplay === 'function') updateCartDisplay();
            
            cartSidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
});
