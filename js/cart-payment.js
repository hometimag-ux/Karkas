// ===== js/cart-payment.js - ОПЛАТА =====

// Получение настроек оплаты из CRM
function getPaymentSettings() {
    const saved = localStorage.getItem('payment_settings');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) {}
    }
    return {
        methods: { card: { enabled: true }, sbp: { enabled: true }, cash: { enabled: true } },
        yookassa: { shop_id: '', secret_key: '', mode: 'test', commission: 3.5, connected: false },
        tinkoff: { terminal_key: '', secret_key: '', mode: 'test', commission: 2.8, connected: false },
        sbp: { recipient_name: '', recipient_inn: '', recipient_bank: '', recipient_phone: '', commission: 0, connected: false }
    };
}

// Проверка, доступен ли способ оплаты
function isPaymentMethodAvailable(methodId) {
    const settings = getPaymentSettings();
    const method = settings.methods?.[methodId];
    
    if (!method || !method.enabled) return false;
    
    // Дополнительные проверки для конкретных методов
    if (methodId === 'card') {
        const hasYookassa = settings.yookassa?.shop_id && settings.yookassa?.secret_key;
        const hasTinkoff = settings.tinkoff?.terminal_key && settings.tinkoff?.secret_key;
        return hasYookassa || hasTinkoff;
    }
    
    if (methodId === 'sbp') {
        return settings.sbp?.recipient_name && settings.sbp?.recipient_inn;
    }
    
    return true; // Наличные всегда доступны
}

// Открытие окна оплаты
function openPayment(orderData) {
    const method = orderData.payment;
    const settings = getPaymentSettings();
    
    if (method === 'card') {
        // Проверяем, какая платёжная система настроена
        if (settings.yookassa?.shop_id && settings.yookassa?.secret_key) {
            showYookassaPayment(orderData);
        } else if (settings.tinkoff?.terminal_key && settings.tinkoff?.secret_key) {
            showTinkoffPayment(orderData);
        } else {
            showCardDemo(orderData);
        }
    } else if (method === 'sbp') {
        showSbpPayment(orderData);
    } else if (method === 'cash') {
        showCashPayment(orderData);
    }
}

// Демо-оплата картой (когда нет интеграции)
function showCardDemo(orderData) {
    const modal = document.createElement('div');
    modal.id = 'paymentModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:10002;';
    modal.innerHTML = `
        <div style="background:white;border-radius:28px;max-width:400px;width:90%;padding:24px;text-align:center;">
            <h3 style="margin:0 0 10px 0;">💳 Демо-оплата картой</h3>
            <div style="font-size:64px;margin:20px 0;">💳</div>
            <div style="font-size:28px;font-weight:bold;color:#00897b;">${orderData.total.toLocaleString()} ₽</div>
            <div style="background:#f5f5f5;border-radius:16px;padding:15px;margin:15px 0;">
                <div>Заказ №${orderData.orderId}</div>
                <div style="font-size:12px;color:#666;">${escapeHtml(orderData.customer.name)}</div>
            </div>
            <div class="demo-card-input" style="margin:15px 0;">
                <input type="text" placeholder="4242 4242 4242 4242" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:12px;margin-bottom:8px;">
                <div style="display:flex;gap:8px;">
                    <input type="text" placeholder="MM/YY" style="flex:1;padding:10px;border:1px solid #ddd;border-radius:12px;">
                    <input type="text" placeholder="CVV" style="flex:1;padding:10px;border:1px solid #ddd;border-radius:12px;">
                </div>
            </div>
            <button id="payConfirmBtn" style="background:linear-gradient(135deg,#00897b,#4db6ac);color:white;border:none;padding:14px;border-radius:40px;font-weight:600;width:100%;cursor:pointer;">Оплатить</button>
            <button id="payCancelBtn" style="background:transparent;border:1px solid #ddd;padding:14px;border-radius:40px;margin-top:10px;width:100%;cursor:pointer;">Отмена</button>
            <div style="font-size:10px;color:#999;margin-top:12px;">Тестовые данные: 4242 4242 4242 4242, любой срок и CVV</div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    document.getElementById('payConfirmBtn').onclick = function() { 
        modal.remove(); 
        document.body.style.overflow = ''; 
        finalizeOrder(orderData); 
    };
    document.getElementById('payCancelBtn').onclick = function() { 
        modal.remove(); 
        document.body.style.overflow = ''; 
        showToast('❌ Оплата отменена'); 
    };
    modal.onclick = function(e) { if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; } };
}

// ЮKassa (Яндекс.Касса)
function showYookassaPayment(orderData) {
    const settings = getPaymentSettings();
    const isTestMode = settings.yookassa?.mode === 'test';
    
    const modal = document.createElement('div');
    modal.id = 'paymentModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:10002;';
    modal.innerHTML = `
        <div style="background:white;border-radius:28px;max-width:400px;width:90%;padding:24px;text-align:center;">
            <h3 style="margin:0 0 10px 0;">💳 ЮKassa</h3>
            <div style="font-size:64px;margin:20px 0;">🏦</div>
            <div style="font-size:28px;font-weight:bold;color:#00897b;">${orderData.total.toLocaleString()} ₽</div>
            <div style="background:#f5f5f5;border-radius:16px;padding:15px;margin:15px 0;">
                <div>Заказ №${orderData.orderId}</div>
                <div style="font-size:12px;color:#666;">${escapeHtml(orderData.customer.name)}</div>
            </div>
            <div style="background:#e8f5e9;border-radius:12px;padding:12px;margin:15px 0;">
                <div>🔐 Безопасный платёж через ЮKassa</div>
                <div style="font-size:10px;color:#666;margin-top:4px;">Visa, Mastercard, МИР, Apple Pay, Google Pay</div>
                ${isTestMode ? '<div style="font-size:10px;color:#ff9800;margin-top:4px;">⚡ ТЕСТОВЫЙ РЕЖИМ</div>' : ''}
            </div>
            <button id="payConfirmBtn" style="background:linear-gradient(135deg,#00897b,#4db6ac);color:white;border:none;padding:14px;border-radius:40px;font-weight:600;width:100%;cursor:pointer;">Оплатить</button>
            <button id="payCancelBtn" style="background:transparent;border:1px solid #ddd;padding:14px;border-radius:40px;margin-top:10px;width:100%;cursor:pointer;">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    document.getElementById('payConfirmBtn').onclick = async function() {
        modal.remove();
        document.body.style.overflow = '';
        showToast('🔄 Перенаправление на платёжную страницу...');
        
        // Здесь реальный запрос к API ЮKassa
        // В демо-режиме просто финализируем заказ
        setTimeout(() => {
            finalizeOrder(orderData);
        }, 2000);
    };
    document.getElementById('payCancelBtn').onclick = function() {
        modal.remove();
        document.body.style.overflow = '';
        showToast('❌ Оплата отменена');
    };
    modal.onclick = function(e) { if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; } };
}

