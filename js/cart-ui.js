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
            updateQuantity(id, delta, size, color);
        };
    });
    
    document.querySelectorAll('.cart-remove-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const itemDiv = btn.closest('.cart-item');
            const id = parseInt(itemDiv.dataset.id);
            const size = itemDiv.dataset.size;
            const color = itemDiv.dataset.color;
            removeFromCart(id, size, color);
        };
    });
}

// Открыть сайдбар корзины
function openCartSidebar() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Закрыть сайдбар корзины
function closeCartSidebar() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}
