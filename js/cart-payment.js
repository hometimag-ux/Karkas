// ===== js/cart-payment.js - ОПЛАТА =====

const CRM_API_URL = 'https://your-crm.com/api/orders';

function openPaymentModal(orderData) {
    const paymentMethod = orderData.payment;
    
    if (paymentMethod === 'card') {
        showCardPayment(orderData);
    } else if (paymentMethod === 'sbp') {
        showSbpPayment(orderData);
    } else if (paymentMethod === 'cash') {
        showCashPayment(orderData);
    }
}

function showCardPayment(orderData) {
    const modalHtml = `
        <div id="paymentModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10002;">
            <div style="background:white;border-radius:28px;max-width:400px;width:90%;padding:24px;text-align:center;">
                <h3>💳 Оплата картой</h3>
                <div style="font-size:32px;margin:20px 0;">💳</div>
                <div style="font-size:24px;font-weight:bold;color:#00897b;margin:10px 0;">${orderData.total.toLocaleString()} ₽</div>
                <div style="background:#f5f5f5;border-radius:16px;padding:15px;margin:15px 0;">
                    <div>Заказ №${orderData.orderId}</div>
                    <div style="font-size:12px;color:#666;">${orderData.customer.name}</div>
                </div>
                <button id="payBtn" style="background:linear-gradient(135deg,#00897b,#4db6ac);color:white;border:none;padding:14px;border-radius:40px;font-weight:600;width:100%;cursor:pointer;">Оплатить ${orderData.total.toLocaleString()} ₽</button>
                <button id="cancelPayBtn" style="background:transparent;border:1px solid #ddd;padding:14px;border-radius:40px;margin-top:10px;width:100%;cursor:pointer;">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    const modal = document.getElementById('paymentModal');
    document.getElementById('payBtn').onclick = () => {
        modal.remove();
        document.body.style.overflow = '';
        finalizeOrder(orderData);
    };
    document.getElementById('cancelPayBtn').onclick = () => {
        modal.remove();
        document.body.style.overflow = '';
        showToast('Оплата отменена', 'error');
    };
    modal.onclick = (e) => { if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; } };
}

function showSbpPayment(orderData) {
    const modalHtml = `
        <div id="paymentModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10002;">
            <div style="background:white;border-radius:28px;max-width:400px;width:90%;padding:24px;text-align:center;">
                <h3>📱 Оплата по СБП</h3>
                <div style="font-size:64px;margin:20px 0;">📱</div>
                <div style="font-size:24px;font-weight:bold;color:#00897b;margin:10px 0;">${orderData.total.toLocaleString()} ₽</div>
                <div style="background:#f5f5f5;border-radius:16px;padding:15px;margin:15px 0;">
                    <div>Заказ №${orderData.orderId}</div>
                    <div style="font-size:12px;color:#666;">${orderData.customer.name}</div>
                </div>
                <div style="background:#e8f5e9;border-radius:12px;padding:12px;margin:15px 0;">
                    <div>🏦 Отсканируйте QR-код в приложении банка</div>
                </div>
                <button id="payBtn" style="background:linear-gradient(135deg,#00897b,#4db6ac);color:white;border:none;padding:14px;border-radius:40px;font-weight:600;width:100%;cursor:pointer;">✅ Я оплатил</button>
                <button id="cancelPayBtn" style="background:transparent;border:1px solid #ddd;padding:14px;border-radius:40px;margin-top:10px;width:100%;cursor:pointer;">❌ Отмена</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    const modal = document.getElementById('paymentModal');
    document.getElementById('payBtn').onclick = () => {
        modal.remove();
        document.body.style.overflow = '';
        finalizeOrder(orderData);
    };
    document.getElementById('cancelPayBtn').onclick = () => {
        modal.remove();
        document.body.style.overflow = '';
        showToast('Оплата отменена', 'error');
    };
    modal.onclick = (e) => { if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; } };
}

function showCashPayment(orderData) {
    const modalHtml = `
        <div id="paymentModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10002;">
            <div style="background:white;border-radius:28px;max-width:400px;width:90%;padding:24px;text-align:center;">
                <h3>💰 Оплата наличными</h3>
                <div style="font-size:64px;margin:20px 0;">💰</div>
                <div style="font-size:24px;font-weight:bold;color:#00897b;margin:10px 0;">${orderData.total.toLocaleString()} ₽</div>
                <div style="background:#f5f5f5;border-radius:16px;padding:15px;margin:15px 0;">
                    <div>Заказ №${orderData.orderId}</div>
                    <div style="font-size:12px;color:#666;">${orderData.customer.name}</div>
                </div>
                <button id="confirmBtn" style="background:linear-gradient(135deg,#00897b,#4db6ac);color:white;border:none;padding:14px;border-radius:40px;font-weight:600;width:100%;cursor:pointer;">✅ Подтвердить заказ</button>
                <button id="cancelBtn" style="background:transparent;border:1px solid #ddd;padding:14px;border-radius:40px;margin-top:10px;width:100%;cursor:pointer;">❌ Отмена</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    const modal = document.getElementById('paymentModal');
    document.getElementById('confirmBtn').onclick = () => {
        modal.remove();
        document.body.style.overflow = '';
        finalizeOrder(orderData);
    };
    document.getElementById('cancelBtn').onclick = () => {
        modal.remove();
        document.body.style.overflow = '';
        showToast('Заказ отменён', 'error');
    };
    modal.onclick = (e) => { if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; } };
}

// ФИНАЛИЗАЦИЯ - ТОЛЬКО ЗДЕСЬ ОЧИЩАЕТСЯ КОРЗИНА!
function finalizeOrder(orderData) {
    // 1. Отправка в CRM
    sendOrderToCRM(orderData);
    
    // 2. Очистка корзины
    clearCart();
    
    // 3. Благодарность
    showToast(`🎉 Заказ №${orderData.orderId} оформлен! Спасибо за покупку!`, 'success');
    
    // 4. Обновление интерфейса
    if (typeof updateCartCount === 'function') updateCartCount();
    if (typeof closeCartSidebar === 'function') closeCartSidebar();
}

function sendOrderToCRM(orderData) {
    console.log('📤 Отправка в CRM:', orderData);
    
    const crmData = {
        order_id: orderData.orderId,
        date: orderData.date,
        customer: orderData.customer,
        delivery: orderData.delivery,
        address: orderData.address,
        items: orderData.items.map(item => ({
            id: item.id,
            name: item.title,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color
        })),
        total: orderData.total,
        payment: orderData.payment,
        comment: orderData.comment
    };
    
    // Отправка на ваш сервер
    fetch(CRM_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crmData)
    })
    .then(response => response.json())
    .then(data => console.log('✅ CRM ответ:', data))
    .catch(error => {
        console.error('❌ Ошибка отправки:', error);
        // Сохраняем неотправленный заказ
        const failed = JSON.parse(localStorage.getItem('failedOrders') || '[]');
        failed.push(crmData);
        localStorage.setItem('failedOrders', JSON.stringify(failed));
    });
}
