// ===== js/cart-init.js - ИНИЦИАЛИЗАЦИЯ =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Инициализация корзины');
    
    // Кнопка открытия корзины
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', openCartSidebar);
        console.log('✅ Кнопка корзины найдена');
    } else {
        console.error('❌ Кнопка #cartBtn не найдена');
    }
    
    // Кнопка закрытия корзины
    const closeCart = document.getElementById('closeCartBtn');
    if (closeCart) {
        closeCart.addEventListener('click', closeCartSidebar);
    }
    
    // Затемнение
    const overlay = document.getElementById('cartOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeCartSidebar);
    }
    
    // ВАЖНО: Кнопка оформления заказа в корзине
    const checkoutBtn = document.getElementById('cartCheckoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            console.log('🛒 Нажата кнопка ОФОРМИТЬ ЗАКАЗ');
            if (typeof openCheckoutModal === 'function') {
                openCheckoutModal();
            } else {
                console.error('❌ Функция openCheckoutModal не найдена!');
                alert('Ошибка: модуль оформления не загружен');
            }
        });
        console.log('✅ Кнопка оформления заказа найдена');
    } else {
        console.error('❌ Кнопка #cartCheckoutBtn не найдена в DOM');
    }
    
    // Обновляем счётчик
    updateCartCount();
    
    // Анимация
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
