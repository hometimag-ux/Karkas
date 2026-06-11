// ===== js/cart-payment.js - ОПЛАТА =====

// Обработка оплаты
function processPayment(orderData) {
    console.log('💰 Процессинг оплаты:', orderData);
    
    const paymentMethod = orderData.payment;
    
    if (paymentMethod === 'sbp') {
        openSbpPayment(orderData);
    } else if (paymentMethod === 'card') {
        processCardPayment(orderData);
    } else if (paymentMethod === 'cash') {
        processCashPayment(orderData);
    } else {
        showToast('❌ Неизвестный способ оплаты');
    }
}

// Оплата картой (заглушка)
function processCardPayment(orderData) {
    showToast(`💳 Спасибо, ${orderData.customer.name}! Сумма: ${orderData.total.toLocaleString()} ₽`);
    showToast('📞 Наш менеджер свяжется с вами');
    
    // Очищаем корзину и отправляем в CRM
    finalizeOrder(orderData);
}

// Оплата наличными (заглушка)
function processCashPayment(orderData) {
    showToast(`💰 Спасибо, ${orderData.customer.name}! Сумма: ${orderData.total.toLocaleString()} ₽`);
    showToast('📞 Наш менеджер свяжется с вами');
    
    // Очищаем корзину и отправляем в CRM
    finalizeOrder(orderData);
}

// Финализация заказа (очистка корзины + отправка в CRM)
function finalizeOrder(orderData) {
    // Отправляем данные в CRM
    sendOrderToCRM(orderData);
    
    // Очищаем корзину и временные данные
    clearCart();
    localStorage.removeItem('pendingOrder');
    
    // Обновляем интерфейс
    if (typeof updateCartCount === 'function') updateCartCount();
    if (typeof closeCartSidebar === 'function') closeCartSidebar();
}

// Отправка заказа в CRM
function sendOrderToCRM(orderData) {
    console.log('📤 Отправка в CRM:', orderData);
    
    // TODO: Замените на ваш реальный endpoint
    // Пример отправки:
    /*
    fetch('https://your-crm.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ Отправлено в CRM:', data);
        showToast('📦 Заказ передан в обработку');
    })
    .catch(error => {
        console.error('❌ Ошибка отправки:', error);
        showToast('❌ Ошибка при отправке заказа');
    });
    */
    
    // Пока просто имитируем отправку
    showToast('📦 Заказ передан в обработку');
}

// Оплата через СБП
function openSbpPayment(orderData) {
    console.log('📱 Открываем оплату СБП', orderData);
    
    localStorage.setItem('pendingOrder', JSON.stringify(orderData));
    
    const oldModal = document.getElementById('sbpPaymentModal');
    if (oldModal) oldModal.remove();
    
    const modalHtml = `
        <div id="sbpPaymentModal" style="
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
            z-index: 100000;
        ">
            <div style="
                background: white;
                border-radius: 28px;
                max-width: 400px;
                width: 90%;
                padding: 20px;
                text-align: center;
                animation: modalSlideIn 0.3s ease;
            ">
                <h3 style="margin: 0 0 10px 0;">💳 Оплата по СБП</h3>
                <div style="font-size: 48px; margin: 20px 0;">📱</div>
                <div style="font-size: 24px; font-weight: bold; color: #00897b; margin: 10px 0;">
                    ${orderData.total.toLocaleString()} ₽
                </div>
                <div style="background: #f5f5f5; border-radius: 16px; padding: 15px; margin: 15px 0;">
                    <div style="font-weight: 500;">Заказ №${orderData.orderId}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 10px;">
                        Покупатель: ${escapeHtml(orderData.customer.name)}<br>
                        Сканируйте QR-код в приложении банка
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <button id="sbpBackBtn" style="
                        background: transparent;
                        border: 1px solid #ddd;
                        padding: 8px 16px;
                        border-radius: 40px;
                        cursor: pointer;
                        font-size: 12px;
                        color: #666;
                    ">◀ Вернуться к заказу</button>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button id="sbpSuccessBtn" style="
                        flex: 2;
                        background: linear-gradient(135deg, #00897b, #4db6ac);
                        color: white;
                        border: none;
                        padding: 12px;
                        border-radius: 40px;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 14px;
                    ">✅ Я оплатил</button>
                    <button id="sbpCancelBtn" style="
                        flex: 1;
                        background: transparent;
                        border: 1px solid #ccc;
                        padding: 12px;
                        border-radius: 40px;
                        cursor: pointer;
                        font-size: 14px;
                    ">❌ Отмена</button>
                </div>
                <div style="font-size: 10px; color: #999; margin-top: 15px;">
                    Оплата через Систему Быстрых Платежей (СБП)
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    const modal = document.getElementById('sbpPaymentModal');
    const successBtn = document.getElementById('sbpSuccessBtn');
    const cancelBtn = document.getElementById('sbpCancelBtn');
    const backBtn = document.getElementById('sbpBackBtn');
    
    const closeModal = () => {
        modal.remove();
        document.body.style.overflow = '';
    };
    
    if (successBtn) {
        successBtn.onclick = () => {
            showToast('✅ Заказ успешно оплачен! Спасибо!');
            finalizeOrder(orderData);
            closeModal();
        };
    }
    
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            showToast('❌ Оплата отменена. Вы можете продолжить покупки');
            closeModal();
        };
    }
    
    if (backBtn) {
        backBtn.onclick = () => {
            closeModal();
            setTimeout(() => {
                if (typeof openCheckoutModal === 'function') {
                    openCheckoutModal();
                }
            }, 100);
        };
    }
    
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
}
