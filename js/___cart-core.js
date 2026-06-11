// ===== js/cart-core.js - ЯДРО КОРЗИНЫ =====

// Экранирование HTML
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Уведомления
function showToast(message, type = 'info') {
    let toast = document.getElementById('cartToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cartToast';
        toast.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            background: #1a2c3e; color: white; padding: 12px 24px;
            border-radius: 40px; z-index: 100000; font-size: 14px;
            opacity: 0; transition: 0.3s; pointer-events: none;
            font-family: system-ui, sans-serif; white-space: nowrap;
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

// Получить корзину
function getCart() {
    try {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    } catch (e) {
        return [];
    }
}

// Сохранить корзину
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof updateCartCount === 'function') updateCartCount();
}

// Добавить товар
function addToCart(product) {
    if (!product || !product.id) return false;
    const cart = getCart();
    const existing = cart.findIndex(item => item.id === product.id && item.size === product.size && item.color === product.color);
    if (existing !== -1) {
        cart[existing].quantity += product.quantity || 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: product.quantity || 1,
            size: product.size || '—',
            color: product.color || '—',
            image: product.image || null
        });
    }
    saveCart(cart);
    showToast(`✅ ${product.title} добавлен`, 'success');
    return true;
}

// Добавить по ID
function addToCartById(id, quantity = 1, size = '—', color = '—') {
    if (!window.allProducts || window.allProducts.length === 0) {
        showToast('Ошибка: каталог не загружен', 'error');
        return false;
    }
    const product = window.allProducts.find(p => p.id === id);
    if (!product) {
        showToast('Товар не найден', 'error');
        return false;
    }
    const price = product.discount_price && product.discount_price < product.price ? product.discount_price : product.price;
    return addToCart({
        id: product.id,
        title: product.title,
        price: price,
        quantity: quantity,
        size: size,
        color: color,
        image: product.images?.[0] || null
    });
}

// Обновить количество
function updateCartItemQuantity(id, size, color, delta) {
    const cart = getCart();
    const index = cart.findIndex(item => item.id === id && item.size === size && item.color === color);
    if (index === -1) return;
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    saveCart(cart);
}

// Удалить товар
function removeCartItem(id, size, color) {
    let cart = getCart();
    cart = cart.filter(item => !(item.id === id && item.size === size && item.color === color));
    saveCart(cart);
    showToast('Товар удалён', 'info');
}

// Очистить корзину (ТОЛЬКО ПОСЛЕ ОПЛАТЫ)
function clearCart() {
    localStorage.setItem('cart', '[]');
    if (typeof updateCartCount === 'function') updateCartCount();
}

// Получить сумму
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Получить количество
function getCartItemsCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}
