// ===== КОРЗИНА =====

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counter = document.getElementById('cartCounter');
    if (counter) counter.textContent = total;
    updateCartDisplay();
    console.log('Корзина обновлена, товаров:', total);
}

function addToCartWithDetails(id, title, price, size, color, article) {
    console.log('Добавление в корзину:', {id, title, price, size, color, article});
    
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
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
            article: article || '—'
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    if (typeof showToast === 'function') showToast(`✅ ${title} (${size}, ${color}) добавлен в корзину`);
}

function addToCartById(id) {
    const product = window.allProducts ? window.allProducts.find(p => p.id === id) : null;
    if (!product) return;
    
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
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
            article: product.article || '—'
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    if (typeof showToast === 'function') showToast(`✅ ${product.title} добавлен в корзину`);
}

function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const container = document.getElementById('cartItems');
    const totalContainer = document.getElementById('cartTotal');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
        if (totalContainer) totalContainer.innerHTML = '';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-title">${escapeHtml(item.title)}</div>
                    <div class="cart-item-details">
                        <span class="cart-item-article">Арт: ${escapeHtml(item.article)}</span>
                        <span class="cart-item-size">Размер: ${escapeHtml(item.size)}</span>
                        <span class="cart-item-color">Цвет: ${escapeHtml(item.color)}</span>
                    </div>
                </div>
                <div class="cart-item-price">${item.price.toLocaleString()} ₽ × ${item.quantity}</div>
                <div class="cart-item-actions">
                    <button class="cart-qty-btn" data-id="${item.id}" data-size="${escapeHtml(item.size)}" data-color="${escapeHtml(item.color)}" data-delta="-1">−</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button class="cart-qty-btn" data-id="${item.id}" data-size="${escapeHtml(item.size)}" data-color="${escapeHtml(item.color)}" data-delta="1">+</button>
                    <button class="cart-remove-btn" data-id="${item.id}" data-size="${escapeHtml(item.size)}" data-color="${escapeHtml(item.color)}">🗑️</button>
                </div>
                <div class="cart-item-total">${itemTotal.toLocaleString()} ₽</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    if (totalContainer) {
        totalContainer.innerHTML = `Итого: <strong>${total.toLocaleString()} ₽</strong>`;
    }
    
    document.querySelectorAll('.cart-qty-btn').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            const size = btn.dataset.size;
            const color = btn.dataset.color;
            const delta = parseInt(btn.dataset.delta);
            updateQuantity(id, delta, size, color);
        };
    });
    
    document.querySelectorAll('.cart-remove-btn').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            const size = btn.dataset.size;
            const color = btn.dataset.color;
            removeFromCart(id, size, color);
        };
    });
}

function updateQuantity(id, delta, size, color) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const index = cart.findIndex(item => item.id === id && item.size === size && item.color === color);
    
    if (index !== -1) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }
}

function removeFromCart(id, size, color) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => !(item.id === id && item.size === size && item.color === color));
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    if (typeof showToast === 'function') showToast('Товар удалён из корзины');
}

function closeCartSidebar() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function openCartSidebar() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const overlay = document.getElementById('overlay');
    
    if (cartBtn) cartBtn.addEventListener('click', openCartSidebar);
    if (closeCart) closeCart.addEventListener('click', closeCartSidebar);
    if (overlay) overlay.addEventListener('click', closeCartSidebar);
    
    updateCartCount();
});

// Закрытие по Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const sidebar = document.getElementById('cartSidebar');
        if (sidebar && sidebar.classList.contains('open')) {
            closeCartSidebar();
        }
    }
});

// Делаем функции глобальными
window.updateCartCount = updateCartCount;
window.addToCartWithDetails = addToCartWithDetails;
window.addToCartById = addToCartById;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
