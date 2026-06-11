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
                    <!-- Товары в заказе -->
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
                    
                    <!-- Форма заказа -->
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
                            <label class="form-label">Способ доставки</label>
                            <div class="delivery-select-wrapper">
                                <select id="checkoutDelivery" class="delivery-select">
                                    <option value="courier" data-price="350">🚚 Курьерская доставка — 350 ₽</option>
                                    <option value="pickup" data-price="0">📦 Самовывоз (ПВЗ) — Бесплатно</option>
                                    <option value="express" data-price="990">⚡ Экспресс-доставка — 990 ₽</option>
                                </select>
                                <span class="select-arrow">▼</span>
                            </div>
                        </div>
                        
                        <div class="form-group" id="addressGroup">
                            <input type="text" id="checkoutAddress" placeholder="Адрес доставки">
                        </div>
                        
                        <div class="form-group">
                            <textarea id="checkoutComment" rows="2" placeholder="Комментарий к заказу"></textarea>
                        </div>
                        
                        <div class="checkout-total" id="checkoutTotal">
                            <div class="total-row">
                                <span>Товары:</span>
                                <span>${subtotal.toLocaleString()} ₽</span>
                            </div>
                            <div class="total-row" id="deliveryRow">
                                <span>Доставка:</span>
                                <span id="deliveryCost">350 ₽</span>
                            </div>
                            <div class="total-row grand-total">
                                <span>Итого к оплате:</span>
                                <strong id="finalTotal">${(subtotal + 350).toLocaleString()} ₽</strong>
                            </div>
                        </div>
                        
                        <div class="payment-methods">
                            <div class="payment-options">
                                <label class="payment-option">
                                    <input type="radio" name="payment" value="card" checked>
                                    <span>💳 Банковская карта</span>
                                </label>
                                <label class="payment-option">
                                    <input type="radio" name="payment" value="sbp">
                                    <span>📱 СБП</span>
                                </label>
                                <label class="payment-option">
                                    <input type="radio" name="payment" value="cash">
                                    <span>💰 Наличные</span>
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
    
    // Закрытие
    const closeModal = document.getElementById('closeCheckoutModal');
    const modalOverlay = document.getElementById('checkoutModal');
    if (closeModal) closeModal.onclick = () => { modalOverlay.remove(); document.body.style.overflow = ''; };
    if (modalOverlay) modalOverlay.onclick = (e) => { if (e.target === modalOverlay) { modalOverlay.remove(); document.body.style.overflow = ''; } };
    
    // Обновление суммы при выборе доставки
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
        
        const selectedOption = deliverySelect.options[deliverySelect.selectedIndex];
        const deliveryPrice = parseInt(selectedOption.dataset.price);
        const total = subtotal + deliveryPrice;
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'card';
        
        const orderData = {
            items: cart,
            subtotal: subtotal,
            delivery: {
                method: deliverySelect.value,
                price: deliveryPrice
            },
            address: document.getElementById('checkoutAddress')?.value.trim() || '',
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
        showToast(`💳 Спасибо, ${name}! Сумма к оплате: ${total.toLocaleString()} ₽`);
        
        localStorage.removeItem('cart');
        updateCartCount();
        modalOverlay.remove();
        document.body.style.overflow = '';
    };
}
