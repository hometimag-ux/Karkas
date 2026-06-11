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
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10002;';
    modal.innerHTML = `
        <div style="background:white;border-radius:28px;max-width:400px;width:90%;padding:24px;text-align:center;">
            <h3 style="margin:0 0 10px 0;">💳 Оплата картой</h3>
            <div style="font-size:64px;margin:20px 0;">💳</div>
            <div style="font-size:28px;font-weight:bold;color:#00897b;">${orderData.total.toLocaleString()} ₽</div>
            <div style="background:#f5f5f5;border-radius:16px;padding:15px;margin:15px 0;">
                <div>Заказ №${orderData.orderId}</div>
                <div style="font-size:12px;color:#666;">${orderData.customer.name}</div>
            </div>
            <button id="payConfirmBtn" style="background:linear-gradient(135deg,#00897b,#4db6ac);color:white;border:none;padding:14px;border-radius:40px;font-weight:600;width:100%;cursor:pointer;">Оплатить</button>
            <button id="payCancelBtn" style="background:transparent;border:1px solid #ddd;padding:14px;border-radius:40px;margin-top:10px;width:100%;cursor:pointer;">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    document.getElementById('payConfirmBtn').onclick = () => { modal.remove(); document.body.style.overflow = ''; finalizeOrder(orderData); };
    document.getElementById('payCancelBtn').onclick = () => { modal.remove(); document.body.style.overflow = ''; showToast('Оплата отменена'); };
    modal.onclick = (e) => { if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; } };
}

function showSbp(orderData) {
    const modal = document.createElement('div');
    modal.id = 'paymentModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10002;';
    modal.innerHTML = `
        <div style="background:white;border-radius:28px;max-width:400px;width:90%;padding:24px;text-align:center;">
            <h3 style="margin:0 0 10px 0;">📱 Оплата по СБП</h3>
            <div style="font-size:64px;margin:20px 0;">📱</div>
            <div style="font-size:28px;font-weight:bold;color:#00897b;">${orderData.total.toLocaleString()} ₽</div>
            <div style="background:#f5f5f5;border-radius:16px;padding:15px;margin:15px 0;">
                <div>Заказ №${orderData.orderId}</div>
                <div style="font-size:12px;color:#666;">${orderData.customer.name}</div>
            </div>
            <div style="background:#e8f5e9;border-radius:12px;padding:12px;margin:15px 0;"><div>🏦 Отсканируйте QR-код в приложении банка</div></div>
            <button id="payConfirmBtn" style="background:linear-gradient(135deg,#00897b,#4db6ac);color:white;border:none;padding:14px;border-radius:40px;font-weight:600;width:100%;cursor:pointer;">✅ Я оплатил</button>
            <button id="payCancelBtn" style="background:transparent;border:1px solid #ddd;padding:14px;border-radius:40px;margin-top:10px;width:100%;cursor:pointer;">❌ Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    document.getElementById('payConfirmBtn').onclick = () => { modal.remove(); document.body.style.overflow = ''; finalizeOrder(orderData); };
    document.getElementById('payCancelBtn').onclick = () => { modal.remove(); document.body.style.overflow = ''; showToast('Оплата отменена'); };
    modal.onclick = (e) => { if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; } };
}

function showCash(orderData) {
    const modal = document.createElement('div');
    modal.id = 'paymentModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10002;';
    modal.innerHTML = `
        <div style="background:white;border-radius:28px;max-width:400px;width:90%;padding:24px;text-align:center;">
            <h3 style="margin:0 0 10px 0;">💰 Оплата наличными</h3>
            <div style="font-size:64px;margin:20px 0;">💰</div>
            <div style="font-size:28px;font-weight:bold;color:#00897b;">${orderData.total.toLocaleString()} ₽</div>
            <div style="background:#f5f5f5;border-radius:16px;padding:15px;margin:15px 0;">
                <div>Заказ №${orderData.orderId}</div>
                <div style="font-size:12px;color:#666;">${orderData.customer.name}</div>
            </div>
            <button id="payConfirmBtn" style="background:linear-gradient(135deg,#00897b,#4db6ac);color:white;border:none;padding:14px;border-radius:40px;font-weight:600;width:100%;cursor:pointer;">✅ Подтвердить заказ</button>
            <button id="payCancelBtn" style="background:transparent;border:1px solid #ddd;padding:14px;border-radius:40px;margin-top:10px;width:100%;cursor:pointer;">❌ Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    document.getElementById('payConfirmBtn').onclick = () => { modal.remove(); document.body.style.overflow = ''; finalizeOrder(orderData); };
    document.getElementById('payCancelBtn').onclick = () => { modal.remove(); document.body.style.overflow = ''; showToast('Заказ отменён'); };
    modal.onclick = (e) => { if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; } };
}

// ФИНАЛИЗАЦИЯ - ДАННЫЕ КОРЗИНЫ НЕ ОЧИЩАЮТСЯ!
function finalizeOrder(orderData) {
    // Отправка в CRM
    fetch('https://your-crm.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    }).catch(e => console.error('CRM error:', e));
    
    // Благодарность (корзина НЕ очищается!)
    showToast(`🎉 Заказ №${orderData.orderId} оформлен! Спасибо за покупку!`);
    
    // Закрываем все окна
    document.querySelectorAll('#paymentModal, #checkoutModal').forEach(m => m?.remove());
    document.body.style.overflow = '';
}
