// ===== js/cart-checkout.js - ОФОРМЛЕНИЕ ЗАКАЗА =====

// ===== НАСТРОЙКИ =====
// Временно отключаем СДЭК (пока нет сервера)
const CDEK_ENABLED = false;  // <- переключить в true, когда появится бэкенд

// ===== ДАННЫЕ ДЛЯ САМОВЫВОЗА =====
let selectedPickupPointForPickup = null;

function getPickupSettings() {
    const saved = localStorage.getItem('delivery_settings');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            return data.pickup || {
                address: 'г. Москва, ул. Тверская, д. 15',
                hours: 'Пн-Вс: 10:00-20:00',
                phone: '+7 (999) 123-45-67'
            };
        } catch(e) {}
    }
    return {
        address: 'г. Москва, ул. Тверская, д. 15',
        hours: 'Пн-Вс: 10:00-20:00',
        phone: '+7 (999) 123-45-67'
    };
}

// ===== ФУНКЦИИ ДЛЯ СДЭК (закомментированы, но готовы к использованию) =====
/*
let selectedCity = null;
let selectedPickupPoint = null;
let deliveryPriceCalculated = 0;

function getDeliverySettings() {
    const saved = localStorage.getItem('delivery_settings');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) {}
    }
    return null;
}

async function getCdekToken() {
    // ... код для СДЭК
}

async function loadCdekCities(query) {
    // ... код для СДЭК
}

async function calculateCdekPrice(toCityCode, weight = 0.5) {
    // ... код для СДЭК
}

async function getCdekPickupPoints(cityCode) {
    // ... код для СДЭК
}
*/

// ===== ОСНОВНЫЕ ФУНКЦИИ =====

function getCartTotal() {
    const cart = getCart();
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
        total += cart[i].price * cart[i].quantity;
    }
    return total;
}

function checkPendingOrder() {
    const pending = localStorage.getItem('pendingOrder');
    if (pending) {
        try {
            const orderData = JSON.parse(pending);
            if (orderData && orderData.items && orderData.items.length > 0) {
                if (confirm(`У вас есть незавершённый заказ на сумму ${orderData.total.toLocaleString()} ₽\nПродолжить оформление?`)) {
                    openCheckout();
                    return true;
                } else {
                    localStorage.removeItem('pendingOrder');
                }
            }
        } catch(e) {}
    }
    return false;
}

