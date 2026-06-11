// ===== js/cart-init.js - ИНИЦИАЛИЗАЦИЯ =====

document.addEventListener('DOMContentLoaded', function() {
    // Кнопка корзины
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) cartBtn.addEventListener('click', openCartSidebar);
    
    // Закрытие корзины
    const closeCart = document.getElementById('closeCartBtn');
    if (closeCart) closeCart.addEventListener('click', closeCartSidebar);
    
    // Затемнение
    const overlay = document.getElementById('cartOverlay');
    if (overlay) overlay.addEventListener('click', closeCartSidebar);
    
    // Обновляем счётчик
    updateCartCount();
    
    // Добавляем анимацию
    const style = document.createElement('style');
    style.textContent = `@keyframes modalSlideIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}`;
    document.head.appendChild(style);
});

// Закрытие по ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCartSidebar();
        document.querySelectorAll('#checkoutModal, #paymentModal').forEach(m => m?.remove());
        document.body.style.overflow = '';
    }
});
