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
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function getRandomRating() {
    return (3 + Math.random() * 2).toFixed(1);
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) starsHtml += '<span class="star filled">★</span>';
    if (hasHalfStar) starsHtml += '<span class="star filled">½</span>';
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) starsHtml += '<span class="star">★</span>';
    return starsHtml;
}

// ===== ЗАГРУЗКА ТОВАРОВ ИЗ CRM =====
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
        console.log(`Загружено товаров: ${allProducts.length}, категорий: ${categories.length}`);
    } catch(e) {
        console.error('Ошибка загрузки товаров', e);
    }
    renderFilters();
    renderProducts();
}

function getFilteredProducts() {
    let filtered = [...allProducts];
    if (currentCategory !== 'all') filtered = filtered.filter(p => p.category_id == currentCategory);
    if (currentSearch) filtered = filtered.filter(p => p.title.toLowerCase().includes(currentSearch.toLowerCase()));
    return filtered;
}

function renderFilters() {
    const container = document.getElementById('filterCategories');
    if (!container) return;
    if (categories.length === 0) { container.innerHTML = ''; return; }
    let html = '<button class="filter-btn active" data-cat="all">Все</button>';
    categories.forEach(cat => { html += `<button class="filter-btn" data-cat="${cat.id}">${escapeHtml(cat.title)}</button>`; });
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
    if (searchInput) searchInput.addEventListener('input', (e) => { currentSearch = e.target.value; renderProducts(); });
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    if (allProducts.length === 0) {
        grid.innerHTML = `<div class="loading-message">Нет товаров в каталоге</div>`;
        return;
    }
    const filtered = getFilteredProducts();
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="loading-message">😔 Товары не найдены</div>';
        return;
    }
    grid.innerHTML = filtered.map((p, idx) => {
        const category = categories.find(c => c.id == p.category_id);
        const hasDiscount = p.discount_price && p.discount_price < p.price;
        const discountPercent = hasDiscount ? Math.round((1 - p.discount_price / p.price) * 100) : 0;
        const rating = p.rating || getRandomRating();
        const productImage = p.images && p.images.length > 0 ? p.images[0] : null;
        const sizesText = p.sizes && p.sizes.length ? p.sizes.join(', ') : (p.sizes_data && p.sizes_data.length ? p.sizes_data.map(s => s.size).join(', ') : '—');
        return `
            <div class="product-card" data-id="${p.id}">
                ${hasDiscount ? `<div class="discount-badge">-${discountPercent}%</div>` : ''}
                <div class="product-img">
                    ${productImage ? `<img src="${productImage}" alt="${escapeHtml(p.title)}" style="width:100%; height:100%; object-fit:cover;">` : `<div style="font-size: 4rem;">👕</div>`}
                </div>
                <div class="product-info">
                    <div class="product-title">${escapeHtml(p.title)}</div>
                    <div class="product-category">${category ? escapeHtml(category.title) : ''}</div>
                    <div class="product-sizes">📏 Размеры: ${sizesText}</div>
                    <div class="product-rating"><div class="stars">${renderStars(rating)}</div><span class="rating-value">${rating}</span></div>
                    <div class="product-prices">
                        ${hasDiscount ? 
                            `<span class="current-price discounted">${p.discount_price.toLocaleString()} ₽</span>
                             <span class="old-price">${p.price.toLocaleString()} ₽</span>
                             <span class="discount-percent">-${discountPercent}%</span>` :
                            `<span class="current-price">${p.price.toLocaleString()} ₽</span>`
                        }
                    </div>
                    <div class="product-actions">
                        <button class="action-icon quick-view" data-id="${p.id}" title="Быстрый просмотр">👁️</button>
                        <button class="action-icon add-to-cart" data-id="${p.id}" title="В корзину">🛒</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    attachProductEvents();
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ (делегирование) =====
function attachProductEvents() {
    document.body.addEventListener('click', (e) => {
        const quickViewBtn = e.target.closest('.quick-view');
        if (quickViewBtn) {
            e.stopPropagation();
            const id = parseInt(quickViewBtn.dataset.id);
            console.log('Клик по глазику, ID:', id);
            if (id && !isNaN(id)) openQuickView(id);
        }
        const cartBtn = e.target.closest('.add-to-cart');
        if (cartBtn) {
            e.stopPropagation();
            const id = parseInt(cartBtn.dataset.id);
            if (id && !isNaN(id)) addToCartById(id);
        }
    });
}

// ===== БЫСТРЫЙ ПРОСМОТР =====
function openQuickView(productId) {
    console.log('openQuickView вызван для ID:', productId);
    const product = allProducts.find(p => p.id === productId);
    if (!product) { console.error('Товар не найден'); return; }
    const category = categories.find(c => c.id == product.category_id);
    const hasDiscount = product.discount_price && product.discount_price < product.price;
    const discountPercent = hasDiscount ? Math.round((1 - product.discount_price / product.price) * 100) : 0;
    const rating = product.rating || getRandomRating();
    const sizes = product.sizes && product.sizes.length ? product.sizes.join(', ') : (product.sizes_data && product.sizes_data.length ? product.sizes_data.map(s => s.size).join(', ') : '—');
    const productImage = product.images && product.images.length > 0 ? product.images[0] : null;
    const chars = product.characteristics || {};
    const packaging = product.packaging || {};
    const modalHtml = `
        <div class="quick-view-modal active" id="quickViewModal">
            <div class="quick-view-content">
                <button class="quick-view-close" onclick="closeQuickView()">&times;</button>
                <div class="quick-view-body">
                    <div class="quick-view-left">
                        <div class="quick-view-image">${productImage ? `<img src="${productImage}" alt="${escapeHtml(product.title)}">` : '<div style="font-size: 6rem;">👕</div>'}</div>
                    </div>
                    <div class="quick-view-right">
                        <h3>${escapeHtml(product.title)}</h3>
                        <div class="category">${category ? escapeHtml(category.title) : 'Без категории'}</div>
                        <div class="product-rating"><div class="stars">${renderStars(rating)}</div><span class="rating-value">${rating}</span></div>
                        <div class="product-sizes-info"><strong>📏 Размеры:</strong> ${sizes}</div>
                        <div class="product-prices quick">
                            ${hasDiscount ? 
                                `<span class="current-price discounted">${product.discount_price.toLocaleString()} ₽</span>
                                 <span class="old-price">${product.price.toLocaleString()} ₽</span>
                                 <span class="discount-percent">-${discountPercent}%</span>` :
                                `<span class="current-price">${product.price.toLocaleString()} ₽</span>`
                            }
                        </div>
                        <div class="product-description"><h4>📝 Описание</h4><p>${escapeHtml(product.description || 'Нет описания')}</p></div>
                        ${chars.brand || chars.material ? `<div class="quick-view-characteristics"><h4>📋 Характеристики</h4><table class="chars-table">
                            ${chars.brand ? `<tr><th>Бренд</th><td>${escapeHtml(chars.brand)}</td>` : ''}
                            ${chars.material ? `<tr><th>Состав</th><td>${escapeHtml(chars.material)}</td>` : ''}
                            ${chars.collar ? `<tr><th>Воротник</th><td>${escapeHtml(chars.collar)}</td>` : ''}
                            ${chars.sleeves ? `<tr><th>Рукава</th><td>${escapeHtml(chars.sleeves)}</td>` : ''}
                            ${chars.silhouette ? `<tr><th>Силуэт</th><td>${escapeHtml(chars.silhouette)}</td>` : ''}
                            ${chars.country ? `<tr><th>Страна</th><td>${escapeHtml(chars.country)}</td>` : ''}
                        </table></div>` : ''}
                        ${packaging.length || packaging.width || packaging.height || packaging.weight ? `<div class="quick-view-packaging"><h4>📦 Габариты упаковки</h4><div>${packaging.length ? `Длина: ${packaging.length} см, ` : ''}${packaging.width ? `Ширина: ${packaging.width} см, ` : ''}${packaging.height ? `Высота: ${packaging.height} см, ` : ''}${packaging.weight ? `Вес: ${packaging.weight} кг` : ''}</div></div>` : ''}
                        <button class="quick-view-add" onclick="addToCartById(${product.id}); closeQuickView();">🛒 Добавить в корзину</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    const oldModal = document.getElementById('quickViewModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
}

function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
}

// ===== КОРЗИНА =====
function addToCartById(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === productId);
    if (existing) existing.quantity += 1;
    else cart.push({ id: product.id, title: product.title, price: product.discount_price || product.price, quantity: 1, image: product.images?.[0] || null });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`✅ ${product.title} добавлен в корзину!`);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCounter = document.getElementById('cartCounter');
    if (cartCounter) cartCounter.textContent = totalItems;
}

// ===== ЗАПУСК =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, запускаем инициализацию');
    loadProductsFromCRM();
    attachProductEvents();
    updateCartCount();
});

// Дублируем вызов на случай, если DOM уже загружен
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => loadProductsFromCRM());
} else {
    loadProductsFromCRM();
}
