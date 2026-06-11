// ===== js/cart-checkout.js - ОФОРМЛЕНИЕ ЗАКАЗА =====

// Восстановление незавершённого заказа
function restorePendingOrder() {
    const pending = localStorage.getItem('pendingOrder');
    if (pending) {
        const orderData = JSON.parse(pending);
        if (confirm(`У вас есть незавершённый заказ на сумму ${orderData.total.toLocaleString()} ₽.\nПродолжить оформление?`)) {
            openCheckoutModal();
            return true;
        } else {
            localStorage.removeItem('pendingOrder');
        }
    }
    return false;
}

// Открыть модальное окно оформления заказа
function openCheckoutModal() {
    // ВАЖНО:每次都重新获取最新的购物车数据
    const cart = getCart();
    
    console.log('🛒 Открытие формы заказа, корзина:', cart);
    console.log('📊 Количество товаров в корзине:', cart.length);
    
    if (cart.length === 0) {
        // Проверяем незавершённый заказ
        if (!restorePendingOrder()) {
            showToast('Корзина пуста');
        }
        return;
    }
    
    // Закрываем сайдбар корзины
    if (typeof closeCartSidebar === 'function') closeCartSidebar();
    
    // ВАЖНО: пересчитываем сумму на основе актуальной корзины
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    console.log('💰 Сумма заказа:', subtotal);
    
    const modalHtml = `
        <div id="checkoutModalWindow" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        ">
            <div style="
                background: white;
                border-radius: 28px;
                max-width: 550px;
                width: 95%;
                max-height: 90vh;
                overflow-y: auto;
                animation: modalSlideIn 0.3s ease;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #eee; position: sticky; top: 0; background: white; z-index: 10;">
                    <h3 style="margin:0;">📋 Оформление заказа</h3>
                    <button id="closeCheckoutWindow" style="background:none;border:none;font-size:24px;cursor:pointer;color:#999;">&times;</button>
                </div>
                <div style="padding: 20px;">
                    <!-- Список товаров -->
                    <div style="background: #f8fafc; border-radius: 16px; padding: 15px; margin-bottom: 20px;">
                        <h4 style="margin:0 0 10px 0; font-size:14px;">Ваш заказ</h4>
                        ${cart.map(item => `
                            <div style="display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #e2edf4;">
                                <div style="width: 50px; height: 50px; background: #f4f9fe; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink:0;">
                                    ${item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">` : '👕'}
                                </div>
                                <div style="flex:1;">
                                    <div style="font-weight:600; font-size:14px;">${escapeHtml(item.title)}</div>
                                    <div style="font-size:12px; color:#64748b;">${escapeHtml(item.size)} / ${escapeHtml(item.color)}</div>
                                </div>
                                <div style="font-size:14px; color:#5e7f97;">${item.quantity} шт</div>
                                <div style="font-weight:600; color:#00897b; font-size:14px;">${(item.price * item.quantity).toLocaleString()} ₽</div>
                            </div>
                        `).join('')}
                        <div style="display: flex; justify-content: space-between; padding-top: 15px; font-weight: 600; border-top: 1px solid #e2edf4; margin-top: 10px;">
                            <span>Товары:</span>
                            <span>${subtotal.toLocaleString()} ₽</span>
                        </div>
                    </div>
                    
                    <!-- Форма -->
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <div style="display: flex; gap: 10px;">
                            <input type="text" id="checkoutName" placeholder="Ваше имя *" style="flex:1; padding: 12px 16px; border:1px solid #cbdde9; border-radius: 40px; font-size:14px;">
                            <input type="tel" id="checkoutPhone" placeholder="Телефон *" style="flex:1; padding: 12px 16px; border:1px solid #cbdde9; border-radius: 40px; font-size:14px;">
                        </div>
                        
                        <input type="email" id="checkoutEmail" placeholder="Email (необязательно)" style="padding: 12px 16px; border:1px solid #cbdde9; border-radius: 40px; font-size:14px;">
                        
                        <select id="checkoutDelivery" style="padding: 12px 16px; border:1px solid #cbdde9; border-radius: 40px; font-size:14px; background:white;">
                            <option value="courier" data-price="350">🚚 Курьерская доставка — 350 ₽</option>
                            <option value="pickup" data-price="0">📦 Самовывоз — Бесплатно</option>
                            <option value="express" data-price="990">⚡ Экспресс-доставка — 990 ₽</option>
                        </select>
                        
                        <input type="text" id="checkoutAddress" placeholder="Адрес доставки (для курьера)" style="padding: 12px 16px; border:1px solid #cbdde9; border-radius: 40px; font-size:14px;">
                        
                        <textarea id="checkoutComment" rows="2" placeholder="Комментарий к заказу" style="padding: 12px 16px; border:1px solid #cbdde9; border-radius: 20px; font-size:14px; resize:vertical;"></textarea>
                        
                        <!-- Итого -->
                        <div style="background: #f6faf7; border-radius: 16px; padding: 15px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>Товары:</span>
                                <span>${subtotal.toLocaleString()} ₽</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>Доставка:</span>
                                <span id="deliveryCostSpan">350 ₽</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 18px; border-top: 1px solid #e2edf4; margin-top: 10px; padding-top: 12px;">
                                <span>Итого к оплате:</span>
                                <strong id="finalTotalSpan" style="color:#00897b;">${(subtotal + 350).toLocaleString()} ₽</strong>
                            </div>
                        </div>
                        
                        <!-- Способы оплаты -->
                        <div>
                            <h4 style="margin:0 0 10px 0; font-size:14px;">Способ оплаты</h4>
                            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                                <label style="display: flex; align-items: center; gap: 8px; cursor:pointer;">
                                    <input type="radio" name="payment" value="card" checked> 💳 Банковской картой
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; cursor:pointer;">
                                    <input type="radio" name="payment" value="sbp"> 📱 СБП
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; cursor:pointer;">
                                    <input type="radio" name="payment" value="cash"> 💰 Наличными
                                </label>
                            </div>
                        </div>
                        
                        <button id="submitCheckoutBtn" style="
                            background: linear-gradient(135deg, #00897b, #4db6ac);
                            color: white;
                            border: none;
                            padding: 14px;
                            border-radius: 40px;
                            font-weight: 600;
                            font-size: 16px;
                            cursor: pointer;
                            transition: 0.2s;
                        ">💳 Перейти к оплате</button>
                        
                        <div style="font-size: 11px; color: #94a3b8; text-align: center;">Нажимая кнопку, вы соглашаетесь с политикой обработки данных</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    // Закрытие
    const closeBtn = document.getElementById('closeCheckoutWindow');
    const modalWindow = document.getElementById('checkoutModalWindow');
    if (closeBtn) closeBtn.onclick = () => { modalWindow.remove(); document.body.style.overflow = ''; };
    if (modalWindow) modalWindow.onclick = (e) => { if (e.target === modalWindow) { modalWindow.remove(); document.body.style.overflow = ''; } };
    
    // Обновление суммы
    const deliverySelect = document.getElementById('checkoutDelivery');
    const deliveryCostSpan = document.getElementById('deliveryCostSpan');
    const finalTotalSpan = document.getElementById('finalTotalSpan');
    const addressInput = document.getElementById('checkoutAddress');
    
    function updateTotal() {
        const selectedOption = deliverySelect.options[deliverySelect.selectedIndex];
        const deliveryPrice = parseInt(selectedOption.dataset.price);
        const total = subtotal + deliveryPrice;
        
        if (deliverySelect.value === 'courier') {
            addressInput.style.display = 'block';
        } else {
            addressInput.style.display = 'none';
        }
        
        deliveryCostSpan.textContent = deliveryPrice === 0 ? 'Бесплатно' : deliveryPrice.toLocaleString() + ' ₽';
        finalTotalSpan.textContent = total.toLocaleString() + ' ₽';
    }
    
    deliverySelect.onchange = updateTotal;
    updateTotal();
    
    // Обработчик отправки
    const submitBtn = document.getElementById('submitCheckoutBtn');
    submitBtn.onclick = () => {
        // ВАЖНО: снова получаем актуальную корзину на момент оплаты
        const currentCart = getCart();
        
        console.log('🛒 На момент оплаты, корзина:', currentCart);
        
        if (currentCart.length === 0) {
            showToast('❌ Корзина пуста. Добавьте товары');
            modalWindow.remove();
            document.body.style.overflow = '';
            return;
        }
        
        const name = document.getElementById('checkoutName').value.trim();
        const phone = document.getElementById('checkoutPhone').value.trim();
        
        if (!name || !phone) {
            showToast('❌ Пожалуйста, укажите имя и телефон');
            return;
        }
        
        const selectedDelivery = deliverySelect.options[deliverySelect.selectedIndex];
        const deliveryPrice = parseInt(selectedDelivery.dataset.price);
        const currentSubtotal = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = currentSubtotal + deliveryPrice;
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'card';
        const address = document.getElementById('checkoutAddress')?.value.trim() || '';
        const email = document.getElementById('checkoutEmail')?.value.trim() || '';
        const comment = document.getElementById('checkoutComment')?.value.trim() || '';
        
        const orderData = {
            items: currentCart,
            subtotal: currentSubtotal,
            delivery: { method: deliverySelect.value, price: deliveryPrice },
            address: address,
            total: total,
            customer: { name: name, phone: phone, email: email },
            payment: paymentMethod,
            comment: comment,
            orderId: 'ORDER_' + Date.now(),
            date: new Date().toLocaleString()
        };
        
        console.log('📦 ЗАКАЗ:', orderData);
        console.log('💳 Способ оплаты:', paymentMethod);
        
        // Сохраняем заказ
        localStorage.setItem('pendingOrder', JSON.stringify(orderData));
        
        // Закрываем окно оформления
        modalWindow.remove();
        document.body.style.overflow = '';
        
        // Передаём в модуль оплаты
        if (typeof processPayment === 'function') {
            processPayment(orderData);
        } else {
            console.error('processPayment not defined');
            showToast('Ошибка: модуль оплаты не загружен');
        }
    };
}
