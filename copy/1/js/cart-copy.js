// ===== ПОЛНОСТЬЮ РАБОТАЮЩАЯ КОРЗИНА С СОХРАНЕНИЕМ ЗАКАЗА =====

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
            opacity: 0; transition: 0.3s; pointer-events: none; white-space: nowrap;
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
        container.innerHTML = '<div class="empty-cart" style="text-align:center;padding:40px;color:#999;">Корзина пуста</div>';
        if (totalContainer) totalContainer.innerHTML = '';
        return;
    }
    
    let html = '';
    let totalSum = 0;
    cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        totalSum += itemTotal;
        html += `
            <div class="cart-item" data-id="${item.id}" data-size="${escapeHtml(item.size)}" data-color="${escapeHtml(item.color)}" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #eee;">
                <div class="cart-item-image" style="flex-shrink:0;">
                    ${item.image ? `<img src="${item.image}" style="width:50px;height:50px;object-fit:cover;border-radius:10px;">` : '<div style="width:50px;height:50px;background:#f0f0f0;border-radius:10px;display:flex;align-items:center;justify-content:center;">👕</div>'}
                </div>
                <div class="cart-item-info" style="flex:1;">
                    <div style="font-weight:600;margin-bottom:4px;">${escapeHtml(item.title)}</div>
                    <div style="font-size:12px;color:#666;">${escapeHtml(item.size)} / ${escapeHtml(item.color)}</div>
                </div>
                <div class="cart-item-quantity-cell" style="display:flex;align-items:center;gap:8px;">
                    <button class="cart-qty-btn" data-delta="-1" style="width:28px;height:28px;border-radius:50%;border:1px solid #ddd;background:white;cursor:pointer;">−</button>
                    <span style="min-width:20px;text-align:center;">${item.quantity}</span>
                    <button class="cart-qty-btn" data-delta="1" style="width:28px;height:28px;border-radius:50%;border:1px solid #ddd;background:white;cursor:pointer;">+</button>
                </div>
                <div class="cart-item-price-cell" style="min-width:90px;text-align:right;">
                    <div style="font-weight:600;color:#00897b;">${itemTotal.toLocaleString()} ₽</div>
                    <button class="cart-remove-btn" style="background:none;border:none;cursor:pointer;color:#999;font-size:12px;">🗑️ Удалить</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    if (totalContainer) {
        totalContainer.innerHTML = `<div style="display:flex;justify-content:space-between;font-weight:700;margin-top:15px;padding-top:15px;border-top:1px solid #eee;"><span>Итого:</span><strong style="color:#00897b;">${totalSum.toLocaleString()} ₽</strong></div>`;
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
            showToast('Товар удалён из корзины');
        };
    });
}

// Добавление в корзину по ID
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

// Добавление в корзину с деталями
function addToCartWithDetails(id, title, price, size, color, article, image) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex(item => item.id === id && item.size === size && item.color === color);
    
    if (existingIndex !== -1) {
        cart[existingIndex].quantity++;
    } else {
        cart.push({
            id: id,
            title: title,
            price: price,
            quantity: 1,
            size: size || '—',
            color: color || '—',
            image: image || null
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`✅ ${title} (${size}, ${color}) добавлен в корзину`);
}

// ===== ОПЛАТА ЧЕРЕЗ СБП (с сохранением корзины до подтверждения) =====
function openSbpPayment(orderData) {
    console.log('🔥 Открываем оплату СБП', orderData);
    
    // Сохраняем заказ перед открытием окна оплаты
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
                    <div style="font-weight: 500;">Заказ №${orderData.orderId || 'ORDER_' + Date.now()}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 10px;">
                        ${orderData.customer?.name ? `Покупатель: ${escapeHtml(orderData.customer.name)}<br>` : ''}
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
                    Оплата через Систему Быстрых Платежей (СБП). Комиссия не взимается.
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
    
    // Успешная оплата - ТОЛЬКО ЗДЕСЬ очищаем корзину
    if (successBtn) {
        successBtn.onclick = () => {
            localStorage.removeItem('cart');
            localStorage.removeItem('pendingOrder');
            updateCartCount();
            showToast('✅ Заказ успешно оплачен! Спасибо за покупку!');
            closeModal();
            
            // Опционально: показать сообщение об успехе или перенаправить
            setTimeout(() => {
                showToast('🎉 Скоро мы свяжемся с вами для подтверждения заказа');
            }, 500);
        };
    }
    
    // Отмена - корзина остаётся, заказ сохраняется
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            showToast('❌ Оплата отменена. Вы можете продолжить покупки');
            closeModal();
        };
    }
    
    // Вернуться к заказу - открываем форму оформления заново
    if (backBtn) {
        backBtn.onclick = () => {
            closeModal();
            setTimeout(() => {
                openCheckoutModal();
            }, 100);
        };
    }
    
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
}

// ===== ВОССТАНОВЛЕНИЕ НЕЗАВЕРШЁННОГО ЗАКАЗА =====
function restorePendingOrder() {
    const pending = localStorage.getItem('pendingOrder');
    if (pending) {
        const orderData = JSON.parse(pending);
        if (confirm(`У вас есть незавершённый заказ на сумму ${orderData.total.toLocaleString()} ₽.\nПродолжить оформление?`)) {
            openCheckoutModal();
            return true;
        } else {
            // Если клиент отказался, удаляем сохранённый заказ
            localStorage.removeItem('pendingOrder');
        }
    }
    return false;
}

// ===== ОФОРМЛЕНИЕ ЗАКАЗА =====
function openCheckoutModal() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
        // Проверяем, может есть незавершённый заказ
        if (!restorePendingOrder()) {
            showToast('Корзина пуста');
        }
        return;
    }
    
    // Закрываем сайдбар корзины
    closeCartSidebar();
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const modalHtml = `
        <div id="checkoutModalWindow" style="
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
            z-index: 99999;
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
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #eee; position: sticky; top: 0; background: white; z-index: 10;">
                    <h3 style="margin:0;">📋 Оформление заказа</h3>
                    <button id="closeCheckoutWindow" style="background:none;border:none;font-size:24px;cursor:pointer;color:#999;">&times;</button>
                </div>
                <div style="padding: 20px;">
                    <!-- Список товаров -->
                    <div style="background: #f8fafc; border-radius: 16px; padding: 15px; margin-bottom: 20px;">
                        <h4 style="margin:0 0 10px 0; font-size:14px;">Ваш заказ</h4>
                        ${cart.map(item => `
                            <div style="display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #e2edf4;">
                                <div style="width: 50px; height: 50px; background: #f4f9fe; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink:0;">
                                    ${item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">` : '👕'}
                                </div>
                                <div style="flex:1;">
                                    <div style="font-weight:600; font-size:14px;">${escapeHtml(item.title)}</div>
                                    <div style="font-size:12px; color:#64748b;">${escapeHtml(item.size)} / ${escapeHtml(item.color)}</div>
                                </div>
                                <div style="font-size:14px; color:#5e7f97;">${item.quantity} шт</div>
                                <div style="font-weight:600; color:#00897b; font-size:14px;">${(item.price * item.quantity).toLocaleString()} ₽</div>
                            </div>
                        `).join('')}
                        <div style="display: flex; justify-content: space-between; padding-top: 15px; font-weight: 600; border-top: 1px solid #e2edf4; margin-top: 10px;">
                            <span>Товары:</span>
                            <span>${subtotal.toLocaleString()} ₽</span>
                        </div>
                    </div>
                    
                    <!-- Форма -->
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <div style="display: flex; gap: 10px;">
                            <input type="text" id="checkoutName" placeholder="Ваше имя *" style="flex:1; padding: 12px 16px; border:1px solid #cbdde9; border-radius: 40px; font-size:14px;">
                            <input type="tel" id="checkoutPhone" placeholder="Телефон *" style="flex:1; padding: 12px 16px; border:1px solid #cbdde9; border-radius: 40px; font-size:14px;">
                        </div>
                        
                        <input type="email" id="checkoutEmail" placeholder="Email (необязательно)" style="padding: 12px 16px; border:1px solid #cbdde9; border-radius: 40px; font-size:14px;">
                        
                        <select id="checkoutDelivery" style="padding: 12px 16px; border:1px solid #cbdde9; border-radius: 40px; font-size:14px; background:white;">
                            <option value="courier" data-price="350">🚚 Курьерская доставка — 350 ₽</option>
                            <option value="pickup" data-price="0">📦 Самовывоз — Бесплатно</option>
                            <option value="express" data-price="990">⚡ Экспресс-доставка — 990 ₽</option>
                        </select>
                        
                        <input type="text" id="checkoutAddress" placeholder="Адрес доставки (для курьера)" style="padding: 12px 16px; border:1px solid #cbdde9; border-radius: 40px; font-size:14px;">
                        
                        <textarea id="checkoutComment" rows="2" placeholder="Комментарий к заказу" style="padding: 12px 16px; border:1px solid #cbdde9; border-radius: 20px; font-size:14px; resize:vertical;"></textarea>
                        
                        <!-- Итого -->
                        <div style="background: #f6faf7; border-radius: 16px; padding: 15px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>Товары:</span>
                                <span>${subtotal.toLocaleString()} ₽</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>Доставка:</span>
                                <span id="deliveryCostSpan">350 ₽</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 18px; border-top: 1px solid #e2edf4; margin-top: 10px; padding-top: 12px;">
                                <span>Итого к оплате:</span>
                                <strong id="finalTotalSpan" style="color:#00897b;">${(subtotal + 350).toLocaleString()} ₽</strong>
                            </div>
                        </div>
                        
                        <!-- Способы оплаты -->
                        <div>
                            <h4 style="margin:0 0 10px 0; font-size:14px;">Способ оплаты</h4>
                            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                                <label style="display: flex; align-items: center; gap: 8px; cursor:pointer;">
                                    <input type="radio" name="payment" value="card" checked> 💳 Банковской картой
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; cursor:pointer;">
                                    <input type="radio" name="payment" value="sbp"> 📱 СБП (по номеру телефона)
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; cursor:pointer;">
                                    <input type="radio" name="payment" value="cash"> 💰 Наличными при получении
                                </label>
                            </div>
                        </div>
                        
                        <button id="submitCheckoutBtn" style="
                            background: linear-gradient(135deg, #00897b, #4db6ac);
                            color: white;
                            border: none;
                            padding: 14px;
                            border-radius: 40px;
                            font-weight: 600;
                            font-size: 16px;
                            cursor: pointer;
                            transition: 0.2s;
                        " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 14px rgba(0,137,123,0.25)'" 
                           onmouseout="this.style.transform='';this.style.boxShadow=''">💳 Перейти к оплате</button>
                        
                        <div style="font-size: 11px; color: #94a3b8; text-align: center;">Нажимая кнопку, вы соглашаетесь с политикой обработки данных</div>
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
        const addressInput = document.getElementById('checkoutAddress');
        if (deliverySelect.value === 'courier') {
            addressInput.style.display = 'block';
            addressInput.required = true;
        } else {
            addressInput.style.display = 'none';
            addressInput.required = false;
        }
        deliveryCostSpan.textContent = deliveryPrice === 0 ? 'Бесплатно' : deliveryPrice.toLocaleString() + ' ₽';
        finalTotalSpan.textContent = total.toLocaleString() + ' ₽';
    }
    deliverySelect.onchange = updateTotal;
    updateTotal();
    
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
        const email = document.getElementById('checkoutEmail')?.value.trim() || '';
        const comment = document.getElementById('checkoutComment')?.value.trim() || '';
        
        const orderData = {
            items: cart,
            subtotal: subtotal,
            delivery: { method: deliverySelect.value, price: deliveryPrice },
            address: address,
            total: total,
            customer: { name: name, phone: phone, email: email },
            payment: paymentMethod,
            comment: comment,
            orderId: 'ORDER_' + Date.now(),
            date: new Date().toLocaleString()
        };
        
        console.log('📦 ЗАКАЗ:', orderData);
        
        // Закрываем окно оформления
        modalWindow.remove();
        document.body.style.overflow = '';
        
        // Проверяем способ оплаты
        if (paymentMethod === 'sbp') {
            // Для СБП - открываем окно оплаты, корзину НЕ очищаем
            openSbpPayment(orderData);
        } else {
            // Для карты и наличных - показываем сообщение и очищаем корзину
            showToast(`💳 Спасибо, ${name}! Сумма к оплате: ${total.toLocaleString()} ₽`);
            showToast('📞 Наш менеджер свяжется с вами в ближайшее время');
            localStorage.removeItem('cart');
            localStorage.removeItem('pendingOrder');
            updateCartCount();
        }
    };
}

// ===== УПРАВЛЕНИЕ КОРЗИНОЙ (САЙДБАР) =====
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

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const overlay = document.getElementById('overlay');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cartBtn) cartBtn.addEventListener('click', openCartSidebar);
    if (closeCart) closeCart.addEventListener('click', closeCartSidebar);
    if (overlay) overlay.addEventListener('click', closeCartSidebar);
    if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckoutModal);
    
    updateCartCount();
    
    // Проверяем незавершённый заказ
    restorePendingOrder();
});

// Закрытие по ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const sidebar = document.getElementById('cartSidebar');
        if (sidebar && sidebar.classList.contains('open')) closeCartSidebar();
        const modal = document.getElementById('checkoutModalWindow');
        if (modal) modal.remove();
        const paymentModal = document.getElementById('sbpPaymentModal');
        if (paymentModal) paymentModal.remove();
        document.body.style.overflow = '';
    }
});

// Анимация для модальных окон
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
