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
    const total = getCart().reduce((s, i) => s + i.quantity, 0);
    const c = document.getElementById('cartCounter');
    if (c) c.textContent = total;
}

// Добавить товар (прямой вызов)
function addToCart(product) {
    const cart = getCart();
    const existing = cart.findIndex(i => i.id === product.id && i.size === product.size && i.color === product.color);
    if (existing !== -1) {
        cart[existing].quantity += product.quantity || 1;
    } else {
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
    showToast(`✅ ${product.title} добавлен`);
}

// Добавить товар по ID (для кнопок в каталоге)
function addToCartById(id) {
    // Ищем товар в глобальном массиве allProducts
    if (!window.allProducts || window.allProducts.length === 0) {
        console.error('Каталог не загружен');
        showToast('Ошибка: каталог не загружен');
        return;
    }
    
    const product = window.allProducts.find(p => p.id === id);
    if (!product) {
        showToast('Товар не найден');
        return;
    }
    
    const price = product.discount_price && product.discount_price < product.price ? product.discount_price : product.price;
    const image = product.images && product.images.length > 0 ? product.images[0] : null;
    
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
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div class="cart-item" data-id="${item.id}" data-size="${item.size}" data-color="${item.color}" style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #eee;">
                <div style="width:60px;height:60px;background:#f5f5f5;border-radius:12px;display:flex;align-items:center;justify-content:center;">
                    ${item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">` : '👕'}
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
    });
    container.innerHTML = html;
    if (totalDiv) {
        totalDiv.innerHTML = `<div style="display:flex;justify-content:space-between;font-weight:700;padding:15px 0;border-top:1px solid #eee;"><span>Итого:</span><strong style="color:#00897b;">${total.toLocaleString()} ₽</strong></div>`;
    }

    document.querySelectorAll('.cart-item').forEach(el => {
        const id = parseInt(el.dataset.id);
        const size = el.dataset.size;
        const color = el.dataset.color;
        
        el.querySelector('.qty-minus')?.addEventListener('click', () => {
            let cart = getCart();
            const i = cart.findIndex(x => x.id === id && x.size === size && x.color === color);
            if (i !== -1) {
                cart[i].quantity--;
                if (cart[i].quantity <= 0) cart.splice(i, 1);
                saveCart(cart);
            }
        });
        
        el.querySelector('.qty-plus')?.addEventListener('click', () => {
            let cart = getCart();
            const i = cart.findIndex(x => x.id === id && x.size === size && x.color === color);
            if (i !== -1) {
                cart[i].quantity++;
                saveCart(cart);
            }
        });
        
        el.querySelector('.remove-item')?.addEventListener('click', () => {
            let cart = getCart();
            saveCart(cart.filter(x => !(x.id === id && x.size === size && x.color === color)));
            showToast('Товар удалён');
        });
    });
}

// Открыть корзину
function openCart() {
    document.getElementById('cartSidebar')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Закрыть корзину
function closeCart() {
    document.getElementById('cartSidebar')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('active');
    document.body.style.overflow = '';
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    const cartBtn = document.getElementById('cartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const overlay = document.getElementById('cartOverlay');
    const checkoutBtn = document.getElementById('cartCheckoutBtn');
    
    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (overlay) overlay.addEventListener('click', closeCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
        if (typeof openCheckout === 'function') openCheckout();
    });
    
    updateCartCount();
});
