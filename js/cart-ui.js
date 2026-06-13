// ===== js/cart-ui.js - МОДАЛЬНАЯ КОРЗИНА =====

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    updateCartCount();
}

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

function updateCartCount() {
    const cart = getCart();
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
        total += cart[i].quantity;
    }
    const c = document.getElementById('cartCounter');
    if (c) c.textContent = total;
}

// Добавить товар с выбором размера и цвета
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
    showToast('✅ ' + product.title + ' (' + product.size + ', ' + product.color + ') добавлен в корзину');
}

// Добавить по ID - с выбором размера и цвета
function addToCartById(id, size = null, color = null, quantity = 1) {
    if (!window.allProducts || window.allProducts.length === 0) {
        showToast('Ошибка: каталог не загружен');
        return;
    }
    
    const product = window.allProducts.find(p => p.id === id);
    if (!product) {
        showToast('Товар не найден');
        return;
    }
    
    let selectedSize = size;
    let selectedColor = color;
    let selectedPrice = product.discount_price && product.discount_price < product.price ? product.discount_price : product.price;
    
    if (product.sizes_data && product.sizes_data.length > 0 && !selectedSize) {
        selectedSize = product.sizes_data[0].size;
        selectedColor = product.sizes_data[0].color || product.color || '—';
        if (product.sizes_data[0].price) selectedPrice = product.sizes_data[0].price;
    }
    
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
        selectedSize = product.sizes[0];
        selectedColor = product.color || '—';
    }
    
    if (!selectedSize) {
        selectedSize = '—';
        selectedColor = product.color || '—';
    }
    
    let image = null;
    if (product.images && product.images.length > 0) {
        image = product.images[0];
    }
    
    addToCart({
        id: product.id,
        title: product.title,
        price: selectedPrice,
        quantity: quantity,
        size: selectedSize,
        color: selectedColor,
        article: product.article || '—',
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
                    ${item.image ? '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '">' : '<span style="font-size:2rem;">👕</span>'}
                </div>
                <div class="cart-product-info">
                    <div class="cart-product-title">${escapeHtml(item.title)}</div>
                    <div class="cart-product-meta">
                        <span>📏 ${escapeHtml(item.size)}</span>
                        <span>🎨 ${escapeHtml(item.color)}</span>
                        ${item.article && item.article !== '—' ? '<span>📦 ' + escapeHtml(item.article) + '</span>' : ''}
                    </div>
                </div>
                <div class="cart-product-actions">
                    <button class="cart-qty-minus">−</button>
                    <span class="cart-product-quantity">${item.quantity}</span>
                    <button class="cart-qty-plus">+</button>
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

function openCart() {
    const overlay = document.getElementById('cartModalOverlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateCartDisplay();
    }
}

function closeCart() {
    const overlay = document.getElementById('cartModalOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    const cartBtn = document.getElementById('cartBtn');
    const closeBtn = document.getElementById('closeCartModal');
    const overlay = document.getElementById('cartModalOverlay');
    
    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (closeBtn) closeBtn.addEventListener('click', closeCart);
    if (overlay) overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeCart();
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
            closeCart();
        }
    });
    
    updateCartCount();
});
