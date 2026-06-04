// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let allProducts = [];
let categories = [];
let currentCategory = 'all';
let currentSearch = '';

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function getRandomRating() {
    return (3 + Math.random() * 2).toFixed(1);
}

function renderStars(rating) {
    let stars = '';
    for (let i = 0; i < Math.floor(rating); i++) stars += '<span class="star filled">★</span>';
    if (rating % 1 >= 0.5) stars += '<span class="star filled">½</span>';
    for (let i = 0; i < 5 - Math.ceil(rating); i++) stars += '<span class="star">★</span>';
    return stars;
}

// ===== ЗАГРУЗКА ТОВАРОВ =====
function loadProductsFromCRM() {
    console.log('loadProductsFromCRM вызвана');
    const saved = localStorage.getItem('crm_data');
    
    if (!saved) {
        console.log('Нет данных в localStorage');
        allProducts = [];
        categories = [];
        renderProducts();
        return;
    }
    
    try {
        const data = JSON.parse(saved);
        allProducts = data.products || [];
        categories = data.categories || [];
        console.log('Загружено товаров:', allProducts.length);
    } catch(e) {
        console.error('Ошибка загрузки товаров', e);
    }
    
    renderFilters();
    renderProducts();
}

function getFilteredProducts() {
    let filtered = [...allProducts];
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category_id == currentCategory);
    }
    if (currentSearch) {
        filtered = filtered.filter(p => p.title.toLowerCase().includes(currentSearch.toLowerCase()));
    }
    return filtered;
}

// ===== ФИЛЬТРЫ =====
function renderFilters() {
    const container = document.getElementById('filterCategories');
    if (!container) return;
    
    if (categories.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<button class="filter-btn active" data-cat="all">Все</button>';
    categories.forEach(cat => {
        html += `<button class="filter-btn" data-cat="${cat.id}">${escapeHtml(cat.title)}</button>`;
    });
    container.innerHTML = html;
    
    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.cat;
            renderProducts();
        });
    });
    
    const searchInput = document.getElementById('catalogSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            renderProducts();
        });
    }
}

