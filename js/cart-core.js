// ===== js/cart-core.js - ЯДРО КОРЗИНЫ =====

// Корзина хранится в localStorage, НЕ ОЧИЩАЕТСЯ до успешной оплаты

// Безопасное экранирование HTML
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
    
    if (type === 'success') {
        toast.style.background = '#00897b';
    } else if (type === 'error') {
        toast.style.background = '#e74c3c';
    } else {
        toast.style.background = '#1a2c3e';
    }
    
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

// Получить корзину из localStorage
function getCart() {
    try {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    } catch (e) {
        console.error('Ошибка чтения корзины:', e);
        return [];
    }
}

// Сохранить корзину в localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
}

// Добавить товар в корзину
function addToCart(product) {
    if (!product || !product.id || !product.title || !product.price) {
        console.error('Ошибка: неверные данные товара', product);
        showToast('Ошибка: неверные данные товара', 'error');
        return false;
    }
    
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
    return true;
}

// Добавить товар в корзину по ID
function addToCartById(id, quantity = 1, size = '—', color = '—') {
    if (typeof products === 'undefined' || !products) {
        console.error('Ошибка: массив products не найден');
        showToast('Ошибка: каталог товаров не загружен', 'error');
        return false;
    }
    
    const product = products.find(p => p.id === id);
    
    if (!product) {
        console.error(`Товар с id ${id} не найден в каталоге`);
        showToast('Ошибка: товар не найден', 'error');
        return false;
    }
    
    return addToCart({
        id: product.id,
        title: product.title,
        price: product.discount_price || product.price,
        quantity: quantity,
        size: size,
        color: color,
        image: product.images ? product.images[0] : null,
        article: product.article
    });
}

// Обновить количество товара
function updateCartItemQuantity(id, size, color, delta) {
    const cart = getCart();
    const index = cart.findIndex(item => 
        item.id === id && 
        item.size === size && 
        item.color === color
    );
    
    if (index === -1) return;
    
    const newQuantity = cart[index].quantity + delta;
    
    if (newQuantity <= 0) {
        cart.splice(index, 1);
        showToast('Товар удалён из корзины', 'info');
    } else {
        cart[index].quantity = newQuantity;
    }
    
    saveCart(cart);
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

// Очистить корзину (вызывается ТОЛЬКО после успешной оплаты)
function clearCart() {
    localStorage.setItem('cart', '[]');
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
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

// Сохранить незавершённый заказ
function savePendingOrder(orderData) {
    localStorage.setItem('pendingOrder', JSON.stringify(orderData));
}

// Получить незавершённый заказ
function getPendingOrder() {
    try {
        const pending = localStorage.getItem('pendingOrder');
        return pending ? JSON.parse(pending) : null;
    } catch (e) {
        return null;
    }
}

// Очистить незавершённый заказ
function clearPendingOrder() {
    localStorage.removeItem('pendingOrder');
}
