// ===== js/cart-checkout.js - ОФОРМЛЕНИЕ ЗАКАЗА =====

// ===== ДОБАВИТЬ В cart-checkout.js =====

// Глобальные переменные для СДЭК
let cdekCities = [];
let selectedCity = null;
let selectedPickupPoint = null;
let deliveryPriceCalculated = 0;

// Загрузка городов СДЭК
async function loadCdekCities(query) {
    const settings = getDeliverySettings();
    if (!settings?.cdek?.client_id) return [];
    
    try {
        const response = await fetch(`https://api.cdek.ru/v2/location/cities?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${await getCdekToken()}`
            }
        });
        const data = await response.json();
        return data;
    } catch(e) {
        console.error('Ошибка загрузки городов', e);
        return [];
    }
}

// Получение токена СДЭК
async function getCdekToken() {
    const settings = getDeliverySettings();
    if (!settings?.cdek) return null;
    
    const mode = settings.cdek.mode === 'live' 
        ? 'https://api.cdek.ru/v2/oauth/token'
        : 'https://api.edu.cdek.ru/v2/oauth/token';
    
    const response = await fetch(mode, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=client_credentials&client_id=${settings.cdek.client_id}&client_secret=${settings.cdek.client_secret}`
    });
    const data = await response.json();
    return data.access_token;
}

// Расчёт стоимости доставки
async function calculateCdekPrice(toCity, weight = 0.5) {
    const settings = getDeliverySettings();
    if (!settings?.cdek?.client_id) return null;
    
    const mode = settings.cdek.mode === 'live'
        ? 'https://api.cdek.ru/v2/calculator/tariff'
        : 'https://api.edu.cdek.ru/v2/calculator/tariff';
    
    const token = await getCdekToken();
    
    const requestData = {
        from_location: { code: getCityCode(settings.cdek.from_city) },
        to_location: { code: toCity },
        packages: [{ weight: weight * 1000, length: 30, width: 20, height: 10 }]
    };
    
    const response = await fetch(mode, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
    });
    const data = await response.json();
    return data;
}

// Получение списка ПВЗ СДЭК
async function getCdekPickupPoints(cityCode) {
    const settings = getDeliverySettings();
    if (!settings?.cdek?.client_id) return [];
    
    const token = await getCdekToken();
    const response = await fetch(`https://api.cdek.ru/v2/deliverypoints?city_code=${cityCode}&type=PVZ`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data;
}

// Получение настроек доставки из localStorage
function getDeliverySettings() {
    const saved = localStorage.getItem('delivery_settings');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) {}
    }
    return null;
}

