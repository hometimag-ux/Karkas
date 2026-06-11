// ===== КОРЗИНА =====

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
    
    // Обработчики
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

// ===== ОФОРМЛЕНИЕ ЗАКАЗА =====
function openCheckoutModal() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
        showToast('Корзина пуста');
        return;
    }
    
    closeCartSidebar();
    
    const oldModal = document.getElementById('checkoutModal');
    if (oldModal) oldModal.remove();
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const modalHtml = `
        <div class="checkout-modal" id="checkoutModal">
            <div class="checkout-content">
                <div class="checkout-header">
                    <h3>📋 Оформление заказа</h3>
                    <button class="checkout-close" id="closeCheckoutModal">&times;</button>
                </div>
                <div class="checkout-body">
                    <!-- Товары -->
                    <div class="checkout-products">
                        <h4>Ваш заказ</h4>
                        ${cart.map(item => `
                            <div class="checkout-product">
                                <div class="checkout-product-image">
                                    ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.title)}">` : '<span>👕</span>'}
                                </div>
                                <div class="checkout-product-info">
                                    <div class="checkout-product-title">${escapeHtml(item.title)}</div>
                                    <div class="checkout-product-details">${escapeHtml(item.size)} / ${escapeHtml(item.color)} / Арт: ${escapeHtml(item.article)}</div>
                                </div>
                                <div class="checkout-product-quantity">${item.quantity} шт</div>
                                <div class="checkout-product-price">${(item.price * item.quantity).toLocaleString()} ₽</div>
                            </div>
                        `).join('')}
                        <div class="checkout-subtotal">
                            <span>Товары:</span>
                            <span>${subtotal.toLocaleString()} ₽</span>
                        </div>
                    </div>
                    
                    <!-- Форма -->
                    <form id="checkoutForm">
                        <div class="form-group">
                            <input type="text" id="checkoutName" placeholder="Ваше имя *" required>
                        </div>
                        <div class="form-group">
                            <input type="tel" id="checkoutPhone" placeholder="Телефон *" required>
                        </div>
                        <div class="form-group">
                            <input type="email" id="checkoutEmail" placeholder="Email">
                        </div>
                        
                        <div class="form-group">
                            <label>Способ доставки</label>
                            <div class="delivery-options" id="deliveryOptions">
                                <label class="delivery-option">
                                    <input type="radio" name="delivery" value="courier" data-price="350" checked>
                                    <span>🚚 Курьерская доставка</span>
                                    <span class="delivery-price">350 ₽</span>
                                </label>
                                <label class="delivery-option">
                                    <input type="radio" name="delivery" value="pickup" data-price="0">
                                    <span>📦 Самовывоз (ПВЗ)</span>
                                    <span class="delivery-price">Бесплатно</span>
                                </label>
                                <label class="delivery-option">
                                    <input type="radio" name="delivery" value="express" data-price="990">
                                    <span>⚡ Экспресс-доставка</span>
                                    <span class="delivery-price">990 ₽</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group" id="addressGroup">
                            <input type="text" id="checkoutAddress" placeholder="Адрес доставки">
                        </div>
                        
                        <div class="form-group">
                            <textarea id="checkoutComment" rows="2" placeholder="Комментарий к заказу"></textarea>
                        </div>
                        
                        <div class="checkout-total" id="checkoutTotal">
                            <span>Товары: ${subtotal.toLocaleString()} ₽</span>
                            <span id="deliveryCostText">Доставка: 350 ₽</span>
                            <strong id="finalTotal">Итого: ${(subtotal + 350).toLocaleString()} ₽</strong>
                        </div>
                        
                        <button type="submit" class="checkout-submit-btn">💳 Оплатить</button>
                    </form>
                    <div class="checkout-privacy">Нажимая кнопку, вы соглашаетесь с политикой обработки данных</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    // Закрытие
    const closeModal = document.getElementById('closeCheckoutModal');
    const modalOverlay = document.getElementById('checkoutModal');
    if (closeModal) closeModal.onclick = () => { modalOverlay.remove(); document.body.style.overflow = ''; };
    if (modalOverlay) modalOverlay.onclick = (e) => { if (e.target === modalOverlay) { modalOverlay.remove(); document.body.style.overflow = ''; } };
    
    // Обновление суммы при выборе доставки
    const deliveryRadios = document.querySelectorAll('input[name="delivery"]');
    const addressGroup = document.getElementById('addressGroup');
    const deliveryCostSpan = document.getElementById('deliveryCostText');
    const finalTotalSpan = document.getElementById('finalTotal');
    
    function updateTotal() {
        const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
        const deliveryPrice = selectedDelivery ? parseInt(selectedDelivery.dataset.price) : 0;
        const total = subtotal + deliveryPrice;
        
        addressGroup.style.display = selectedDelivery?.value === 'courier' ? 'block' : 'none';
        deliveryCostSpan.textContent = `Доставка: ${deliveryPrice === 0 ? 'Бесплатно' : deliveryPrice.toLocaleString() + ' ₽'}`;
        finalTotalSpan.innerHTML = `Итого: ${total.toLocaleString()} ₽`;
    }
    
    deliveryRadios.forEach(radio => radio.addEventListener('change', updateTotal));
    updateTotal();
    
    // Отправка формы
    const form = document.getElementById('checkoutForm');
    form.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('checkoutName').value.trim();
        const phone = document.getElementById('checkoutPhone').value.trim();
        
        if (!name || !phone) {
            showToast('❌ Пожалуйста, укажите имя и телефон');
            return;
        }
        
        const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
        const deliveryPrice = selectedDelivery ? parseInt(selectedDelivery.dataset.price) : 0;
        const total = subtotal + deliveryPrice;
        
        const orderData = {
            items: cart,
            subtotal: subtotal,
            delivery: {
                method: selectedDelivery?.value,
                price: deliveryPrice
            },
            address: document.getElementById('checkoutAddress')?.value.trim() || '',
            total: total,
            customer: {
                name: name,
                phone: phone,
                email: document.getElementById('checkoutEmail')?.value.trim() || ''
            },
            comment: document.getElementById('checkoutComment')?.value.trim() || '',
            date: new Date().toLocaleString()
        };
        
        console.log('📦 ЗАКАЗ:', orderData);
        showToast(`✅ Спасибо, ${name}! Заказ принят. Менеджер свяжется с вами`);
        
        localStorage.removeItem('cart');
        updateCartCount();
        modalOverlay.remove();
        document.body.style.overflow = '';
    };
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const overlay = document.getElementById('overlay');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cartBtn) cartBtn.addEventListener('click', openCartSidebar);
    if (closeCart) closeCart.addEventListener('click', closeCartSidebar);
    if (overlay) overlay.addEventListener('click', closeCartSidebar);
    if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckoutModal);
    
    updateCartCount();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const sidebar = document.getElementById('cartSidebar');
        if (sidebar && sidebar.classList.contains('open')) closeCartSidebar();
        const modal = document.getElementById('checkoutModal');
        if (modal) modal.remove();
        document.body.style.overflow = '';
    }
});
