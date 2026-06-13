// ===== js/cart-payment.js - ОПЛАТА =====

function openPayment(orderData) {
    const method = orderData.payment;
    if (method === 'card') showCard(orderData);
    else if (method === 'sbp') showSbp(orderData);
    else if (method === 'cash') showCash(orderData);
}

function showCard(orderData) {
    const modal = document.createElement('div');
    modal.id = 'paymentModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:10002;';
    modal.innerHTML = `
        <div style="background:white;border-radius:28px;max-width:400px;width:90%;padding:24px;text-align:center;">
            <h3 style="margin:0 0 10px 0;">💳 Оплата картой</h3>
            <div style="font-size:64px;margin:20px 0;">💳</div>
            <div style="font-size:28px;font-weight:bold;color:#00897b;">${orderData.total.toLocaleString()} ₽</div>
            <div style="background:#f5f5f5;border-radius:16px;padding:15px;margin:15px 0;">
                <div>Заказ №${orderData.orderId}</div>
                <div style="font-size:12px;color:#666;">${escapeHtml(orderData.customer.name)}</div>
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
        finalizeOrder(orderData); 
    };
    document.getElementById('payCancelBtn').onclick = function() { 
        modal.remove(); 
        document.body.style.overflow = ''; 
        showToast('❌ Оплата отменена'); 
    };
    modal.onclick = function(e) { if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; } };
}

function showSbp(orderData) {
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
                <div>🏦 Отсканируйте QR-код в приложении банка</div>
                <div style="font-size:10px;color:#666;margin-top:4px;">Сбербанк, Тинькофф, Альфа-Банк и другие</div>
            </div>
            <button id="payConfirmBtn" style="background:linear-gradient(135deg,#00897b,#4db6ac);color:white;border:none;padding:14px;border-radius:40px;font-weight:600;width:100%;cursor:pointer;">✅ Я оплатил</button>
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
        showToast('❌ Оплата отменена'); 
    };
    modal.onclick = function(e) { if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; } };
}

function showCash(orderData) {
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

// ===== ПРОЦЕССИНГ ПЛАТЕЖЕЙ =====

function processPayment(orderData) {
    const settings = getPaymentSystemSettings();
    const method = orderData.payment;
    
    if (method === 'card') {
        if (settings?.yookassa?.shop_id && settings.yookassa.secret_key) {
            processYookassaPayment(orderData, settings.yookassa);
        } else if (settings?.tinkoff?.terminal_key && settings.tinkoff.secret_key) {
            processTinkoffPayment(orderData, settings.tinkoff);
        } else {
            showCard(orderData);
        }
    } else if (method === 'sbp') {
        if (settings?.sbp?.recipient_name) {
            processSbpPayment(orderData, settings.sbp);
        } else {
            showSbp(orderData);
        }
    } else if (method === 'cash') {
        showCash(orderData);
    }
}

function processYookassaPayment(orderData, yookassaSettings) {
    console.log('🏦 Обработка платежа через ЮKassa');
    
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
        // Здесь будет вызов API ЮKassa
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

function processTinkoffPayment(orderData, tinkoffSettings) {
    console.log('🏦 Обработка платежа через Tinkoff');
    
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

function processSbpPayment(orderData, sbpSettings) {
    console.log('📱 Обработка платежа через СБП');
    
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
                <div>🏦 Получатель: ${escapeHtml(sbpSettings.recipient_name)}</div>
                <div style="font-size:10px;color:#666;margin-top:4px;">ИНН: ${escapeHtml(sbpSettings.recipient_inn)} | ${escapeHtml(sbpSettings.recipient_bank)}</div>
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
    
    // Генерация QR-кода (если есть библиотека)
    if (typeof QRCode !== 'undefined' && document.getElementById('qrCodeContainer')) {
        const qrData = `${sbpSettings.recipient_name}|${sbpSettings.recipient_inn}|${orderData.total}|${orderData.orderId}`;
        new QRCode(document.getElementById('qrCodeContainer'), {
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

function getPaymentSystemSettings() {
    const saved = localStorage.getItem('payment_settings');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) {}
    }
    return null;
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

window.openPayment = openPayment;
window.finalizeOrder = finalizeOrder;
window.processPayment = processPayment;