// Tinkoff Pay
function showTinkoffPayment(orderData) {
    const settings = getPaymentSettings();
    const isTestMode = settings.tinkoff?.mode === 'test';
    
    const modal = document.createElement('div');
    modal.id = 'paymentModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:10002;';
    modal.innerHTML = `
        <div style="background:white;border-radius:28px;max-width:400px;width:90%;padding:24px;text-align:center;">
            <h3 style="margin:0 0 10px 0;">💳 Tinkoff Pay</h3>
            <div style="font-size:64px;margin:20px 0;">🏦</div>
            <div style="font-size:28px;font-weight:bold;color:#00897b;">${orderData.total.toLocaleString()} ₽</div>
            <div style="background:#f5f5f5;border-radius:16px;padding:15px;margin:15px 0;">
                <div>Заказ №${orderData.orderId}</div>
                <div style="font-size:12px;color:#666;">${escapeHtml(orderData.customer.name)}</div>
            </div>
            <div style="background:#e8f5e9;border-radius:12px;padding:12px;margin:15px 0;">
                <div>🔐 Безопасный платёж через Tinkoff</div>
                <div style="font-size:10px;color:#666;margin-top:4px;">Банковские карты, Tinkoff Pay</div>
                ${isTestMode ? '<div style="font-size:10px;color:#ff9800;margin-top:4px;">⚡ ТЕСТОВЫЙ РЕЖИМ</div>' : ''}
            </div>
            <button id="payConfirmBtn" style="background:linear-gradient(135deg,#00897b,#4db6ac);color:white;border:none;padding:14px;border-radius:40px;font-weight:600;width:100%;cursor:pointer;">Оплатить</button>
            <button id="payCancelBtn" style="background:transparent;border:1px solid #ddd;padding:14px;border-radius:40px;margin-top:10px;width:100%;cursor:pointer;">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    document.getElementById('payConfirmBtn').onclick = function() {
        modal.remove();
        document.body.style.overflow = '';
        showToast('🔄 Перенаправление на платёжную страницу...');
        setTimeout(() => {
            finalizeOrder(orderData);
        }, 2000);
    };
    document.getElementById('payCancelBtn').onclick = function() {
        modal.remove();
        document.body.style.overflow = '';
        showToast('❌ Оплата отменена');
    };
    modal.onclick = function(e) { if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; } };
}

// Оплата по СБП
function showSbpPayment(orderData) {
    const settings = getPaymentSettings();
    const sbpData = settings.sbp;
    
    const modal = document.createElement('div');
    modal.id = 'paymentModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:10002;';
    modal.innerHTML = `
        <div style="background:white;border-radius:28px;max-width:400px;width:90%;padding:24px;text-align:center;">
            <h3 style="margin:0 0 10px 0;">📱 Оплата по СБП</h3>
            <div style="font-size:64px;margin:20px 0;">📱</div>
            <div style="font-size:28px;font-weight:bold;color:#00897b;">${orderData.total.toLocaleString()} ₽</div>
            <div style="background:#f5f5f5;border-radius:16px;padding:15px;margin:15px 0;">
                <div>Заказ №${orderData.orderId}</div>
                <div style="font-size:12px;color:#666;">${escapeHtml(orderData.customer.name)}</div>
            </div>
            <div style="background:#e8f5e9;border-radius:12px;padding:12px;margin:15px 0;">
                <div>🏦 Получатель: ${escapeHtml(sbpData.recipient_name || 'Не указан')}</div>
                <div style="font-size:10px;color:#666;margin-top:4px;">ИНН: ${escapeHtml(sbpData.recipient_inn || '—')} | ${escapeHtml(sbpData.recipient_bank || '—')}</div>
            </div>
            <div id="qrCodeContainer" style="margin:15px 0; padding:20px; background:#f8fafc; border-radius:16px;">
                <div style="font-size:48px;">📱</div>
                <div style="font-size:12px;">Отсканируйте QR-код в приложении банка</div>
                <div style="font-size:10px; color:#666; margin-top:8px;">Сумма к оплате: ${orderData.total.toLocaleString()} ₽</div>
            </div>
            <button id="payConfirmBtn" style="background:linear-gradient(135deg,#00897b,#4db6ac);color:white;border:none;padding:14px;border-radius:40px;font-weight:600;width:100%;cursor:pointer;">✅ Я оплатил</button>
            <button id="payCancelBtn" style="background:transparent;border:1px solid #ddd;padding:14px;border-radius:40px;margin-top:10px;width:100%;cursor:pointer;">❌ Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Пытаемся сгенерировать QR-код
    if (typeof QRCode !== 'undefined' && sbpData.recipient_name) {
        const qrContainer = document.getElementById('qrCodeContainer');
        qrContainer.innerHTML = '';
        const qrData = `${sbpData.recipient_name}|${sbpData.recipient_inn}|${orderData.total}|${orderData.orderId}`;
        new QRCode(qrContainer, {
            text: qrData,
            width: 200,
            height: 200
        });
    }
    
    document.getElementById('payConfirmBtn').onclick = function() {
        modal.remove();
        document.body.style.overflow = '';
        finalizeOrder(orderData);
    };
    document.getElementById('payCancelBtn').onclick = function() {
        modal.remove();
        document.body.style.overflow = '';
        showToast('❌ Оплата отменена');
    };
    modal.onclick = function(e) { if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; } };
}

