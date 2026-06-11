// ===== js/cart-ui.js - ИНТЕРФЕЙС КОРЗИНЫ =====

function updateCartCount() {
    const count = getCartItemsCount();
    const counter = document.getElementById('cartCounter');
    if (counter) counter.textContent = count;
    updateCartDisplay();
}

function updateCartDisplay() {
    const cart = getCart();
    const container = document.getElementById('cartItems');
    const totalContainer = document.getElementById('cartTotal');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">Корзина пуста</div>';
        if (totalContainer) totalContainer.innerHTML = '';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div class="cart-item" data-id="${item.id}" data-size="${escapeHtml(item.size)}" data-color="${escapeHtml(item.color)}" style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #eee;">
                <div style="width:60px;height:60px;background:#f5f5f5;border-radius:12px;display:flex;align-items:center;justify-content:center;">
                    ${item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">` : '👕'}
                </div>
                <div style="flex:1;">
                    <div style="font-weight:600;">${escapeHtml(item.title)}</div>
                    <div style="font-size:12px;color:#666;">${escapeHtml(item.size)} / ${escapeHtml(item.color)}</div>
                    <div style="font-size:12px;color:#00897b;">${item.price.toLocaleString()} ₽</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <button class="qty-minus" style="width:30px;height:30px;border-radius:50%;border:1px solid #ddd;background:white;cursor:pointer;">−</button>
                    <span style="min-width:30px;text-align:center;">${item.quantity}</span>
                    <button class="qty-plus" style="width:30px;height:30px;border-radius:50%;border:1px solid #ddd;background:white;cursor:pointer;">+</button>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:700;color:#00897b;">${itemTotal.toLocaleString()} ₽</div>
                    <button class="remove-item" style="background:none;border:none;color:#e74c3c;cursor:pointer;">Удалить</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    if (totalContainer) {
        totalContainer.innerHTML = `<div style="display:flex;justify-content:space-between;font-weight:700;padding:15px 0;border-top:1px solid #eee;"><span>Итого:</span><strong style="color:#00897b;">${total.toLocaleString()} ₽</strong></div>`;
    }
    
    document.querySelectorAll('.cart-item').forEach(el => {
        const id = parseInt(el.dataset.id);
        const size = el.dataset.size;
        const color = el.dataset.color;
        el.querySelector('.qty-minus')?.addEventListener('click', () => updateCartItemQuantity(id, size, color, -1));
        el.querySelector('.qty-plus')?.addEventListener('click', () => updateCartItemQuantity(id, size, color, 1));
        el.querySelector('.remove-item')?.addEventListener('click', () => removeCartItem(id, size, color));
    });
}

function openCartSidebar() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartSidebar() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}
