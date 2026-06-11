// ===== js/cart-checkout.js - ОФОРМЛЕНИЕ ЗАКАЗА =====

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
                    ${cart.map(i => `<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #e2edf4;"><div style="width:50px;height:50px;background:#f0f0f0;border-radius:10px;display:flex;align-items:center;justify-content:center;">${i.image ? `<img src="${i.image}" style="width:100%;height:100%;object-fit:cover;">` : '👕'}</div><div style="flex:1;"><div style="font-weight:600;">${i.title}</div><div style="font-size:12px;color:#666;">${i.size} / ${i.color}</div></div><div>${i.quantity} шт</div><div style="font-weight:600;color:#00897b;">${(i.price * i.quantity).toLocaleString()} ₽</div></div>`).join('')}
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
                    
                    <div><h4 style="margin:0 0 10px 0;">Способ оплаты</h4><div style="display:flex;gap:20px;"><label><input type="radio" name="payment" value="card" checked> 💳 Картой</label><label><input type="radio" name="payment" value="sbp"> 📱 СБП</label><label><input type="radio" name="payment" value="cash"> 💰 Наличными</label></div></div>
                    
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
