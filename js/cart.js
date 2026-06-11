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
                        <span class="cart-item-size">Размер: ${escapeHtml(item.size)}</span>
                        <span class="cart-item-color">Цвет: ${escapeHtml(item.color)}</span>
                    </div>
                </div>
                <div class="cart-item-quantity-cell">
                    <button class="cart-qty-btn" data-delta="-1">−</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button class="cart-qty-btn" data-delta="1">+</button>
                </div>
                <div class="cart-item-price-cell">
                    <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                    <div class="cart-item-total">${itemTotal.toLocaleString()} ₽</div>
                </div>
                <div class="cart-item-remove">
                    <button class="cart-remove-btn">🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    if (totalContainer) {
        totalContainer.innerHTML = `<div class="cart-total-row"><span>Итого:</span><strong>${total.toLocaleString()} ₽</strong></div>`;
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

// ===== ОПЛАТА ЧЕРЕЗ СБП (с иконкой вместо QR) =====
function openPaymentModal(orderData) {
    const oldModal = document.getElementById('paymentModal');
    if (oldModal) oldModal.remove();
    
    const orderId = 'ORDER_' + Date.now();
    const amount = orderData.total;
    
    const paymentHtml = `
        <div class="payment-modal" id="paymentModal">
            <div class="payment-content">
                <div class="payment-header">
                    <h3>💳 Оплата по СБП</h3>
                    <button class="payment-close" id="closePaymentModal">&times;</button>
                </div>
                <div class="payment-body">
                    <div class="payment-order-info">
                        <div>Заказ №${orderId}</div>
                        <div class="payment-amount">${amount.toLocaleString()} ₽</div>
                    </div>
                    
                    <div style="text-align: center; padding: 20px;">
                        <div style="font-size: 5rem; margin-bottom: 10px;">📱</div>
                        <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 10px;">Сканируйте QR-код</div>
                        <div style="font-size: 0.9rem; color: #64748b; margin-bottom: 20px;">в приложении вашего банка</div>
                        
                        <div style="background: #f8fafc; border-radius: 20px; padding: 30px; margin: 10px 0;">
                            <div style="font-size: 3rem; margin-bottom: 10px;">🏦</div>
                            <div style="font-weight: 600;">Сумма к оплате: ${amount.toLocaleString()} ₽</div>
                            <div style="font-size: 0.8rem; color: #64748b; margin-top: 10px;">Номер заказа: ${orderId}</div>
                        </div>
                    </div>
                    
                    <div class="payment-actions">
                        <button class="payment-success-btn" id="paymentSuccessBtn">✅ Я оплатил</button>
                        <button class="payment-cancel-btn" id="paymentCancelBtn">❌ Отмена</button>
                    </div>
                    
                    <div class="payment-info">
                        <small>Оплата через Систему Быстрых Платежей (СБП). Комиссия не взимается.</small>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', paymentHtml);
    document.body.style.overflow = 'hidden';
    
    const closePaymentBtn = document.getElementById('closePaymentModal');
    const paymentModal = document.getElementById('paymentModal');
    const cancelBtn = document.getElementById('paymentCancelBtn');
    
    const closePaymentModal = () => {
        paymentModal.remove();
        document.body.style.overflow = '';
    };
    
    if (closePaymentBtn) closePaymentBtn.onclick = closePaymentModal;
    if (cancelBtn) cancelBtn.onclick = closePaymentModal;
    if (paymentModal) paymentModal.onclick = (e) => { if (e.target === paymentModal) closePaymentModal(); };
    
    const successBtn = document.getElementById('paymentSuccessBtn');
    if (successBtn) {
        successBtn.onclick = () => {
            localStorage.removeItem('cart');
            updateCartCount();
            
            const formInputs = ['checkoutName', 'checkoutPhone', 'checkoutEmail', 'checkoutAddress', 'checkoutComment'];
            formInputs.forEach(id => localStorage.removeItem(`checkout_${id}`));
            localStorage.removeItem('pendingOrder');
            
            if (typeof showToast === 'function') {
                showToast(`✅ Заказ №${orderId} оплачен! Спасибо за покупку!`);
            } else {
                alert(`✅ Заказ №${orderId} оплачен! Спасибо за покупку!`);
            }
            closePaymentModal();
        };
    }
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
                    <div class="checkout-products">
                        <h4>Ваш заказ</h4>
                        ${cart.map(item => `
                            <div class="checkout-product">
                                <div class="checkout-product-image">
                                    ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.title)}">` : '<span>👕</span>'}
                                </div>
                                <div class="checkout-product-info">
                                    <div class="checkout-product-title">${escapeHtml(item.title)}</div>
                                    <div class="checkout-product-details">${escapeHtml(item.size)} / ${escapeHtml(item.color)}</div>
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
                    
                    <form id="checkoutForm">
                        <div class="form-row">
                            <div class="form-group">
                                <input type="text" id="checkoutName" placeholder="Ваше имя *" required>
                            </div>
                            <div class="form-group">
                                <input type="tel" id="checkoutPhone" placeholder="Телефон *" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <input type="email" id="checkoutEmail" placeholder="Email">
                        </div>
                        
                        <div class="form-group">
                            <select id="checkoutDelivery" class="styled-select">
                                <option value="courier" data-price="350">🚚 Курьерская доставка — 350 ₽</option>
                                <option value="pickup" data-price="0">📦 Самовывоз — Бесплатно</option>
                                <option value="express" data-price="990">⚡ Экспресс-доставка — 990 ₽</option>
                            </select>
                        </div>
                        
                        <div class="form-group" id="addressGroup">
                            <input type="text" id="checkoutAddress" placeholder="Адрес доставки">
                        </div>
                        
                        <div class="form-group">
                            <textarea id="checkoutComment" rows="2" placeholder="Комментарий к заказу"></textarea>
                        </div>
                        
                        <div class="checkout-total" id="checkoutTotal">
                            <div class="total-row"><span>Товары:</span><span>${subtotal.toLocaleString()} ₽</span></div>
                            <div class="total-row" id="deliveryRow"><span>Доставка:</span><span id="deliveryCost">350 ₽</span></div>
                            <div class="total-row grand-total"><span>Итого к оплате:</span><strong id="finalTotal">${(subtotal + 350).toLocaleString()} ₽</strong></div>
                        </div>
                        
                        <div class="payment-methods">
                            <h4>Способ оплаты</h4>
                            <div class="payment-options">
                                <label class="payment-option">
                                    <input type="radio" name="payment" value="card" checked>
                                    <span>💳 Банковской картой</span>
                                </label>
                                <label class="payment-option">
                                    <input type="radio" name="payment" value="sbp">
                                    <span>📱 СБП (по номеру телефона)</span>
                                </label>
                                <label class="payment-option">
                                    <input type="radio" name="payment" value="cash">
                                    <span>💰 Наличными при получении</span>
                                </label>
                            </div>
                        </div>
                        
                        <button type="submit" class="checkout-submit-btn">💳 Перейти к оплате</button>
                    </form>
                    
                    <div class="checkout-privacy">Нажимая кнопку, вы соглашаетесь с политикой обработки данных</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    const closeModal = document.getElementById('closeCheckoutModal');
    const modalOverlay = document.getElementById('checkoutModal');
    if (closeModal) closeModal.onclick = () => { modalOverlay.remove(); document.body.style.overflow = ''; };
    if (modalOverlay) modalOverlay.onclick = (e) => { if (e.target === modalOverlay) { modalOverlay.remove(); document.body.style.overflow = ''; } };
    
    const deliverySelect = document.getElementById('checkoutDelivery');
    const addressGroup = document.getElementById('addressGroup');
    const deliveryCostSpan = document.getElementById('deliveryCost');
    const finalTotalSpan = document.getElementById('finalTotal');
    
    function updateTotal() {
        const selectedOption = deliverySelect.options[deliverySelect.selectedIndex];
        const deliveryPrice = parseInt(selectedOption.dataset.price);
        const total = subtotal + deliveryPrice;
        addressGroup.style.display = deliverySelect.value === 'courier' ? 'block' : 'none';
        deliveryCostSpan.textContent = deliveryPrice === 0 ? 'Бесплатно' : deliveryPrice.toLocaleString() + ' ₽';
        finalTotalSpan.textContent = total.toLocaleString() + ' ₽';
    }
    
    deliverySelect.addEventListener('change', updateTotal);
    updateTotal();
    
    const form = document.getElementById('checkoutForm');
    form.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('checkoutName').value.trim();
        const phone = document.getElementById('checkoutPhone').value.trim();
        
        if (!name || !phone) {
            showToast('❌ Пожалуйста, укажите имя и телефон');
            return;
        }
        
        const selectedDelivery = deliverySelect.options[deliverySelect.selectedIndex];
        const deliveryPrice = parseInt(selectedDelivery.dataset.price);
        const total = subtotal + deliveryPrice;
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'card';
        const address = document.getElementById('checkoutAddress')?.value.trim() || '';
        
        const orderData = {
            items: cart,
            subtotal: subtotal,
            delivery: { method: deliverySelect.value, price: deliveryPrice },
            address: address,
            total: total,
            customer: {
                name: name,
                phone: phone,
                email: document.getElementById('checkoutEmail')?.value.trim() || ''
            },
            payment: paymentMethod,
            comment: document.getElementById('checkoutComment')?.value.trim() || '',
            date: new Date().toLocaleString()
        };
        
        console.log('📦 ЗАКАЗ:', orderData);
        localStorage.setItem('pendingOrder', JSON.stringify(orderData));
        
        modalOverlay.remove();
        document.body.style.overflow = '';
        
        if (paymentMethod === 'sbp') {
            openPaymentModal(orderData);
        } else {
            showToast(`💳 Спасибо, ${name}! Сумма к оплате: ${total.toLocaleString()} ₽`);
            localStorage.removeItem('cart');
            updateCartCount();
        }
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
