// ===== js/cart-ui.js - КОРЗИНА =====

// Получить корзину
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

// Сохранить корзину
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    updateCartCount();
}

// Показать уведомление
function showToast(msg) {
    let t = document.getElementById('cartToast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'cartToast';
        t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1a2c3e;color:white;padding:12px 24px;border-radius:40px;z-index:100000;font-size:14px;opacity:0;transition:0.3s';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    setTimeout(() => t.style.opacity = '0', 3000);
}

// Обновить счётчик
function updateCartCount() {
    const cart = getCart();
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
        total += cart[i].quantity;
    }
    const c = document.getElementById('cartCounter');
    if (c) c.textContent = total;
}

// Добавить товар
function addToCart(product) {
    const cart = getCart();
    let found = false;
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === product.id && cart[i].size === product.size && cart[i].color === product.color) {
            cart[i].quantity += (product.quantity || 1);
            found = true;
            break;
        }
    }
    if (!found) {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: product.quantity || 1,
            size: product.size || '—',
            color: product.color || '—',
            image: product.image || null
        });
    }
    saveCart(cart);
    showToast('✅ ' + product.title + ' добавлен');
}

// Добавить по ID
function addToCartById(id) {
    if (!window.allProducts || window.allProducts.length === 0) {
        showToast('Ошибка: каталог не загружен');
        return;
    }
    let product = null;
    for (let i = 0; i < window.allProducts.length; i++) {
        if (window.allProducts[i].id === id) {
            product = window.allProducts[i];
            break;
        }
    }
    if (!product) {
        showToast('Товар не найден');
        return;
    }
    let price = product.price;
    if (product.discount_price && product.discount_price < product.price) {
        price = product.discount_price;
    }
    let image = null;
    if (product.images && product.images.length > 0) {
        image = product.images[0];
    }
    addToCart({
        id: product.id,
        title: product.title,
        price: price,
        quantity: 1,
        size: '—',
        color: '—',
        image: image
    });
}

// Отобразить корзину
function updateCartDisplay() {
    const cart = getCart();
    const container = document.getElementById('cartItems');
    const totalDiv = document.getElementById('cartTotal');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">Корзина пуста</div>';
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
            <div class="cart-item" data-id="${item.id}" data-size="${item.size}" data-color="${item.color}" style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #eee;">
                <div style="width:60px;height:60px;background:#f5f5f5;border-radius:12px;display:flex;align-items:center;justify-content:center;">
                    ${item.image ? '<img src="' + item.image + '" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">' : '👕'}
                </div>
                <div style="flex:1;">
                    <div style="font-weight:600;">${item.title}</div>
                    <div style="font-size:12px;color:#666;">${item.size} / ${item.color}</div>
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
    }
    container.innerHTML = html;
    if (totalDiv) {
        totalDiv.innerHTML = '<div style="display:flex;justify-content:space-between;font-weight:700;padding:15px 0;border-top:1px solid #eee;"><span>Итого:</span><strong style="color:#00897b;">' + total.toLocaleString() + ' ₽</strong></div>';
    }

    const cartItems = document.querySelectorAll('.cart-item');
    for (let i = 0; i < cartItems.length; i++) {
        const el = cartItems[i];
        const id = parseInt(el.getAttribute('data-id'));
        const size = el.getAttribute('data-size');
        const color = el.getAttribute('data-color');
        
        const minusBtn = el.querySelector('.qty-minus');
        const plusBtn = el.querySelector('.qty-plus');
        const removeBtn = el.querySelector('.remove-item');
        
        if (minusBtn) {
            minusBtn.onclick = function() {
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
            plusBtn.onclick = function() {
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
            removeBtn.onclick = function() {
                let cart = getCart();
                let newCart = [];
                for (let j = 0; j < cart.length; j++) {
                    if (!(cart[j].id === id && cart[j].size === size && cart[j].color === color)) {
                        newCart.push(cart[j]);
                    }
                }
                saveCart(newCart);
                showToast('Товар удалён');
            };
        }
    }
}

// Открыть корзину
function openCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Закрыть корзину
function closeCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    const cartBtn = document.getElementById('cartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const overlay = document.getElementById('cartOverlay');
    const checkoutBtn = document.getElementById('cartCheckoutBtn');
    
    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (overlay) overlay.addEventListener('click', closeCart);
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (typeof openCheckout === 'function') openCheckout();
        });
    }
    
    updateCartCount();
});
