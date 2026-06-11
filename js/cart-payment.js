// ===== js/cart-payment.js - ОПЛАТА И CRM =====

// URL для отправки в CRM (ЗАМЕНИТЕ НА ВАШ)
const CRM_API_URL = 'https://your-crm.com/api/orders';

// Обработка оплаты
function processPayment(orderData) {
    console.log('💰 Обработка оплаты:', orderData.payment);
    
    switch (orderData.payment) {
        case 'sbp':
            openSbpPayment(orderData);
            break;
        case 'card':
            processCardPayment(orderData);
            break;
        case 'cash':
            processCashPayment(orderData);
            break;
        default:
            showToast('❌ Неизвестный способ оплаты', 'error');
    }
}

// Оплата картой (через платежную систему)
function processCardPayment(orderData) {
    // Здесь будет интеграция с платежной системой (ЮKassa, Tinkoff и т.д.)
    // Пока имитируем успешную оплату
    
    showToast('💳 Перенаправление на оплату...', 'info');
    
    // Имитация оплаты
    setTimeout(() => {
        showToast('✅ Оплата прошла успешно!', 'success');
        finalizeOrder(orderData);
    }, 1500);
}

// Оплата наличными
function processCashPayment(orderData) {
    showToast(`💰 Заказ №${orderData.orderId} оформлен. Оплата при получении`, 'success');
    finalizeOrder(orderData);
}

// Оплата через СБП
function openSbpPayment(orderData) {
    console.log('📱 Открываем оплату СБП');
    
    const modalHtml = `
        <div id="sbpModal" style="
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
            z-index: 10001;
        ">
            <div style="
                background: white;
                border-radius: 28px;
                max-width: 400px;
                width: 90%;
                padding: 24px;
                text-align: center;
                animation: modalSlideIn 0.3s ease;
            ">
                <h3 style="margin: 0 0 10px 0;">💳 Оплата по СБП</h3>
                
                <div style="font-size: 64px; margin: 20px 0;">📱</div>
                
                <div style="font-size: 28px; font-weight: bold; color: #00897b; margin: 10px 0;">
                    ${orderData.total.toLocaleString()} ₽
                </div>
                
                <div style="background: #f5f5f5; border-radius: 16px; padding: 15px; margin: 15px 0;">
                    <div style="font-weight: 500;">Заказ №${orderData.orderId}</div>
                    <div style="font-size: 13px; color: #666; margin-top: 8px;">
                        ${orderData.customer.name}<br>
                        ${orderData.customer.phone}
                    </div>
                </div>
                
                <div style="background: #e8f5e9; border-radius: 12px; padding: 12px; margin: 15px 0;">
                    <div style="font-size: 14px; color: #2e7d32;">
                        🏦 Отсканируйте QR-код в приложении банка
                    </div>
                    <div style="font-size: 12px; color: #666; margin-top: 8px;">
                        Сбербанк, Тинькофф, Альфа-Банк и другие
                    </div>
                </div>
                
                <div style="display: flex; gap: 12px; margin-top: 20px;">
                    <button id="sbpSuccessBtn" style="
                        flex: 2;
                        background: linear-gradient(135deg, #00897b, #4db6ac);
                        color: white;
                        border: none;
                        padding: 14px;
                        border-radius: 40px;
                        font-weight: 600;
                        cursor: pointer;
                    ">✅ Я оплатил</button>
                    <button id="sbpCancelBtn" style="
                        flex: 1;
                        background: transparent;
                        border: 1px solid #ddd;
                        padding: 14px;
                        border-radius: 40px;
                        cursor: pointer;
                    ">❌ Отмена</button>
                </div>
                
                <div style="font-size: 11px; color: #999; margin-top: 15px;">
                    После оплаты заказ будет автоматически передан в обработку
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    const modal = document.getElementById('sbpModal');
    const successBtn = document.getElementById('sbpSuccessBtn');
    const cancelBtn = document.getElementById('sbpCancelBtn');
    
    const closeModal = () => {
        modal.remove();
        document.body.style.overflow = '';
    };
    
    if (successBtn) {
        successBtn.onclick = () => {
            showToast('✅ Оплата подтверждена!', 'success');
            closeModal();
            finalizeOrder(orderData);
        };
    }
    
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            showToast('❌ Оплата отменена', 'error');
            closeModal();
        };
    }
    
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}

// ФИНАЛИЗАЦИЯ ЗАКАЗА - ТОЛЬКО ЗДЕСЬ ОЧИЩАЕТСЯ КОРЗИНА!
function finalizeOrder(orderData) {
    console.log('🏁 ФИНАЛИЗАЦИЯ ЗАКАЗА:', orderData);
    
    // 1. Отправляем заказ в CRM
    sendOrderToCRM(orderData);
    
    // 2. Очищаем корзину (ТОЛЬКО ПОСЛЕ УСПЕШНОЙ ОПЛАТЫ!)
    clearCart();
    
    // 3. Очищаем незавершённый заказ
    clearPendingOrder();
    
    // 4. Показываем сообщение об успехе
    showToast(`🎉 Заказ №${orderData.orderId} оформлен! Спасибо!`, 'success');
    
    // 5. Опционально: перенаправление на страницу "Спасибо"
    // setTimeout(() => {
    //     window.location.href = '/thank-you.html';
    // }, 2000);
}

// Отправка заказа в CRM
function sendOrderToCRM(orderData) {
    console.log('📤 Отправка заказа в CRM:', orderData);
    
    // Формируем данные для CRM
    const crmData = {
        external_id: orderData.orderId,
        date: orderData.date,
        customer: {
            name: orderData.customer.name,
            phone: orderData.customer.phone,
            email: orderData.customer.email
        },
        delivery: {
            type: orderData.delivery.method,
            price: orderData.delivery.price,
            address: orderData.address
        },
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
    
    console.log('📦 Данные для CRM:', crmData);
    
    // Отправка на сервер (замените на ваш реальный endpoint)
    fetch(CRM_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(crmData)
    })
    .then(response => {
        if (response.ok) {
            console.log('✅ Заказ успешно отправлен в CRM');
            return response.json();
        }
        throw new Error('Ошибка отправки');
    })
    .then(data => {
        console.log('Ответ CRM:', data);
    })
    .catch(error => {
        console.error('❌ Ошибка отправки в CRM:', error);
        // Сохраняем заказ в localStorage на случай ошибки
        const failedOrders = JSON.parse(localStorage.getItem('failedOrders') || '[]');
        failedOrders.push(crmData);
        localStorage.setItem('failedOrders', JSON.stringify(failedOrders));
        showToast('⚠️ Заказ сохранён локально. Мы свяжемся с вами', 'error');
    });
}
