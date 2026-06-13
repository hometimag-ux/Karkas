// ===== js/cart-ui.js - МОДАЛЬНАЯ КОРЗИНА =====

// Экранирование HTML
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Получить корзину
function getCart() {
    const cart = localStorage.getItem('cart');
    if (cart) {
        return JSON.parse(cart);
    }
    return [];
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
    setTimeout(function() { t.style.opacity = '0'; }, 3000);
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

// Получить полные данные товара из CRM
function getFullProductData(productId, size, color) {
    if (!window.allProducts || window.allProducts.length === 0) {
        return null;
    }
    const product = window.allProducts.find(p => p.id === productId);
    if (!product) return null;
    
    // Находим конкретный размер и цвет для получения артикула
    let article = product.article || '—';
    let actualSize = size;
    let actualColor = color;
    
    // Если в продукте есть detailed sizes
    if (product.sizes_data && product.sizes_data.length > 0) {
        const sizeData = product.sizes_data.find(s => s.size === size);
        if (sizeData) {
            if (sizeData.article) article = sizeData.article;
            if (sizeData.color) actualColor = sizeData.color;
        }
    }
    
    return {
        id: product.id,
        title: product.title,
        price: product.discount_price && product.discount_price < product.price ? product.discount_price : product.price,
        article: article,
        size: actualSize,
        color: actualColor,
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        brand: product.brand || ''
    };
}

// Добавить товар с полными данными
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
            article: product.article || '—',
            image: product.image || null
        });
    }
    
    saveCart(cart);
    showToast('✅ ' + product.title + ' добавлен в корзину');
}

// Добавить по ID (с полными данными из CRM)
function addToCartById(id, size = '—', color = '—', quantity = 1) {
    if (!window.allProducts || window.allProducts.length === 0) {
        showToast('Ошибка: каталог не загружен');
        return;
    }
    
    const product = window.allProducts.find(p => p.id === id);
    if (!product) {
        showToast('Товар не найден');
        return;
    }
    
    let price = product.discount_price && product.discount_price < product.price ? product.discount_price : product.price;
    let image = product.images && product.images.length > 0 ? product.images[0] : null;
    let article = product.article || '—';
    
    // Если переданы конкретные размер и цвет - ищем артикул
    if (size !== '—' && product.sizes_data) {
        const sizeData = product.sizes_data.find(s => s.size === size);
        if (sizeData && sizeData.article) article = sizeData.article;
    }
    
    addToCart({
        id: product.id,
        title: product.title,
        price: price,
        quantity: quantity,
        size: size,
        color: color,
        article: article,
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
                    <div class="cart-product-price">${Number(item.price).toLocaleString()} ₽ / шт</div>
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
        
        // Навешиваем обработчик на кнопку оформления
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

    // Навешиваем обработчики на кнопки товаров
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

// Открыть модальную корзину
function openCart() {
    const overlay = document.getElementById('cartModalOverlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateCartDisplay();
    }
}

// Закрыть модальную корзину
function closeCart() {
    const overlay = document.getElementById('cartModalOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Инициализация модальной корзины');
    
    // Кнопка открытия корзины
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', openCart);
    }
    
    // Кнопка закрытия
    const closeBtn = document.getElementById('closeCartModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCart);
    }
    
    // Закрытие по клику на оверлей
    const overlay = document.getElementById('cartModalOverlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeCart();
        });
    }
    
    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
            closeCart();
        }
    });
    
    // Обновляем счётчик и отображение
    updateCartCount();
});
