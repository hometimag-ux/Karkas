// ===== js/cart-ui.js - ИНТЕРФЕЙС КОРЗИНЫ =====

// Обновление счётчика и отображения
function updateCartCount() {
    const total = getCartItemsCount();
    const counter = document.getElementById('cartCounter');
    if (counter) counter.textContent = total;
    updateCartDisplay();
}

// Обновление отображения корзины в сайдбаре
function updateCartDisplay() {
    const cart = getCart();
    const container = document.getElementById('cartItems');
    const totalContainer = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('cartCheckoutBtn');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:60px 20px;color:#999;">
                <div style="font-size:48px;margin-bottom:16px;">🛒</div>
                <div>Корзина пуста</div>
                <div style="font-size:12px;margin-top:8px;">Добавьте товары из каталога</div>
            </div>
        `;
        if (totalContainer) totalContainer.innerHTML = '';
        if (checkoutBtn) checkoutBtn.style.opacity = '0.5';
        return;
    }
    
    if (checkoutBtn) checkoutBtn.style.opacity = '1';
    
    let html = '';
    let totalSum = 0;
    
    cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        totalSum += itemTotal;
        
        html += `
            <div class="cart-item" data-id="${item.id}" data-size="${escapeHtml(item.size)}" data-color="${escapeHtml(item.color)}" style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 0;
                border-bottom: 1px solid #eee;
            ">
                <div style="flex-shrink:0; width: 60px; height: 60px; background: #f5f5f5; border-radius: 12px; overflow: hidden;">
                    ${item.image 
                        ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;">` 
                        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:24px;">👕</div>`
                    }
                </div>
                <div style="flex:1;">
                    <div style="font-weight:600; margin-bottom:4px;">${escapeHtml(item.title)}</div>
                    <div style="font-size:12px; color:#666;">${escapeHtml(item.size)} / ${escapeHtml(item.color)}</div>
                    <div style="font-size:12px; color:#00897b; font-weight:500; margin-top:4px;">${item.price.toLocaleString()} ₽</div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <button class="cart-qty-minus" style="
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        border: 1px solid #ddd;
                        background: white;
                        cursor: pointer;
                        font-size: 18px;
                    ">−</button>
                    <span style="min-width: 30px; text-align: center; font-weight:500;">${item.quantity}</span>
                    <button class="cart-qty-plus" style="
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        border: 1px solid #ddd;
                        background: white;
                        cursor: pointer;
                        font-size: 18px;
                    ">+</button>
                </div>
                <div style="text-align: right; min-width: 80px;">
                    <div style="font-weight:700; color:#00897b;">${itemTotal.toLocaleString()} ₽</div>
                    <button class="cart-remove" style="
                        background: none;
                        border: none;
                        color: #e74c3c;
                        cursor: pointer;
                        font-size: 12px;
                        margin-top: 4px;
                    ">Удалить</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    if (totalContainer) {
        totalContainer.innerHTML = `
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: 700;
                font-size: 18px;
                padding: 15px 0;
                border-top: 1px solid #eee;
            ">
                <span>Итого:</span>
                <strong style="color:#00897b;">${totalSum.toLocaleString()} ₽</strong>
            </div>
        `;
    }
    
    // Навешиваем обработчики
    document.querySelectorAll('.cart-item').forEach(itemDiv => {
        const id = parseInt(itemDiv.dataset.id);
        const size = itemDiv.dataset.size;
        const color = itemDiv.dataset.color;
        
        const minusBtn = itemDiv.querySelector('.cart-qty-minus');
        const plusBtn = itemDiv.querySelector('.cart-qty-plus');
        const removeBtn = itemDiv.querySelector('.cart-remove');
        
        if (minusBtn) {
            minusBtn.onclick = () => updateCartItemQuantity(id, size, color, -1);
        }
        if (plusBtn) {
            plusBtn.onclick = () => updateCartItemQuantity(id, size, color, 1);
        }
        if (removeBtn) {
            removeBtn.onclick = () => removeCartItem(id, size, color);
        }
    });
}

// Открыть сайдбар корзины
function openCartSidebar() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) {
        sidebar.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    if (overlay) overlay.classList.add('active');
}

// Закрыть сайдбар корзины
function closeCartSidebar() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) {
        sidebar.classList.remove('open');
        document.body.style.overflow = '';
    }
    if (overlay) overlay.classList.remove('active');
}
