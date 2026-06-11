// ===== js/cart-init.js - ИНИЦИАЛИЗАЦИЯ =====

// Анимация для модальных окон
function addModalStyles() {
    if (!document.getElementById('cartModalStyles')) {
        const style = document.createElement('style');
        style.id = 'cartModalStyles';
        style.textContent = `
            @keyframes modalSlideIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Закрытие по ESC
function setupEscHandler() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const sidebar = document.getElementById('cartSidebar');
            if (sidebar && sidebar.classList.contains('open')) {
                if (typeof closeCartSidebar === 'function') closeCartSidebar();
            }
            
            const modal = document.getElementById('checkoutModalWindow');
            if (modal) modal.remove();
            
            const paymentModal = document.getElementById('sbpPaymentModal');
            if (paymentModal) paymentModal.remove();
            
            document.body.style.overflow = '';
        }
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Корзина инициализирована');
    
    // Добавляем стили
    addModalStyles();
    
    // Настраиваем ESC
    setupEscHandler();
    
    // Кнопки
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const overlay = document.getElementById('overlay');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cartBtn) cartBtn.addEventListener('click', function() {
        if (typeof openCartSidebar === 'function') openCartSidebar();
    });
    
    if (closeCart) closeCart.addEventListener('click', function() {
        if (typeof closeCartSidebar === 'function') closeCartSidebar();
    });
    
    if (overlay) overlay.addEventListener('click', function() {
        if (typeof closeCartSidebar === 'function') closeCartSidebar();
    });
    
    if (checkoutBtn) checkoutBtn.addEventListener('click', function() {
        if (typeof openCheckoutModal === 'function') openCheckoutModal();
    });
    
    // Обновляем счётчик
    if (typeof updateCartCount === 'function') updateCartCount();
    
    // Проверяем незавершённый заказ
    if (typeof restorePendingOrder === 'function') restorePendingOrder();
});