// ===== ОТРИСОВКА ТОВАРОВ =====
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    if (allProducts.length === 0) {
        grid.innerHTML = '<div class="loading-message">Нет товаров в каталоге</div>';
        return;
    }
    
    const filtered = getFilteredProducts();
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="loading-message">Товары не найдены</div>';
        return;
    }
    
    grid.innerHTML = filtered.map(p => {
        const category = categories.find(c => c.id == p.category_id);
        const hasDiscount = p.discount_price && p.discount_price < p.price;
        const discountPercent = hasDiscount ? Math.round((1 - p.discount_price / p.price) * 100) : 0;
        const rating = p.rating || getRandomRating();
        const img = p.images && p.images.length > 0 ? p.images[0] : null;
        const sizesText = p.sizes ? p.sizes.join(', ') : (p.sizes_data ? p.sizes_data.map(s => s.size).join(', ') : '—');
        
        return `
            <div class="product-card" data-id="${p.id}">
                ${hasDiscount ? `<div class="discount-badge">-${discountPercent}%</div>` : ''}
                <div class="product-img">
                    ${img ? `<img src="${img}" alt="${escapeHtml(p.title)}">` : `<div style="font-size: 4rem;">${p.emoji || '👕'}</div>`}
                </div>
                <div class="product-info">
                    <div class="product-title">${escapeHtml(p.title)}</div>
                    <div class="product-category">${category ? escapeHtml(category.title) : ''}</div>
                    <div class="product-sizes">📏 Размеры: ${sizesText}</div>
                    <div class="product-rating">
                        <div class="stars">${renderStars(rating)}</div>
                        <span class="rating-value">${rating}</span>
                    </div>
                    <div class="product-prices">
                        ${hasDiscount ? 
                            `<span class="current-price discounted">${p.discount_price.toLocaleString()} ₽</span>
                             <span class="old-price">${p.price.toLocaleString()} ₽</span>
                             <span class="discount-percent">-${discountPercent}%</span>` :
                            `<span class="current-price">${p.price.toLocaleString()} ₽</span>`
                        }
                    </div>
                    <div class="product-actions">
                        <button class="quick-view" data-id="${p.id}">👁️</button>
                        <button class="add-to-cart" data-id="${p.id}">🛒</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    attachProductEvents();
}

function attachProductEvents() {
    document.querySelectorAll('.quick-view').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            if (id) openQuickView(id);
        };
    });
    
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            if (id) addToCartById(id);
        };
    });
}

// ===== БЫСТРЫЙ ПРОСМОТР =====
function openQuickView(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    
    const category = categories.find(c => c.id == product.category_id);
    const hasDiscount = product.discount_price && product.discount_price < product.price;
    const discountPercent = hasDiscount ? Math.round((1 - product.discount_price / product.price) * 100) : 0;
    const rating = product.rating || getRandomRating();
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    const img = product.images && product.images.length > 0 ? product.images[0] : null;
    const chars = product.characteristics || {};
    const pack = product.packaging || {};
    
    let sizesList = [];
    if (product.sizes_data && product.sizes_data.length > 0) {
        sizesList = product.sizes_data.map(s => s.size);
    } else if (product.sizes && product.sizes.length > 0) {
        sizesList = product.sizes;
    }
    
    const modalHtml = `
        <div class="quick-view-modal" id="quickViewModal">
            <div class="quick-view-content">
                <button class="quick-view-close">&times;</button>
                <div class="quick-view-body">
                    <div class="quick-view-left">
                        <div class="quick-view-image">${img ? `<img src="${img}" alt="${escapeHtml(product.title)}">` : `<div>${product.emoji || '👕'}</div>`}</div>
                        <div class="status-badge">✓ в наличии</div>
                    </div>
                    <div class="quick-view-right">
                        <h2>${escapeHtml(product.title)}</h2>
                        <div class="rating-row">
                            <div class="stars">${stars}</div>
                            <span>${rating}</span>
                        </div>
                        <div class="price-card">
                            <span class="current-price">${hasDiscount ? product.discount_price.toLocaleString() : product.price.toLocaleString()} ₽</span>
                            ${hasDiscount ? `<span class="old-price">${product.price.toLocaleString()} ₽</span>` : ''}
                        </div>
                        ${sizesList.length > 0 ? `
                        <div class="size-selector">
                            <div class="size-buttons">
                                ${sizesList.map(size => `<span class="size-btn">${escapeHtml(size)}</span>`).join('')}
                            </div>
                        </div>
                        ` : ''}
                        <button class="btn-primary add-to-cart-modal" data-id="${product.id}">В корзину</button>
                        <div class="description">${escapeHtml(product.description || 'Нет описания')}</div>
                        ${chars.material ? `<div><strong>Состав:</strong> ${escapeHtml(chars.material)}</div>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const oldModal = document.getElementById('quickViewModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    // Обработчик закрытия
    const closeBtn = document.querySelector('#quickViewModal .quick-view-close');
    if (closeBtn) {
        closeBtn.onclick = () => closeQuickView();
    }
    
    // Обработчики размеров
    document.querySelectorAll('#quickViewModal .size-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('#quickViewModal .size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        };
    });
    
    // Кнопка "В корзину" в модалке
    const modalCartBtn = document.querySelector('#quickViewModal .add-to-cart-modal');
    if (modalCartBtn) {
        modalCartBtn.onclick = () => {
            addToCartById(product.id);
            closeQuickView();
        };
    }
}

function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
}

// ===== КОРЗИНА =====
function addToCartById(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    
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
            image: product.images?.[0] || null
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`✅ ${product.title} добавлен в корзину`);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counter = document.getElementById('cartCounter');
    if (counter) counter.textContent = total;
}

// ===== ПЕРЕКЛЮЧЕНИЕ ДЕСКТОП/МОБИЛЬНЫЙ =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен');
    loadProductsFromCRM();
    updateCartCount();
    
    const desktopBtn = document.getElementById('desktopViewBtn');
    const mobileBtn = document.getElementById('mobileViewBtn');
    
    if (desktopBtn && mobileBtn) {
        desktopBtn.addEventListener('click', () => {
            document.body.classList.remove('mobile-preview');
            desktopBtn.classList.add('active');
            mobileBtn.classList.remove('active');
        });
        mobileBtn.addEventListener('click', () => {
            document.body.classList.add('mobile-preview');
            mobileBtn.classList.add('active');
            desktopBtn.classList.remove('active');
        });
    }
});

window.closeQuickView = closeQuickView;
window.addToCartById = addToCartById;
