// ===== js/products.js - ОТОБРАЖЕНИЕ ТОВАРОВ =====

window.allProducts = [];
window.categories = [];
let currentCategory = 'all';
let currentSearch = '';

function loadProductsFromCRM() {
    console.log('🔄 loadProductsFromCRM вызвана');
    const saved = localStorage.getItem('crm_data');
    
    if (!saved) {
        console.log('❌ Нет данных в localStorage');
        window.allProducts = [];
        window.categories = [];
        renderProducts();
        return;
    }
    
    try {
        const data = JSON.parse(saved);
        window.allProducts = data.products || [];
        window.categories = data.categories || [];
        console.log(`✅ Загружено товаров: ${window.allProducts.length}`);
        console.log(`✅ Загружено категорий: ${window.categories.length}`);
        console.log('📦 Первый товар:', window.allProducts[0]);
    } catch(e) {
        console.error('❌ Ошибка загрузки товаров', e);
        window.allProducts = [];
        window.categories = [];
    }
    
    renderFilters();
    renderProducts();
}

function getFilteredProducts() {
    let filtered = [...window.allProducts];
    
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category_id == currentCategory);
        console.log(`Фильтр по категории ${currentCategory}: ${filtered.length} товаров`);
    }
    
    if (currentSearch && currentSearch.trim() !== '') {
        const search = currentSearch.toLowerCase();
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(search) || 
            (p.article && p.article.toLowerCase().includes(search))
        );
        console.log(`Поиск "${currentSearch}": ${filtered.length} товаров`);
    }
    
    return filtered;
}

function renderFilters() {
    const container = document.getElementById('filterCategories');
    if (!container) {
        console.warn('filterCategories не найден');
        return;
    }
    
    if (window.categories.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<button class="filter-btn active" data-cat="all">Все товары</button>';
    window.categories.forEach(cat => {
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
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) {
        console.error('❌ productsGrid не найден в DOM!');
        return;
    }
    
    console.log('🎨 renderProducts вызвана, товаров в allProducts:', window.allProducts.length);
    
    if (window.allProducts.length === 0) {
        grid.innerHTML = '<div class="loading-message">📭 Нет товаров в каталоге</div>';
        return;
    }
    
    const filtered = getFilteredProducts();
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="loading-message">🔍 Товары не найдены</div>';
        return;
    }
    
    console.log(`📦 Отображаем ${filtered.length} товаров`);
    
    grid.innerHTML = filtered.map(p => {
        const category = window.categories.find(c => c.id == p.category_id);
        const hasDiscount = p.discount_price && p.discount_price < p.price;
        const discountPercent = hasDiscount ? Math.round((1 - p.discount_price / p.price) * 100) : 0;
        const rating = p.rating || getRandomRating();
        const img = p.images && p.images.length > 0 ? p.images[0] : null;
        
        // Получаем размеры
        let sizesText = '—';
        if (p.sizes && p.sizes.length > 0) {
            sizesText = p.sizes.join(', ');
        } else if (p.sizes_data && p.sizes_data.length > 0) {
            sizesText = p.sizes_data.map(s => s.size).join(', ');
        }
        
        // Левая метка (скидка или тег)
        let leftBadgeHtml = '';
        if (hasDiscount) {
            leftBadgeHtml = `<div class="product-badge discount">🔥 -${discountPercent}%</div>`;
        } else if (p.tags && p.tags.length > 0) {
            if (p.tags.includes('новинка')) {
                leftBadgeHtml = `<div class="product-badge new">✨ Новинка</div>`;
            } else if (p.tags.includes('хит')) {
                leftBadgeHtml = `<div class="product-badge hit">⭐ Хит продаж</div>`;
            } else if (p.tags.includes('популярное')) {
                leftBadgeHtml = `<div class="product-badge popular">🔥 Популярное</div>`;
            }
        }
        
        // Правая метка (рейтинг)
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let starsHtml = '';
        for (let i = 0; i < fullStars; i++) starsHtml += '★';
        if (halfStar) starsHtml += '½';
        for (let i = 0; i < emptyStars; i++) starsHtml += '☆';
        
        const rightBadgeHtml = `
            <div class="product-rating-badge">
                <span class="stars">${starsHtml}</span>
                <span class="rating-value">${rating}</span>
            </div>
        `;
        
        return `
            <div class="product-card" data-id="${p.id}">
                ${leftBadgeHtml}
                ${rightBadgeHtml}
                <div class="product-img">
                    ${img ? `<img src="${img}" alt="${escapeHtml(p.title)}">` : `<div style="font-size: 4rem; display:flex; align-items:center; justify-content:center; height:100%;">${p.emoji || '👕'}</div>`}
                </div>
                <div class="product-info">
                    <div class="product-title">${escapeHtml(p.title)}</div>
                    <div class="product-category">${category ? escapeHtml(category.title) : ''}</div>
                    <div class="product-sizes">📏 Размеры: ${sizesText}</div>
                    <div class="product-prices">
                        ${hasDiscount ? 
                            `<span class="current-price discounted">${p.discount_price.toLocaleString()} ₽</span>
                             <span class="old-price">${p.price.toLocaleString()} ₽</span>` :
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
    // Быстрый просмотр
    document.querySelectorAll('.quick-view').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            console.log('👁️ Быстрый просмотр товара:', id);
            if (id && typeof openQuickView === 'function') {
                openQuickView(id);
            } else {
                showToast('Функция быстрого просмотра в разработке');
            }
        };
    });
    
    // Добавление в корзину
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            console.log('🛒 Добавление в корзину, id:', id);
            if (id && typeof addToCartById === 'function') {
                addToCartById(id);
            } else {
                console.error('addToCartById не определена');
                showToast('Ошибка добавления в корзину');
            }
        };
    });
}

function getRandomRating() {
    return (4 + Math.random()).toFixed(1);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
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

// Делаем глобальными
window.allProducts = window.allProducts;
window.categories = window.categories;
window.renderProducts = renderProducts;
window.currentSearch = currentSearch;

// Автоматическая инициализация при загрузке
console.log('products.js загружен');
