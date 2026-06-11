// ===== КОРЗИНА =====

// БАЗОВАЯ ФУНКЦИЯ ДЛЯ КАРТОЧЕК ТОВАРОВ
function addToCartById(id) {
    const product = window.allProducts ? window.allProducts.find(p => p.id === id) : null;
    if (!product) {
        console.error('Товар не найден, id:', id);
        if (typeof showToast === 'function') showToast('Ошибка: товар не найден');
        return;
    }
    
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
            article: product.article || '—',
            image: product.images?.[0] || null
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof updateCartCount === 'function') updateCartCount();
    if (typeof showToast === 'function') showToast(`✅ ${product.title} добавлен в корзину`);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counter = document.getElementById('cartCounter');
    if (counter) counter.textContent = total;
    updateCartDisplay();
    console.log('Корзина обновлена, товаров:', total);
}

function addToCartWithDetails(id, title, price, size, color, article, image) {
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
            article: article || '—',
            image: image || null
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    if (typeof showToast === 'function') showToast(`✅ ${title} (${size}, ${color}) добавлен в корзину`);
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
            <div class="cart-item" data-id="${item.id}" data-size="${escapeHtml(item.size)}" data-color="${escapeHtml(item.color)}">
                <div class="cart-item-image">
                    ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.title)}">` : '<div class="no-image">👕</div>'}
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${escapeHtml(item.title)}</div>
                    <div class="cart-item-details">
                        <span class="cart-item-article">Арт: ${escapeHtml(item.article)}</span>
                        <span class="cart-item-size">Размер: ${escapeHtml(item.size)}</span>
                        <span class="cart-item-color">Цвет: ${escapeHtml(item.color)}</span>
                    </div>
                    <div class="cart-item-price">${item.price.toLocaleString()} ₽ × ${item.quantity}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="cart-qty-btn" data-delta="-1">−</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button class="cart-qty-btn" data-delta="1">+</button>
                    <button class="cart-remove-btn">🗑️</button>
                </div>
                <div class="cart-item-total">${itemTotal.toLocaleString()} ₽</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    if (totalContainer) {
        totalContainer.innerHTML = `Итого: <strong>${total.toLocaleString()} ₽</strong>`;
    }
    
    document.querySelectorAll('.cart-item').forEach(itemDiv => {
        const id = parseInt(itemDiv.dataset.id);
        const size = itemDiv.dataset.size;
        const color = itemDiv.dataset.color;
        
        itemDiv.querySelectorAll('.cart-qty-btn').forEach(btn => {
            btn.onclick = () => {
                const delta = parseInt(btn.dataset.delta);
                updateQuantity(id, delta, size, color);
            };
        });
        
        const removeBtn = itemDiv.querySelector('.cart-remove-btn');
        if (removeBtn) {
            removeBtn.onclick = () => removeFromCart(id, size, color);
        }
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

// ... (оформление заказа, инициализация и т.д. без изменений)