// ===== ОСНОВНАЯ ФУНКЦИЯ ОФОРМЛЕНИЯ ЗАКАЗА =====
function openCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        if (!checkPendingOrder()) {
            showToast('Корзина пуста');
        }
        return;
    }
    closeCart();

    const subtotal = getCartTotal();
    const pickupSettings = getPickupSettings();
    
    const modalHtml = `
        <div id="checkoutModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10001;">
            <div style="background:white;border-radius:28px;max-width:550px;width:95%;max-height:90vh;overflow-y:auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:20px;border-bottom:1px solid #eee;">
                    <h3 style="margin:0;">📋 Оформление заказа</h3>
                    <button id="closeCheckoutBtn" style="background:none;border:none;font-size:24px;cursor:pointer;">&times;</button>
                </div>
                <div style="padding:20px;">
                    <!-- Список товаров -->
                    <div style="background:#f8fafc;border-radius:16px;padding:15px;margin-bottom:20px;">
                        <h4 style="margin:0 0 10px 0;">Ваш заказ</h4>
                        ${cart.map(item => `
                            <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #e2edf4;">
                                <div style="width:50px;height:50px;background:#f0f0f0;border-radius:10px;display:flex;align-items:center;justify-content:center;">${item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">` : '👕'}</div>
                                <div style="flex:1;"><div style="font-weight:600;">${escapeHtml(item.title)}</div><div style="font-size:12px;color:#666;">${escapeHtml(item.size)} / ${escapeHtml(item.color)}</div></div>
                                <div>${item.quantity} шт</div>
                                <div style="font-weight:600;color:#00897b;">${(item.price * item.quantity).toLocaleString()} ₽</div>
                            </div>
                        `).join('')}
                        <div style="display:flex;justify-content:space-between;padding-top:15px;font-weight:600;"><span>Товары:</span><span>${subtotal.toLocaleString()} ₽</span></div>
                    </div>
                    
                    <div style="display:flex;flex-direction:column;gap:12px;">
                        <div style="display:flex;gap:12px;">
                            <input type="text" id="chName" placeholder="Ваше имя *" style="flex:1;padding:12px 16px;border:1px solid #ddd;border-radius:40px;">
                            <input type="tel" id="chPhone" placeholder="Телефон *" style="flex:1;padding:12px 16px;border:1px solid #ddd;border-radius:40px;">
                        </div>
                        
                        <input type="email" id="chEmail" placeholder="Email" style="padding:12px 16px;border:1px solid #ddd;border-radius:40px;">
                        
                        <!-- Выбор способа доставки -->
                        <select id="chDelivery" style="padding:12px 16px;border:1px solid #ddd;border-radius:40px;">
                            <option value="courier" data-price="350">🚚 Курьерская доставка — 350 ₽</option>
                            <option value="pickup" data-price="0">📦 Самовывоз — Бесплатно</option>
                        </select>
                        
                        <!-- Блок для курьера (адрес) -->
                        <div id="addressBlock">
                            <input type="text" id="chAddress" placeholder="Улица, дом, квартира" style="width:100%;padding:12px 16px;border:1px solid #ddd;border-radius:40px;">
                            <input type="text" id="chAddressExtra" placeholder="Подъезд, этаж, домофон (опционально)" style="width:100%;margin-top:8px;padding:12px 16px;border:1px solid #ddd;border-radius:40px;">
                        </div>
                        
                        <!-- Блок для самовывоза (информация о ПВЗ) -->
                        <div id="pickupBlock" style="display:none; background:#f8fafc; border-radius:16px; padding:15px;">
                            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                                <span style="font-size:24px;">🏪</span>
                                <span style="font-weight:600;">Пункт самовывоза</span>
                            </div>
                            <div style="font-size:13px; margin-bottom:8px;">
                                <strong>📍 Адрес:</strong> ${escapeHtml(pickupSettings.address)}
                            </div>
                            <div style="font-size:13px; margin-bottom:8px;">
                                <strong>⏰ Режим работы:</strong> ${escapeHtml(pickupSettings.hours)}
                            </div>
                            <div style="font-size:13px;">
                                <strong>📞 Телефон:</strong> ${escapeHtml(pickupSettings.phone)}
                            </div>
                        </div>
                        
                        <textarea id="chComment" rows="2" placeholder="Комментарий к заказу" style="padding:12px 16px;border:1px solid #ddd;border-radius:20px;"></textarea>
                        
                        <div style="background:#f6faf7;border-radius:16px;padding:15px;">
                            <div style="display:flex;justify-content:space-between;"><span>Товары:</span><span>${subtotal.toLocaleString()} ₽</span></div>
                            <div style="display:flex;justify-content:space-between;"><span>Доставка:</span><span id="deliveryCost">350 ₽</span></div>
                            <div style="display:flex;justify-content:space-between;font-weight:700;font-size:18px;border-top:1px solid #ddd;margin-top:10px;padding-top:10px;"><span>Итого:</span><strong id="finalTotal" style="color:#00897b;">${(subtotal + 350).toLocaleString()} ₽</strong></div>
                        </div>
                        
                        <div>
                            <h4 style="margin:0 0 10px 0;">Способ оплаты</h4>
                            <div style="display:flex;gap:20px;">
                                <label><input type="radio" name="payment" value="card" checked> 💳 Картой</label>
                                <label><input type="radio" name="payment" value="sbp"> 📱 СБП</label>
                                <label><input type="radio" name="payment" value="cash"> 💰 Наличными</label>
                            </div>
                        </div>
                        
                        <button id="goToPaymentBtn" style="background:linear-gradient(135deg,#00897b,#4db6ac);color:white;border:none;padding:14px;border-radius:40px;font-weight:600;font-size:16px;cursor:pointer;">💳 Перейти к оплате</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    // Закрытие модального окна
    const closeBtn = document.getElementById('closeCheckoutBtn');
    const modal = document.getElementById('checkoutModal');
    if (closeBtn) closeBtn.onclick = () => { modal.remove(); document.body.style.overflow = ''; };
    if (modal) modal.onclick = (e) => { if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; } };
    
    // Переключение между курьером и самовывозом
    const deliverySelect = document.getElementById('chDelivery');
    const addressBlock = document.getElementById('addressBlock');
    const pickupBlock = document.getElementById('pickupBlock');
    const deliveryCostSpan = document.getElementById('deliveryCost');
    const finalTotalSpan = document.getElementById('finalTotal');
    
    function updateDeliveryOptions() {
        const selectedOption = deliverySelect.options[deliverySelect.selectedIndex];
        const deliveryPrice = parseInt(selectedOption.dataset.price);
        const total = subtotal + deliveryPrice;
        
        if (deliverySelect.value === 'courier') {
            addressBlock.style.display = 'block';
            pickupBlock.style.display = 'none';
        } else {
            addressBlock.style.display = 'none';
            pickupBlock.style.display = 'block';
        }
        
        deliveryCostSpan.textContent = deliveryPrice === 0 ? 'Бесплатно' : deliveryPrice.toLocaleString() + ' ₽';
        finalTotalSpan.textContent = total.toLocaleString() + ' ₽';
    }
    
    deliverySelect.onchange = updateDeliveryOptions;
    updateDeliveryOptions();
    
    // Обработчик кнопки "Перейти к оплате"
    const submitBtn = document.getElementById('goToPaymentBtn');
    submitBtn.onclick = () => {
        const name = document.getElementById('chName').value.trim();
        const phone = document.getElementById('chPhone').value.trim();
        if (!name || !phone) {
            showToast('Заполните имя и телефон');
            return;
        }
        
        const selectedDelivery = deliverySelect.options[deliverySelect.selectedIndex];
        const deliveryPrice = parseInt(selectedDelivery.dataset.price);
        const total = subtotal + deliveryPrice;
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'card';
        const email = document.getElementById('chEmail')?.value.trim() || '';
        const comment = document.getElementById('chComment')?.value.trim() || '';
        
        let address = '';
        if (deliverySelect.value === 'courier') {
            const street = document.getElementById('chAddress')?.value.trim() || '';
            const extra = document.getElementById('chAddressExtra')?.value.trim() || '';
            address = street + (extra ? ', ' + extra : '');
        } else {
            address = `Самовывоз: ${pickupSettings.address}`;
        }
        
        const orderData = {
            orderId: 'ORDER_' + Date.now(),
            date: new Date().toLocaleString(),
            items: getCart(),
            subtotal: subtotal,
            delivery: { 
                method: deliverySelect.value, 
                price: deliveryPrice,
                pickup_info: deliverySelect.value === 'pickup' ? pickupSettings : null
            },
            address: address,
            total: total,
            customer: { name, phone, email },
            payment: paymentMethod,
            comment: comment
        };
        
        localStorage.setItem('pendingOrder', JSON.stringify(orderData));
        modal.remove();
        document.body.style.overflow = '';
        
        if (typeof openPayment === 'function') {
            openPayment(orderData);
        } else {
            showToast('Ошибка: модуль оплаты не загружен');
        }
    };
}
