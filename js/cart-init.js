// ===== js/cart-init.js - ИНИЦИАЛИЗАЦИЯ =====

// Инициализация корзины
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Корзина инициализирована');
    
    // Находим элементы
    const cartBtn = document.getElementById('cartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartOverlay = document.getElementById('cartOverlay');
    const checkoutBtn = document.getElementById('cartCheckoutBtn');
    
    // Обработчики для открытия/закрытия корзины
    if (cartBtn) {
        cartBtn.addEventListener('click', openCartSidebar);
    }
    
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCartSidebar);
    }
    
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCartSidebar);
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', openCheckoutModal);
    }
    
    // Обновляем счётчик
    updateCartCount();
    
    // Проверяем незавершённый заказ
    checkPendingOrder();
});

// Закрытие по ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCartSidebar();
        
        const modal = document.getElementById('checkoutModal');
        if (modal) modal.remove();
        
        const sbpModal = document.getElementById('sbpModal');
        if (sbpModal) sbpModal.remove();
        
        document.body.style.overflow = '';
    }
});