// Обновлённая форма оформления заказа с СДЭК
function openCheckoutModal() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast('Корзина пуста');
        return;
    }
    closeCart();

    const subtotal = getCartTotal();
    const deliverySettings = getDeliverySettings();
    const isCdekEnabled = deliverySettings?.cdek?.client_id && deliverySettings.methods?.courier?.enabled;
    
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
                                <div style="width:50px;height:50px;background:#f0f0f0;border-radius:10px;display:flex;align-items:center;justify-content:center;">${item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;">` : '👕'}</div>
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
                        
                        ${isCdekEnabled ? `
                        <!-- Город для расчёта доставки -->
                        <div class="form-group">
                            <label>🏙️ Город доставки</label>
                            <input type="text" id="chCity" placeholder="Введите ваш город" style="padding:12px 16px;border:1px solid #ddd;border-radius:40px;" autocomplete="off">
                            <div id="citySuggestions" style="display:none; background:white; border:1px solid #ddd; border-radius:16px; margin-top:4px; max-height:200px; overflow-y:auto; position:absolute; z-index:100; width:calc(100% - 40px);"></div>
                        </div>
                        
                        <!-- Калькулятор доставки -->
                        <button id="calcDeliveryBtn" style="background:#f0f0f0; border:1px solid #ddd; padding:10px; border-radius:40px; cursor:pointer;">📦 Рассчитать доставку</button>
                        
                        <!-- Результат расчёта -->
                        <div id="deliveryResult" style="display:none; background:#e8f5e9; border-radius:16px; padding:12px;"></div>
                        
                        <!-- Выбор ПВЗ -->
                        <div id="pickupPointsBlock" style="display:none;">
                            <label>🏪 Выберите пункт выдачи</label>
                            <select id="pickupPointSelect" style="padding:12px 16px;border:1px solid #ddd;border-radius:40px; width:100%;"></select>
                        </div>
                        ` : ''}
                        
                        <div id="addressBlock" style="display:none;">
                            <input type="text" id="chAddress" placeholder="Адрес доставки" style="width:100%;padding:12px 16px;border:1px solid #ddd;border-radius:40px;">
                        </div>
                        
                        <textarea id="chComment" rows="2" placeholder="Комментарий" style="padding:12px 16px;border:1px solid #ddd;border-radius:20px;"></textarea>
                        
                        <div style="background:#f6faf7;border-radius:16px;padding:15px;">
                            <div style="display:flex;justify-content:space-between;"><span>Товары:</span><span>${subtotal.toLocaleString()} ₽</span></div>
                            <div style="display:flex;justify-content:space-between;"><span>Доставка:</span><span id="deliveryCost">Рассчитайте доставку</span></div>
                            <div style="display:flex;justify-content:space-between;font-weight:700;font-size:18px;border-top:1px solid #ddd;margin-top:10px;padding-top:10px;"><span>Итого:</span><strong id="finalTotal" style="color:#00897b;">${subtotal.toLocaleString()} ₽</strong></div>
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
    
    if (isCdekEnabled) {
        // Поиск города
        const cityInput = document.getElementById('chCity');
        const suggestionsDiv = document.getElementById('citySuggestions');
        let searchTimeout;
        
        cityInput.addEventListener('input', async (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            if (query.length < 2) {
                suggestionsDiv.style.display = 'none';
                return;
            }
            
            searchTimeout = setTimeout(async () => {
                const cities = await loadCdekCities(query);
                if (cities.length > 0) {
                    suggestionsDiv.innerHTML = cities.map(city => 
                        `<div class="city-suggestion" data-code="${city.code}" style="padding:10px; cursor:pointer; border-bottom:1px solid #eee;">${city.city}${city.region ? `, ${city.region}` : ''}</div>`
                    ).join('');
                    suggestionsDiv.style.display = 'block';
                    
                    document.querySelectorAll('.city-suggestion').forEach(el => {
                        el.onclick = () => {
                            cityInput.value = el.textContent;
                            selectedCity = { code: el.dataset.code, name: el.textContent };
                            suggestionsDiv.style.display = 'none';
                        };
                    });
                }
            }, 300);
        });
        
        document.addEventListener('click', (e) => {
            if (e.target !== cityInput) suggestionsDiv.style.display = 'none';
        });
        
        // Расчёт доставки
        document.getElementById('calcDeliveryBtn').onclick = async () => {
            if (!selectedCity) {
                showToast('Выберите город из списка');
                return;
            }
            
            const totalWeight = cart.reduce((sum, item) => sum + (item.quantity * 0.5), 0.5);
            showToast('🔄 Расчёт стоимости доставки...', 'info');
            
            const result = await calculateCdekPrice(selectedCity.code, totalWeight);
            if (result && result.tariff_codes && result.tariff_codes.length > 0) {
                const tariff = result.tariff_codes.find(t => t.tariff_code === 136); // 136 - дверь-дверь
                if (tariff) {
                    deliveryPriceCalculated = tariff.delivery_sum;
                    document.getElementById('deliveryCost').innerHTML = `${deliveryPriceCalculated.toLocaleString()} ₽`;
                    const finalTotal = subtotal + deliveryPriceCalculated;
                    document.getElementById('finalTotal').innerHTML = `${finalTotal.toLocaleString()} ₽`;
                    document.getElementById('deliveryResult').style.display = 'block';
                    document.getElementById('deliveryResult').innerHTML = `
                        <div style="display:flex; justify-content:space-between;">
                            <span>📦 Стоимость доставки:</span>
                            <strong>${deliveryPriceCalculated.toLocaleString()} ₽</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-top:8px;">
                            <span>⏱️ Срок доставки:</span>
                            <span>${tariff.period_min} - ${tariff.period_max} дня</span>
                        </div>
                    `;
                    
                    // Загружаем ПВЗ
                    const points = await getCdekPickupPoints(selectedCity.code);
                    if (points && points.length > 0) {
                        const select = document.getElementById('pickupPointSelect');
                        select.innerHTML = '<option value="">-- Выберите пункт выдачи --</option>' + 
                            points.map(point => `<option value="${point.code}" data-address="${point.address}">${point.name} - ${point.address}</option>`).join('');
                        document.getElementById('pickupPointsBlock').style.display = 'block';
                        
                        select.onchange = () => {
                            if (select.value) {
                                const option = select.options[select.selectedIndex];
                                selectedPickupPoint = {
                                    code: select.value,
                                    name: option.text,
                                    address: option.dataset.address
                                };
                                document.getElementById('chAddress').value = selectedPickupPoint.address;
                            }
                        };
                    }
                } else {
                    showToast('Не удалось рассчитать стоимость доставки');
                }
            }
        };
    }
    
    // Остальная часть кода (обработчик отправки) остаётся без изменений...
    const deliverySelect = document.getElementById('chDelivery');
    const addressBlock = document.getElementById('addressBlock');
    const deliveryCostSpan = document.getElementById('deliveryCost');
    const finalTotalSpan = document.getElementById('finalTotal');
    
    function updateTotal() {
        // Обновление суммы в зависимости от выбранного метода доставки
    }
    
    const submitBtn = document.getElementById('goToPaymentBtn');
    submitBtn.onclick = () => {
        const name = document.getElementById('chName').value.trim();
        const phone = document.getElementById('chPhone').value.trim();
        if (!name || !phone) {
            showToast('Заполните имя и телефон');
            return;
        }
        
        const orderData = {
            orderId: 'ORDER_' + Date.now(),
            date: new Date().toLocaleString(),
            items: getCart(),
            subtotal: subtotal,
            delivery: { 
                method: isCdekEnabled && selectedCity ? 'cdek' : 'pickup', 
                price: deliveryPriceCalculated || 0,
                city: selectedCity?.name || '',
                pickup_point: selectedPickupPoint
            },
            address: document.getElementById('chAddress')?.value.trim() || '',
            total: subtotal + (deliveryPriceCalculated || 0),
            customer: { 
                name, 
                phone, 
                email: document.getElementById('chEmail')?.value.trim() || '' 
            },
            payment: document.querySelector('input[name="payment"]:checked')?.value || 'card',
            comment: document.getElementById('chComment')?.value.trim() || ''
        };
        
        modal.remove();
        document.body.style.overflow = '';
        
        if (typeof openPayment === 'function') {
            openPayment(orderData);
        } else {
            showToast('Ошибка: модуль оплаты не загружен');
        }
    };
}

function openCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast('Корзина пуста');
        return;
    }
    closeCart();

    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    
    const modal = document.createElement('div');
    modal.id = 'checkoutModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10001;';
    modal.innerHTML = `
        <div style="background:white;border-radius:28px;max-width:500px;width:95%;max-height:90vh;overflow-y:auto;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:20px;border-bottom:1px solid #eee;">
                <h3 style="margin:0;">📋 Оформление заказа</h3>
                <button id="closeCheckoutBtn" style="background:none;border:none;font-size:24px;cursor:pointer;">&times;</button>
            </div>
            <div style="padding:20px;">
                <div style="background:#f8fafc;border-radius:16px;padding:15px;margin-bottom:20px;">
                    <h4 style="margin:0 0 10px 0;">Ваш заказ</h4>
                    ${cart.map(i => `
                        <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #e2edf4;">
                            <div style="width:50px;height:50px;background:#f0f0f0;border-radius:10px;display:flex;align-items:center;justify-content:center;">${i.image ? `<img src="${i.image}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">` : '👕'}</div>
                            <div style="flex:1;"><div style="font-weight:600;">${i.title}</div><div style="font-size:12px;color:#666;">${i.size} / ${i.color}</div></div>
                            <div>${i.quantity} шт</div>
                            <div style="font-weight:600;color:#00897b;">${(i.price * i.quantity).toLocaleString()} ₽</div>
                        </div>
                    `).join('')}
                    <div style="display:flex;justify-content:space-between;padding-top:15px;font-weight:600;"><span>Товары:</span><span>${subtotal.toLocaleString()} ₽</span></div>
                </div>
                
                <div style="display:flex;flex-direction:column;gap:12px;">
                    <input type="text" id="chName" placeholder="Ваше имя *" style="padding:12px 16px;border:1px solid #ddd;border-radius:40px;">
                    <input type="tel" id="chPhone" placeholder="Телефон *" style="padding:12px 16px;border:1px solid #ddd;border-radius:40px;">
                    <input type="email" id="chEmail" placeholder="Email" style="padding:12px 16px;border:1px solid #ddd;border-radius:40px;">
                    
                    <select id="chDelivery" style="padding:12px 16px;border:1px solid #ddd;border-radius:40px;">
                        <option value="courier" data-price="350">🚚 Курьерская доставка — 350 ₽</option>
                        <option value="pickup" data-price="0">📦 Самовывоз — Бесплатно</option>
                    </select>
                    
                    <div id="addressBlock">
                        <input type="text" id="chAddress" placeholder="Адрес доставки" style="width:100%;padding:12px 16px;border:1px solid #ddd;border-radius:40px;">
                    </div>
                    
                    <textarea id="chComment" rows="2" placeholder="Комментарий" style="padding:12px 16px;border:1px solid #ddd;border-radius:20px;"></textarea>
                    
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
                    
                    <button id="goToPayment" style="background:linear-gradient(135deg,#00897b,#4db6ac);color:white;border:none;padding:14px;border-radius:40px;font-weight:600;font-size:16px;cursor:pointer;">💳 Перейти к оплате</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    document.getElementById('closeCheckoutBtn').onclick = () => { modal.remove(); document.body.style.overflow = ''; };
    modal.onclick = (e) => { if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; } };

    const delivery = document.getElementById('chDelivery');
    const updateTotal = () => {
        const price = parseInt(delivery.options[delivery.selectedIndex].dataset.price);
        const total = subtotal + price;
        document.getElementById('addressBlock').style.display = delivery.value === 'courier' ? 'block' : 'none';
        document.getElementById('deliveryCost').textContent = price === 0 ? 'Бесплатно' : price.toLocaleString() + ' ₽';
        document.getElementById('finalTotal').textContent = total.toLocaleString() + ' ₽';
    };
    delivery.onchange = updateTotal;
    updateTotal();

    document.getElementById('goToPayment').onclick = () => {
        const name = document.getElementById('chName').value.trim();
        const phone = document.getElementById('chPhone').value.trim();
        if (!name || !phone) { showToast('Заполните имя и телефон'); return; }
        
        const orderData = {
            orderId: 'ORDER_' + Date.now(),
            date: new Date().toLocaleString(),
            items: getCart(),
            subtotal: subtotal,
            delivery: { method: delivery.value, price: parseInt(delivery.options[delivery.selectedIndex].dataset.price) },
            address: document.getElementById('chAddress')?.value.trim() || '',
            total: subtotal + parseInt(delivery.options[delivery.selectedIndex].dataset.price),
            customer: { name, phone, email: document.getElementById('chEmail')?.value.trim() || '' },
            payment: document.querySelector('input[name="payment"]:checked')?.value || 'card',
            comment: document.getElementById('chComment')?.value.trim() || ''
        };
        
        modal.remove();
        document.body.style.overflow = '';
        
        if (typeof openPayment === 'function') openPayment(orderData);
        else showToast('Ошибка: модуль оплаты не загружен');
    };
}
