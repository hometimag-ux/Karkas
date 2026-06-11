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
        console.log('Товар уже есть, увеличили количество');
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
        console.log('Новый товар добавлен');
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    if (typeof showToast === 'function') showToast(`✅ ${title} (${size}, ${color}) добавлен в корзину`);
}

function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const container = document.getElementById('cartItems');
    const totalContainer = document.getElementById('cartTotal');
    
    console.log('Обновление отображения корзины, товаров:', cart.length);
    
    if (!container) {
        console.error('Контейнер #cartItems не найден');
        return;
    }
    
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
                    <div class="cart-item-details">
                        <span class="cart-item-article">Арт: ${escapeHtml(item.article)}</span>
                        <span class="cart-item-size">Размер: ${escapeHtml(item.size)}</span>
                        <span class="cart-item-color">Цвет: ${escapeHtml(item.color)}</span>
                    </div>
                    <div class="cart-item-price">${item.price.toLocaleString()} ₽ × ${item.quantity} = ${itemTotal.toLocaleString()} ₽</div>
                </div>
                <div class="cart-item-actions">
                    <button onclick="updateQuantity(${item.id}, -1, '${escapeHtml(item.size)}', '${escapeHtml(item.color)}')">−</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1, '${escapeHtml(item.size)}', '${escapeHtml(item.color)}')">+</button>
                    <button onclick="removeFromCart(${item.id}, '${escapeHtml(item.size)}', '${escapeHtml(item.color)}')">🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    if (totalContainer) {
        totalContainer.innerHTML = `Итого: <span>${total.toLocaleString()} ₽</span>`;
    }
}

window.updateQuantity = function(id, delta, size, color) {
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
};

window.removeFromCart = function(id, size, color) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => !(item.id === id && item.size === size && item.color === color));
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    if (typeof showToast === 'function') showToast('Товар удалён из корзины');
};

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

// ===== МОДАЛЬНОЕ ОКНО ОФОРМЛЕНИЯ ЗАКАЗА =====
function openCheckoutModal() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
        if (typeof showToast === 'function') showToast('Корзина пуста');
        return;
    }
    
    // Закрываем корзину
    closeCartSidebar();
    
    // Удаляем старую модалку
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
                    <!-- Товары в заказе -->
                    <div class="checkout-products">
                        <h4>Ваш заказ</h4>
                        ${cart.map(item => `
                            <div class="checkout-product">
                                <span class="checkout-product-title">${escapeHtml(item.title)} (${item.size}, ${item.color})</span>
                                <span class="checkout-product-quantity">${item.quantity} шт</span>
                                <span class="checkout-product-price">${(item.price * item.quantity).toLocaleString()} ₽</span>
                            </div>
                        `).join('')}
                        <div class="checkout-subtotal">
                            <span>Товары:</span>
                            <span>${subtotal.toLocaleString()} ₽</span>
                        </div>
                    </div>
                    
                    <!-- Форма доставки -->
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
                        
                        <div class="form-group" id="addressGroup" style="display: none;">
                            <input type="text" id="checkoutAddress" placeholder="Адрес доставки">
                        </div>
                        
                        <div class="form-group">
                            <textarea id="checkoutComment" rows="2" placeholder="Комментарий к заказу"></textarea>
                        </div>
                        
                        <div class="checkout-total" id="checkoutTotal">
                            <span>Итого к оплате:</span>
                            <strong>${subtotal.toLocaleString()} ₽</strong>
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
    
    closeModal.onclick = () => {
        modalOverlay.remove();
        document.body.style.overflow = '';
    };
    
    modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
            document.body.style.overflow = '';
        }
    };
    
    // Обновление суммы при выборе доставки
    const deliveryRadios = document.querySelectorAll('input[name="delivery"]');
    const addressGroup = document.getElementById('addressGroup');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    function updateTotal() {
        const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
        const deliveryPrice = selectedDelivery ? parseInt(selectedDelivery.dataset.price) : 0;
        const total = subtotal + deliveryPrice;
        
        // Показываем поле адреса для курьера и экспресс
        const deliveryValue = selectedDelivery ? selectedDelivery.value : '';
        addressGroup.style.display = (deliveryValue === 'courier' || deliveryValue === 'express') ? 'block' : 'none';
        
        checkoutTotal.innerHTML = `
            <span>Товары: ${subtotal.toLocaleString()} ₽</span>
            <span>Доставка: ${deliveryPrice === 0 ? 'Бесплатно' : deliveryPrice.toLocaleString() + ' ₽'}</span>
            <strong>Итого: ${total.toLocaleString()} ₽</strong>
        `;
    }
    
    deliveryRadios.forEach(radio => {
        radio.addEventListener('change', updateTotal);
    });
    updateTotal();
    
    // Отправка формы
    const form = document.getElementById('checkoutForm');
    form.onsubmit = (e) => {
        e.preventDefault();
        
        const name = document.getElementById('checkoutName').value.trim();
        const phone = document.getElementById('checkoutPhone').value.trim();
        const email = document.getElementById('checkoutEmail').value.trim();
        const address = document.getElementById('checkoutAddress')?.value.trim() || '';
        const comment = document.getElementById('checkoutComment').value.trim();
        const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
        const deliveryMethod = selectedDelivery ? selectedDelivery.value : '';
        const deliveryPrice = selectedDelivery ? parseInt(selectedDelivery.dataset.price) : 0;
        const total = subtotal + deliveryPrice;
        
        if (!name || !phone) {
            if (typeof showToast === 'function') showToast('❌ Пожалуйста, укажите имя и телефон');
            return;
        }
        
        const orderData = {
            items: cart,
            subtotal: subtotal,
            delivery: {
                method: deliveryMethod,
                price: deliveryPrice
            },
            address: address,
            total: total,
            customer: {
                name: name,
                phone: phone,
                email: email
            },
            comment: comment,
            date: new Date().toLocaleString()
        };
        
        console.log('📦 ЗАКАЗ:', orderData);
        
        if (typeof showToast === 'function') {
            showToast(`✅ Спасибо, ${name}! Заказ №${Date.now()} принят. Менеджер свяжется с вами`);
        }
        
        // Очищаем корзину
        localStorage.removeItem('cart');
        updateCartCount();
        
        modalOverlay.remove();
        document.body.style.overflow = '';
    };
}

// Кнопки корзины
document.addEventListener('DOMContentLoaded', function() {
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const overlay = document.getElementById('overlay');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cartBtn) cartBtn.addEventListener('click', openCartSidebar);
    if (closeCart) closeCart.addEventListener('click', closeCartSidebar);
    if (overlay) overlay.addEventListener('click', closeCartSidebar);
    
    // Кнопка "Оформить заказ" в корзине
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', openCheckoutModal);
    }
});
