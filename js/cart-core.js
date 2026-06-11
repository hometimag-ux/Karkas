// ===== js/cart-core.js - ЯДРО КОРЗИНЫ =====

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
function showToast(message, duration = 3000) {
    let toast = document.getElementById('customToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'customToast';
        toast.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            background: #1a2c3e; color: white; padding: 12px 24px;
            border-radius: 40px; z-index: 100000; font-size: 14px;
            opacity: 0; transition: 0.3s; pointer-events: none; white-space: nowrap;
            font-family: system-ui, -apple-system, sans-serif;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, duration);
}

// Получить корзину
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

// Сохранить корзину
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof updateCartCount === 'function') updateCartCount();
}

// Добавить товар в корзину по ID
function addToCartById(id) {
    const product = window.allProducts ? window.allProducts.find(p => p.id === id) : null;
    if (!product) {
        showToast('Ошибка: товар не найден');
        return;
    }
    let cart = getCart();
    const existing = cart.find(item => item.id === id);
    
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.discount_price || product.price,
            quantity: 1,
            size: '—',
            color: '—',
            image: product.images?.[0] || null
        });
    }
    
    saveCart(cart);
    showToast(`✅ ${product.title} добавлен в корзину`);
}

// Добавить товар с деталями
function addToCartWithDetails(id, title, price, size, color, article, image) {
    let cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === id && item.size === size && item.color === color);
    
    if (existingIndex !== -1) {
        cart[existingIndex].quantity++;
    } else {
        cart.push({
            id: id,
            title: title,
            price: price,
            quantity: 1,
            size: size || '—',
            color: color || '—',
            image: image || null
        });
    }
    
    saveCart(cart);
    showToast(`✅ ${title} (${size}, ${color}) добавлен в корзину`);
}

// Обновить количество товара
function updateQuantity(id, delta, size, color) {
    let cart = getCart();
    const index = cart.findIndex(item => item.id === id && item.size === size && item.color === color);
    
    if (index !== -1) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart(cart);
    }
}

// Удалить товар из корзины
function removeFromCart(id, size, color) {
    let cart = getCart();
    cart = cart.filter(item => !(item.id === id && item.size === size && item.color === color));
    saveCart(cart);
    showToast('Товар удалён из корзины');
}

// Очистить корзину
function clearCart() {
    localStorage.setItem('cart', '[]');
    if (typeof updateCartCount === 'function') updateCartCount();
}

// Получить общую сумму
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Получить количество товаров
function getCartItemsCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}
