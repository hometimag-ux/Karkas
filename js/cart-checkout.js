// ===== js/cart-checkout.js - ОФОРМЛЕНИЕ ЗАКАЗА =====

// Сохранить незавершённый заказ
function savePendingOrder(orderData) {
    localStorage.setItem('pendingOrder', JSON.stringify(orderData));
}

// Получить незавершённый заказ
function getPendingOrder() {
    try {
        return JSON.parse(localStorage.getItem('pendingOrder') || 'null');
    } catch (e) {
        return null;
    }
}

// Очистить незавершённый заказ
function clearPendingOrder() {
    localStorage.removeItem('pendingOrder');
}

// Проверить наличие незавершённого заказа
function checkPendingOrder() {
    const pending = getPendingOrder();
    if (pending && pending.items && pending.items.length > 0) {
        if (confirm(`У вас есть незавершённый заказ на сумму ${pending.total.toLocaleString()} ₽\nПродолжить оформление?`)) {
            openCheckoutModal();
            return true;
        } else {
            clearPendingOrder();
        }
    }
    return false;
}

// Открыть модальное окно оформления заказа
function openCheckoutModal() {
    const cart = getCart();
    
    if (cart.length === 0) {
        if (!checkPendingOrder()) {
            showToast('Корзина пуста', 'error');
        }
        return;
    }
    
    closeCartSidebar();
    
    const subtotal = getCartTotal();
    
    const modalHtml = `
        <div id="checkoutModal" style="
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
            z-index: 10000;
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
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                    position: sticky;
                    top: 0;
                    background: white;
                    z-index: 10;
                ">
                    <h3 style="margin:0;">📋 Оформление заказа</h3>
                    <button id="closeCheckoutModal" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #999;
                    ">&times;</button>
                </div>
                
                <div style="padding: 20px;">
                    <!-- Список товаров -->
                    <div style="background: #f8fafc; border-radius: 16px; padding: 15px; margin-bottom: 20px;">
                        <h4 style="margin:0 0 10px 0; font-size:14px;">Ваш заказ</h4>
                        ${cart.map(item => `
                            <div style="display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #e2edf4;">
                                <div style="width: 50px; height: 50px; background: #f0f0f0; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                    ${item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">` : '👕'}
                                </div>
                                <div style="flex:1;">
                                    <div style="font-weight:600;">${escapeHtml(item.title)}</div>
                                    <div style="font-size:12px; color:#666;">${escapeHtml(item.size)} / ${escapeHtml(item.color)}</div>
                                </div>
                                <div style="font-size:14px;">${item.quantity} шт</div>
                                <div style="font-weight:600; color:#00897b;">${(item.price * item.quantity).toLocaleString()} ₽</div>
                            </div>
                        `).join('')}
                        <div style="display: flex; justify-content: space-between; padding-top: 15px; font-weight: 600;">
                            <span>Товары:</span>
                            <span>${subtotal.toLocaleString()} ₽</span>
                        </div>
                    </div>
                    
                    <!-- Форма -->
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; gap: 12px;">
                            <input type="text" id="checkoutName" placeholder="Ваше имя *" style="flex:1; padding: 12px 16px; border:1px solid #ddd; border-radius: 40px; font-size:14px;">
                            <input type="tel" id="checkoutPhone" placeholder="Телефон *" style="flex:1; padding: 12px 16px; border:1px solid #ddd; border-radius: 40px; font-size:14px;">
                        </div>
                        
                        <input type="email" id="checkoutEmail" placeholder="Email" style="padding: 12px 16px; border:1px solid #ddd; border-radius: 40px; font-size:14px;">
                        
                        <select id="checkoutDelivery" style="padding: 12px 16px; border:1px solid #ddd; border-radius: 40px; font-size:14px; background:white;">
                            <option value="courier" data-price="350">🚚 Курьерская доставка — 350 ₽</option>
                            <option value="pickup" data-price="0">📦 Самовывоз — Бесплатно</option>
                            <option value="express" data-price="990">⚡ Экспресс-доставка — 990 ₽</option>
                        </select>
                        
                        <div id="addressBlock">
                            <input type="text" id="checkoutAddress" placeholder="Адрес доставки" style="width:100%; padding: 12px 16px; border:1px solid #ddd; border-radius: 40px; font-size:14px;">
                        </div>
                        
                        <textarea id="checkoutComment" rows="2" placeholder="Комментарий к заказу" style="padding: 12px 16px; border:1px solid #ddd; border-radius: 20px; font-size:14px; resize:vertical;"></textarea>
                        
                        <!-- Итого -->
                        <div style="background: #f6faf7; border-radius: 16px; padding: 15px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>Товары:</span>
                                <span>${subtotal.toLocaleString()} ₽</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>Доставка:</span>
                                <span id="deliveryCost">350 ₽</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 18px; border-top: 1px solid #e2edf4; margin-top: 10px; padding-top: 12px;">
                                <span>Итого к оплате:</span>
                                <strong id="finalTotal" style="color:#00897b;">${(subtotal + 350).toLocaleString()} ₽</strong>
                            </div>
                        </div>
                        
                        <!-- Способы оплаты -->
                        <div>
                            <h4 style="margin:0 0 10px 0; font-size:14px;">Способ оплаты</h4>
                            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                                <label style="display: flex; align-items: center; gap: 8px; cursor:pointer;">
                                    <input type="radio" name="payment" value="card" checked> 💳 Картой онлайн
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; cursor:pointer;">
                                    <input type="radio" name="payment" value="sbp"> 📱 СБП
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; cursor:pointer;">
                                    <input type="radio" name="payment" value="cash"> 💰 Наличными
                                </label>
                            </div>
                        </div>
                        
                        <button id="submitOrderBtn" style="
                            background: linear-gradient(135deg, #00897b, #4db6ac);
                            color: white;
                            border: none;
                            padding: 14px;
                            border-radius: 40px;
                            font-weight: 600;
                            font-size: 16px;
                            cursor: pointer;
                            margin-top: 10px;
                        ">✅ Перейти к оплате</button>
                        
                        <div style="font-size: 11px; color: #999; text-align: center;">
                            Нажимая кнопку, вы соглашаетесь с условиями обработки данных
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    // Закрытие модального окна
    const closeBtn = document.getElementById('closeCheckoutModal');
    const modal = document.getElementById('checkoutModal');
    
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.remove();
            document.body.style.overflow = '';
        };
    }
    
    if (modal) {
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        };
    }
    
    // Обновление суммы при смене доставки
    const deliverySelect = document.getElementById('checkoutDelivery');
    const deliveryCostSpan = document.getElementById('deliveryCost');
    const finalTotalSpan = document.getElementById('finalTotal');
    const addressBlock = document.getElementById('addressBlock');
    
    function updateTotal() {
        const selectedOption = deliverySelect.options[deliverySelect.selectedIndex];
        const deliveryPrice = parseInt(selectedOption.dataset.price);
        const total = subtotal + deliveryPrice;
        
        if (deliverySelect.value === 'courier') {
            addressBlock.style.display = 'block';
        } else {
            addressBlock.style.display = 'none';
        }
        
        deliveryCostSpan.textContent = deliveryPrice === 0 ? 'Бесплатно' : deliveryPrice.toLocaleString() + ' ₽';
        finalTotalSpan.textContent = total.toLocaleString() + ' ₽';
    }
    
    deliverySelect.onchange = updateTotal;
    updateTotal();
    
    // Обработчик отправки заказа
    const submitBtn = document.getElementById('submitOrderBtn');
    submitBtn.onclick = () => {
        const name = document.getElementById('checkoutName').value.trim();
        const phone = document.getElementById('checkoutPhone').value.trim();
        
        if (!name || !phone) {
            showToast('❌ Пожалуйста, укажите имя и телефон', 'error');
            return;
        }
        
        const selectedDelivery = deliverySelect.options[deliverySelect.selectedIndex];
        const deliveryPrice = parseInt(selectedDelivery.dataset.price);
        const total = subtotal + deliveryPrice;
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'card';
        const address = document.getElementById('checkoutAddress')?.value.trim() || '';
        const email = document.getElementById('checkoutEmail')?.value.trim() || '';
        const comment = document.getElementById('checkoutComment')?.value.trim() || '';
        
        const orderData = {
            orderId: 'ORDER_' + Date.now(),
            date: new Date().toLocaleString(),
            items: cart,
            subtotal: subtotal,
            delivery: {
                method: deliverySelect.value,
                price: deliveryPrice
            },
            address: address,
            total: total,
            customer: {
                name: name,
                phone: phone,
                email: email
            },
            payment: paymentMethod,
            comment: comment
        };
        
        console.log('📦 Заказ сформирован:', orderData);
        
        // Сохраняем заказ
        savePendingOrder(orderData);
        
        // Закрываем окно оформления
        modal.remove();
        document.body.style.overflow = '';
        
        // Передаём в модуль оплаты
        if (typeof processPayment === 'function') {
            processPayment(orderData);
        } else {
            console.error('processPayment not found');
            showToast('Ошибка: модуль оплаты не загружен', 'error');
        }
    };
}

// Добавляем анимацию
const style = document.createElement('style');
style.textContent = `
    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);
