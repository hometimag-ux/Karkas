// ===== КОРЗИНА =====

// Обновление счётчика на иконке
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counter = document.getElementById('cartCounter');
    if (counter) counter.textContent = total;
}

// Добавление товара
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
            quantity: 1
            // image: product.images?.[0] || null  // ← не сохраняем фото, чтобы не переполнять localStorage
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay(); // ← обновляем отображение корзины
    
    if (typeof showToast === 'function') {
        showToast(`✅ ${product.title} добавлен в корзину`);
    }
}

// Обновление отображения корзины
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
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-title">${escapeHtml(item.title)}</div>
                    <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                </div>
                <div class="cart-item-actions">
                    <button onclick="window.updateQuantity(${item.id}, -1)">−</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button onclick="window.updateQuantity(${item.id}, 1)">+</button>
                    <button onclick="window.removeFromCart(${item.id})" style="color: #dc2626;">🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    if (totalContainer) {
        totalContainer.innerHTML = `Итого: <span>${total.toLocaleString()} ₽</span>`;
    }
}

// Изменение количества
window.updateQuantity = function(id, delta) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const index = cart.findIndex(item => item.id === id);
    
    if (index !== -1) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateCartDisplay();
    }
};

// Удаление товара
window.removeFromCart = function(id) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    if (typeof showToast === 'function') {
        showToast('Товар удалён из корзины');
    }
};

// Оформление заказа
function initCheckout() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            if (cart.length === 0) {
                if (typeof showToast === 'function') {
                    showToast('Корзина пуста');
                }
                return;
            }
            if (typeof showToast === 'function') {
                showToast('✅ Заказ оформлен! Спасибо за покупку!');
            }
            localStorage.removeItem('cart');
            updateCartCount();
            updateCartDisplay();
            const cartSidebar = document.getElementById('cartSidebar');
            const overlay = document.getElementById('overlay');
            if (cartSidebar) cartSidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
        });
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    updateCartDisplay();
    initCheckout();
});

// Делаем функции глобальными
window.updateCartCount = updateCartCount;
window.addToCartById = addToCartById;
window.updateCartDisplay = updateCartDisplay;