// Оплата наличными
function showCashPayment(orderData) {
    const modal = document.createElement('div');
    modal.id = 'paymentModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:10002;';
    modal.innerHTML = `
        <div style="background:white;border-radius:28px;max-width:400px;width:90%;padding:24px;text-align:center;">
            <h3 style="margin:0 0 10px 0;">💰 Оплата наличными</h3>
            <div style="font-size:64px;margin:20px 0;">💰</div>
            <div style="font-size:28px;font-weight:bold;color:#00897b;">${orderData.total.toLocaleString()} ₽</div>
            <div style="background:#f5f5f5;border-radius:16px;padding:15px;margin:15px 0;">
                <div>Заказ №${orderData.orderId}</div>
                <div style="font-size:12px;color:#666;">${escapeHtml(orderData.customer.name)}</div>
            </div>
            <div style="background:#e8f5e9;border-radius:12px;padding:12px;margin:15px 0;">
                <div>💰 Оплата при получении заказа</div>
                <div style="font-size:10px;color:#666;margin-top:4px;">Наличными курьеру или в пункте выдачи</div>
            </div>
            <button id="payConfirmBtn" style="background:linear-gradient(135deg,#00897b,#4db6ac);color:white;border:none;padding:14px;border-radius:40px;font-weight:600;width:100%;cursor:pointer;">✅ Подтвердить заказ</button>
            <button id="payCancelBtn" style="background:transparent;border:1px solid #ddd;padding:14px;border-radius:40px;margin-top:10px;width:100%;cursor:pointer;">❌ Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    document.getElementById('payConfirmBtn').onclick = function() { 
        modal.remove(); 
        document.body.style.overflow = ''; 
        finalizeOrder(orderData); 
    };
    document.getElementById('payCancelBtn').onclick = function() { 
        modal.remove(); 
        document.body.style.overflow = ''; 
        showToast('❌ Заказ отменён'); 
    };
    modal.onclick = function(e) { if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; } };
}

// ===== ФИНАЛИЗАЦИЯ ЗАКАЗА =====

function finalizeOrder(orderData) {
    console.log('🏁 ФИНАЛИЗАЦИЯ ЗАКАЗА:', orderData);
    
    saveOrderToCRM(orderData);
    clearCart();
    if (typeof clearPendingOrder === 'function') clearPendingOrder();
    showSuccessMessage(orderData);
    
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) paymentModal.remove();
    document.body.style.overflow = '';
    
    if (typeof updateCartCount === 'function') updateCartCount();
    if (typeof updateCartDisplay === 'function') updateCartDisplay();
}

function saveOrderToCRM(orderData) {
    console.log('📤 Сохранение заказа в CRM...');
    
    const orderForCRM = {
        order_id: orderData.orderId,
        date: orderData.date,
        customer: {
            name: orderData.customer.name,
            phone: orderData.customer.phone,
            email: orderData.customer.email || ''
        },
        delivery: {
            method: orderData.delivery.method,
            price: orderData.delivery.price
        },
        address: orderData.address || '',
        items: orderData.items.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            size: item.size || '—',
            color: item.color || '—',
            article: item.article || '—'
        })),
        total: orderData.total,
        payment: orderData.payment,
        comment: orderData.comment || '',
        status: 'new'
    };
    
    let crmData = localStorage.getItem('crm_data');
    let allOrders = [], allProducts = [], allCategories = [];
    
    if (crmData) {
        try {
            const data = JSON.parse(crmData);
            allOrders = data.orders || [];
            allProducts = data.products || [];
            allCategories = data.categories || [];
        } catch(e) { console.error(e); }
    }
    
    allOrders.unshift(orderForCRM);
    
    const newCrmData = { 
        orders: allOrders, 
        products: allProducts,
        categories: allCategories,
        leads: [],
        messages: {},
        settings: {}
    };
    
    localStorage.setItem('crm_data', JSON.stringify(newCrmData));
    console.log('✅ Заказ сохранён в CRM, всего заказов:', allOrders.length);
}

function showSuccessMessage(orderData) {
    const modal = document.createElement('div');
    modal.id = 'successModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:10003;';
    modal.innerHTML = `
        <div style="background:white;border-radius:28px;max-width:400px;width:90%;padding:32px 24px;text-align:center;animation:modalSlideIn 0.3s ease;">
            <div style="font-size:64px;margin-bottom:16px;">🎉</div>
            <h2 style="color:#00897b;margin:0 0 16px 0;">Спасибо за заказ!</h2>
            <p style="margin:0 0 8px 0;font-size:16px;">Заказ №${orderData.orderId} принят</p>
            <p style="color:#666;font-size:14px;margin-bottom:24px;">Сумма: ${orderData.total.toLocaleString()} ₽</p>
            <div style="background:#f8fafc;border-radius:16px;padding:16px;margin-bottom:24px;text-align:left;">
                <p style="margin:0 0 8px 0;font-size:14px;"><strong>📞 Информация о заказе</strong></p>
                <p style="margin:0 0 4px 0;font-size:12px;color:#666;">Получатель: ${escapeHtml(orderData.customer.name)}</p>
                <p style="margin:0 0 4px 0;font-size:12px;color:#666;">Телефон: ${escapeHtml(orderData.customer.phone)}</p>
                ${orderData.delivery.method === 'courier' ? `<p style="margin:0;font-size:12px;color:#666;">Доставка: ${escapeHtml(orderData.address)}</p>` : ''}
            </div>
            <button id="successCloseBtn" style="background:linear-gradient(135deg,#00897b,#4db6ac);color:white;border:none;padding:14px 24px;border-radius:40px;font-weight:600;cursor:pointer;width:100%;">Продолжить покупки</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    const successModal = document.getElementById('successModal');
    document.getElementById('successCloseBtn').onclick = function() {
        successModal.remove();
        document.body.style.overflow = '';
        if (typeof closeCart === 'function') closeCart();
    };
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = '';
            if (typeof closeCart === 'function') closeCart();
        }
    };
}

function clearCart() {
    localStorage.setItem('cart', '[]');
    if (typeof updateCartCount === 'function') updateCartCount();
    if (typeof updateCartDisplay === 'function') updateCartDisplay();
    console.log('🗑️ Корзина очищена');
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function showToast(msg) {
    let t = document.getElementById('cartToast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'cartToast';
        t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1a2c3e;color:white;padding:12px 24px;border-radius:40px;z-index:100000;font-size:14px;opacity:0;transition:0.3s';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    setTimeout(function() { t.style.opacity = '0'; }, 3000);
}

// Экспорт функций
window.openPayment = openPayment;
window.finalizeOrder = finalizeOrder;
window.getPaymentSettings = getPaymentSettings;
window.isPaymentMethodAvailable = isPaymentMethodAvailable;
