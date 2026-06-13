// Отобразить корзину
function updateCartDisplay() {
    const cart = getCart();
    const container = document.getElementById('cartItems');
    const totalDiv = document.getElementById('cartTotal');
    
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <p>Корзина пуста</p>
                <p style="font-size:0.8rem; margin-top:0.5rem;">Добавьте товары из каталога</p>
            </div>
        `;
        if (totalDiv) totalDiv.innerHTML = '';
        return;
    }

    let html = '';
    let total = 0;
    
    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-product" data-id="${item.id}" data-size="${escapeHtml(item.size)}" data-color="${escapeHtml(item.color)}">
                <div class="cart-product-image">
                    ${item.image ? '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '">' : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;">👕</div>'}
                </div>
                <div class="cart-product-info">
                    <div class="cart-product-title">${escapeHtml(item.title)}</div>
                    <div class="cart-product-details">
                        <span class="cart-product-detail">📏 ${escapeHtml(item.size)}</span>
                        <span class="cart-product-detail">🎨 ${escapeHtml(item.color)}</span>
                        ${item.article && item.article !== '—' ? '<span class="cart-product-detail">📦 Арт: ' + escapeHtml(item.article) + '</span>' : ''}
                    </div>
                </div>
                <div class="cart-product-actions">
                    <button class="cart-qty-btn cart-qty-minus">−</button>
                    <span class="cart-product-quantity">${item.quantity}</span>
                    <button class="cart-qty-btn cart-qty-plus">+</button>
                </div>
                <div class="cart-product-total">${itemTotal.toLocaleString()} ₽</div>
                <button class="cart-remove-btn" title="Удалить">🗑️</button>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    if (totalDiv) {
        totalDiv.innerHTML = `
            <div class="cart-total-row">
                <span>Итого:</span>
                <strong>${total.toLocaleString()} ₽</strong>
            </div>
            <button id="cartCheckoutBtn" class="cart-checkout-btn">✅ Оформить заказ</button>
        `;
        
        const checkoutBtn = document.getElementById('cartCheckoutBtn');
        if (checkoutBtn) {
            checkoutBtn.onclick = function(e) {
                e.preventDefault();
                if (typeof openCheckout === 'function') {
                    closeCart();
                    openCheckout();
                } else {
                    showToast('Модуль оформления не загружен');
                }
            };
        }
    }

    const cartProducts = document.querySelectorAll('.cart-product');
    for (let i = 0; i < cartProducts.length; i++) {
        const el = cartProducts[i];
        const id = parseInt(el.getAttribute('data-id'));
        const size = el.getAttribute('data-size');
        const color = el.getAttribute('data-color');
        
        const minusBtn = el.querySelector('.cart-qty-minus');
        const plusBtn = el.querySelector('.cart-qty-plus');
        const removeBtn = el.querySelector('.cart-remove-btn');
        
        if (minusBtn) {
            minusBtn.onclick = function(e) {
                e.stopPropagation();
                let cart = getCart();
                let index = -1;
                for (let j = 0; j < cart.length; j++) {
                    if (cart[j].id === id && cart[j].size === size && cart[j].color === color) {
                        index = j;
                        break;
                    }
                }
                if (index !== -1) {
                    cart[index].quantity--;
                    if (cart[index].quantity <= 0) {
                        cart.splice(index, 1);
                    }
                    saveCart(cart);
                }
            };
        }
        
        if (plusBtn) {
            plusBtn.onclick = function(e) {
                e.stopPropagation();
                let cart = getCart();
                let index = -1;
                for (let j = 0; j < cart.length; j++) {
                    if (cart[j].id === id && cart[j].size === size && cart[j].color === color) {
                        index = j;
                        break;
                    }
                }
                if (index !== -1) {
                    cart[index].quantity++;
                    saveCart(cart);
                }
            };
        }
        
        if (removeBtn) {
            removeBtn.onclick = function(e) {
                e.stopPropagation();
                let cart = getCart();
                let newCart = [];
                for (let j = 0; j < cart.length; j++) {
                    if (!(cart[j].id === id && cart[j].size === size && cart[j].color === color)) {
                        newCart.push(cart[j]);
                    }
                }
                saveCart(newCart);
                showToast('Товар удалён из корзины');
            };
        }
    }
}
