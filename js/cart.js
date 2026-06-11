// ===== ПОЛНОСТЬЮ РАБОТАЮЩАЯ КОРЗИНА =====

// Функция для безопасного вывода текста
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Показ уведомлений
function showToast(message) {
    let toast = document.getElementById('customToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'customToast';
        toast.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            background: #1a2c3e; color: white; padding: 12px 24px;
            border-radius: 40px; z-index: 100000; font-size: 14px;
            opacity: 0; transition: 0.3s; pointer-events: none;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

// Обновление счётчика корзины
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counter = document.getElementById('cartCounter');
    if (counter) counter.textContent = total;
    
    // Обновляем отображение в сайдбаре
    const container = document.getElementById('cartItems');
    const totalContainer = document.getElementById('cartTotal');
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
        if (totalContainer) totalContainer.innerHTML = '';
        return;
    }
    
    let html = '';
    let totalSum = 0;
    cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        totalSum += itemTotal;
        html += `
            <div class="cart-item" data-id="${item.id}" data-size="${escapeHtml(item.size)}" data-color="${escapeHtml(item.color)}">
                <div class="cart-item-image">
                    ${item.image ? `<img src="${item.image}" style="width:50px;height:50px;object-fit:cover">` : '<div style="width:50px;height:50px;background:#eee;display:flex;align-items:center;justify-content:center">👕</div>'}
                </div>
                <div class="cart-item-info" style="flex:1">
                    <div style="font-weight:600">${escapeHtml(item.title)}</div>
                    <div style="font-size:12px;color:#666">${escapeHtml(item.size)} / ${escapeHtml(item.color)}</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px">
                    <button class="cart-qty-btn" data-delta="-1" style="width:28px;height:28px;border-radius:50%;border:1px solid #ddd;background:white;cursor:pointer">−</button>
                    <span>${item.quantity}</span>
                    <button class="cart-qty-btn" data-delta="1" style="width:28px;height:28px;border-radius:50%;border:1px solid #ddd;background:white;cursor:pointer">+</button>
                </div>
                <div style="min-width:80px;text-align:right">
                    <div style="font-weight:600">${itemTotal.toLocaleString()} ₽</div>
                    <button class="cart-remove-btn" style="background:none;border:none;cursor:pointer;color:#999">🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    if (totalContainer) {
        totalContainer.innerHTML = `<div style="display:flex;justify-content:space-between;font-weight:700"><span>Итого:</span><strong>${totalSum.toLocaleString()} ₽</strong></div>`;
    }
    
    // Навешиваем обработчики
    document.querySelectorAll('.cart-qty-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const itemDiv = btn.closest('.cart-item');
            const id = parseInt(itemDiv.dataset.id);
            const size = itemDiv.dataset.size;
            const color = itemDiv.dataset.color;
            const delta = parseInt(btn.dataset.delta);
            
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const index = cart.findIndex(item => item.id === id && item.size === size && item.color === color);
            if (index !== -1) {
                cart[index].quantity += delta;
                if (cart[index].quantity <= 0) cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
            }
        };
    });
    
    document.querySelectorAll('.cart-remove-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const itemDiv = btn.closest('.cart-item');
            const id = parseInt(itemDiv.dataset.id);
            const size = itemDiv.dataset.size;
            const color = itemDiv.dataset.color;
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            cart = cart.filter(item => !(item.id === id && item.size === size && item.color === color));
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            showToast('Товар удалён');
        };
    });
}

// Добавление в корзину
function addToCartById(id) {
    const product = window.allProducts ? window.allProducts.find(p => p.id === id) : null;
    if (!product) {
        showToast('Ошибка: товар не найден');
        return;
    }
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.discount_price || product.price,
            quantity: 1,
            size: '—',
            color: '—',
            image: product.images?.[0] || null
        });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`✅ ${product.title} добавлен в корзину`);
}

// ОТКРЫТИЕ ОПЛАТЫ СБП (упрощённая версия)
function openSbpPayment(orderData) {
    console.log('🔥 Открываем оплату СБП', orderData);
    
    // Удаляем старое окно если есть
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
            ">
                <h3 style="margin: 0 0 10px 0">💳 Оплата по СБП</h3>
                <div style="font-size: 48px; margin: 20px 0">📱</div>
                <div style="font-size: 24px; font-weight: bold; color: #00897b; margin: 10px 0">
                    ${orderData.total.toLocaleString()} ₽
                </div>
                <div style="background: #f5f5f5; border-radius: 16px; padding: 15px; margin: 15px 0">
                    <div>Заказ №${orderData.orderId || 'ORDER_' + Date.now()}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 10px">
                        Сканируйте QR-код в приложении банка
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 20px">
                    <button id="sbpSuccessBtn" style="
                        flex: 2;
                        background: linear-gradient(135deg, #00897b, #4db6ac);
                        color: white;
                        border: none;
                        padding: 12px;
                        border-radius: 40px;
                        font-weight: 600;
                        cursor: pointer;
                    ">✅ Я оплатил</button>
                    <button id="sbpCancelBtn" style="
                        flex: 1;
                        background: transparent;
                        border: 1px solid #ccc;
                        padding: 12px;
                        border-radius: 40px;
                        cursor: pointer;
                    ">❌ Отмена</button>
                </div>
                <div style="font-size: 10px; color: #999; margin-top: 15px">
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
    
    const closeModal = () => {
        modal.remove();
        document.body.style.overflow = '';
    };
    
    if (successBtn) {
        successBtn.onclick = () => {
            localStorage.removeItem('cart');
            updateCartCount();
            showToast('✅ Заказ оплачен! Спасибо за покупку!');
            closeModal();
        };
    }
    
    if (cancelBtn) cancelBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
}

// ОФОРМЛЕНИЕ ЗАКАЗА
function openCheckoutModal() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
        showToast('Корзина пуста');
        return;
    }
    
    // Закрываем сайдбар корзины
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const modalHtml = `
        <div id="checkoutModalWindow" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
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
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #eee">
                    <h3 style="margin:0">📋 Оформление заказа</h3>
                    <button id="closeCheckoutWindow" style="background:none;border:none;font-size:24px;cursor:pointer">&times;</button>
                </div>
                <div style="padding: 20px">
                    <div style="background: #f8fafc; border-radius: 16px; padding: 15px; margin-bottom: 20px">
                        <h4 style="margin:0 0 10px 0">Ваш заказ</h4>
                        ${cart.map(item => `
                            <div style="display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #eee">
                                <div style="width: 50px; height: 50px; background: #f0f0f0; border-radius: 10px; display: flex; align-items: center; justify-content: center">
                                    ${item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;border-radius:10px">` : '👕'}
                                </div>
                                <div style="flex:1">
                                    <div style="font-weight:600">${escapeHtml(item.title)}</div>
                                    <div style="font-size:12px;color:#666">${escapeHtml(item.size)} / ${escapeHtml(item.color)}</div>
                                </div>
                                <div>${item.quantity} шт</div>
                                <div style="font-weight:600;color:#00897b">${(item.price * item.quantity).toLocaleString()} ₽</div>
                            </div>
                        `).join('')}
                        <div style="display: flex; justify-content: space-between; padding-top: 15px; font-weight: 600">
                            <span>Товары:</span>
                            <span>${subtotal.toLocaleString()} ₽</span>
                        </div>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 15px">
                        <div style="display: flex; gap: 10px">
                            <input type="text" id="checkoutName" placeholder="Ваше имя *" style="flex:1; padding: 12px; border:1px solid #ddd; border-radius: 40px">
                            <input type="tel" id="checkoutPhone" placeholder="Телефон *" style="flex:1; padding: 12px; border:1px solid #ddd; border-radius: 40px">
                        </div>
                        <input type="email" id="checkoutEmail" placeholder="Email" style="padding: 12px; border:1px solid #ddd; border-radius: 40px">
                        
                        <select id="checkoutDelivery" style="padding: 12px; border:1px solid #ddd; border-radius: 40px">
                            <option value="courier" data-price="350">🚚 Курьерская доставка — 350 ₽</option>
                            <option value="pickup" data-price="0">📦 Самовывоз — Бесплатно</option>
                            <option value="express" data-price="990">⚡ Экспресс-доставка — 990 ₽</option>
                        </select>
                        
                        <input type="text" id="checkoutAddress" placeholder="Адрес доставки" style="padding: 12px; border:1px solid #ddd; border-radius: 40px">
                        
                        <textarea id="checkoutComment" rows="2" placeholder="Комментарий к заказу" style="padding: 12px; border:1px solid #ddd; border-radius: 20px"></textarea>
                        
                        <div id="checkoutTotalBlock" style="background: #f6faf7; border-radius: 16px; padding: 15px">
                            <div style="display: flex; justify-content: space-between"><span>Товары:</span><span>${subtotal.toLocaleString()} ₽</span></div>
                            <div style="display: flex; justify-content: space-between"><span>Доставка:</span><span id="deliveryCostSpan">350 ₽</span></div>
                            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 18px; border-top: 1px solid #ddd; margin-top: 10px; padding-top: 10px">
                                <span>Итого к оплате:</span>
                                <strong id="finalTotalSpan" style="color:#00897b">${(subtotal + 350).toLocaleString()} ₽</strong>
                            </div>
                        </div>
                        
                        <div>
                            <h4 style="margin:0 0 10px 0">Способ оплаты</h4>
                            <div style="display: flex; gap: 15px; flex-wrap: wrap">
                                <label style="display: flex; align-items: center; gap: 5px">
                                    <input type="radio" name="payment" value="card" checked> 💳 Картой
                                </label>
                                <label style="display: flex; align-items: center; gap: 5px">
                                    <input type="radio" name="payment" value="sbp"> 📱 СБП
                                </label>
                                <label style="display: flex; align-items: center; gap: 5px">
                                    <input type="radio" name="payment" value="cash"> 💰 Наличные
                                </label>
                            </div>
                        </div>
                        
                        <button id="submitCheckoutBtn" style="
                            background: linear-gradient(135deg, #00897b, #4db6ac);
                            color: white;
                            border: none;
                            padding: 15px;
                            border-radius: 40px;
                            font-weight: 600;
                            font-size: 16px;
                            cursor: pointer;
                        ">💳 Перейти к оплате</button>
                        
                        <div style="font-size: 11px; color: #999; text-align: center">Нажимая кнопку, вы соглашаетесь с политикой обработки данных</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    // Закрытие модального окна
    const closeBtn = document.getElementById('closeCheckoutWindow');
    const modalWindow = document.getElementById('checkoutModalWindow');
    if (closeBtn) closeBtn.onclick = () => { modalWindow.remove(); document.body.style.overflow = ''; };
    if (modalWindow) modalWindow.onclick = (e) => { if (e.target === modalWindow) { modalWindow.remove(); document.body.style.overflow = ''; } };
    
    // Обновление суммы при выборе доставки
    const deliverySelect = document.getElementById('checkoutDelivery');
    const deliveryCostSpan = document.getElementById('deliveryCostSpan');
    const finalTotalSpan = document.getElementById('finalTotalSpan');
    
    function updateTotal() {
        const selectedOption = deliverySelect.options[deliverySelect.selectedIndex];
        const deliveryPrice = parseInt(selectedOption.dataset.price);
        const total = subtotal + deliveryPrice;
        deliveryCostSpan.textContent = deliveryPrice === 0 ? 'Бесплатно' : deliveryPrice.toLocaleString() + ' ₽';
        finalTotalSpan.textContent = total.toLocaleString() + ' ₽';
    }
    deliverySelect.onchange = updateTotal;
    
    // Обработчик кнопки оплаты
    const submitBtn = document.getElementById('submitCheckoutBtn');
    submitBtn.onclick = () => {
        const name = document.getElementById('checkoutName').value.trim();
        const phone = document.getElementById('checkoutPhone').value.trim();
        
        if (!name || !phone) {
            showToast('❌ Пожалуйста, укажите имя и телефон');
            return;
        }
        
        const selectedDelivery = deliverySelect.options[deliverySelect.selectedIndex];
        const deliveryPrice = parseInt(selectedDelivery.dataset.price);
        const total = subtotal + deliveryPrice;
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'card';
        const address = document.getElementById('checkoutAddress')?.value.trim() || '';
        
        const orderData = {
            items: cart,
            subtotal: subtotal,
            total: total,
            customer: { name, phone },
            payment: paymentMethod,
            orderId: 'ORDER_' + Date.now()
        };
        
        console.log('Заказ:', orderData);
        console.log('Способ оплаты:', paymentMethod);
        
        // Закрываем окно оформления
        modalWindow.remove();
        document.body.style.overflow = '';
        
        // Проверяем способ оплаты
        if (paymentMethod === 'sbp') {
            console.log('✅ ВЫЗЫВАЕМ openSbpPayment');
            openSbpPayment(orderData);
        } else {
            showToast(`💳 Спасибо, ${name}! Сумма к оплате: ${total.toLocaleString()} ₽`);
            localStorage.removeItem('cart');
            updateCartCount();
        }
    };
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    const cartBtn = document.getElementById('cartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cartBtn) cartBtn.addEventListener('click', openCartSidebar);
    if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckoutModal);
    
    updateCartCount();
});

// Функции открытия/закрытия сайдбара корзины
function openCartSidebar() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartSidebar() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}
