// ===== js/cart-core.js - ЯДРО КОРЗИНЫ =====

// Корзина хранится в localStorage, НЕ ОЧИЩАЕТСЯ до успешной оплаты

// Безопасное экранирование
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Показ уведомлений
function showToast(message, type = 'info') {
    let toast = document.getElementById('cartToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cartToast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #1a2c3e;
            color: white;
            padding: 12px 24px;
            border-radius: 40px;
            z-index: 100000;
            font-size: 14px;
            opacity: 0;
            transition: 0.3s;
            pointer-events: none;
            white-space: nowrap;
            font-family: system-ui, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(toast);
    }
    
    if (type === 'success') toast.style.background = '#00897b';
    else if (type === 'error') toast.style.background = '#e74c3c';
    else toast.style.background = '#1a2c3e';
    
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

// Получить корзину из localStorage
function getCart() {
    try {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (e) {
        console.error('Ошибка чтения корзины:', e);
        return [];
    }
}

// Сохранить корзину в localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    // Обновляем счётчик и отображение
    if (typeof updateCartCount === 'function') updateCartCount();
}

// Добавить товар в корзину
function addToCart(product) {
    const cart = getCart();
    const existingIndex = cart.findIndex(item => 
        item.id === product.id && 
        item.size === product.size && 
        item.color === product.color
    );
    
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += product.quantity || 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: product.quantity || 1,
            size: product.size || '—',
            color: product.color || '—',
            image: product.image || null,
            article: product.article || '—'
        });
    }
    
    saveCart(cart);
    showToast(`✅ ${product.title} добавлен в корзину`, 'success');
}

// Обновить количество товара
function updateCartItemQuantity(id, size, color, delta) {
    const cart = getCart();
    const index = cart.findIndex(item => 
        item.id === id && 
        item.size === size && 
        item.color === color
    );
    
    if (index !== -1) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart(cart);
    }
}

// Удалить товар из корзины
function removeCartItem(id, size, color) {
    let cart = getCart();
    cart = cart.filter(item => 
        !(item.id === id && item.size === size && item.color === color)
    );
    saveCart(cart);
    showToast('Товар удалён из корзины', 'info');
}

// Очистить корзину (вызывается ТОЛЬКО после успешной оплаты!)
function clearCart() {
    localStorage.setItem('cart', '[]');
    if (typeof updateCartCount === 'function') updateCartCount();
    console.log('🗑️ Корзина очищена (после успешной оплаты)');
}

// Получить общую сумму корзины
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Получить количество товаров в корзине
function getCartItemsCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}
