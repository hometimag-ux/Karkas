// ===== js/products.js - ОТОБРАЖЕНИЕ ТОВАРОВ =====

window.allProducts = [];
window.categories = [];
let currentCategory = 'all';
let currentSearch = '';

// Глобальная переменная для хранения выбранного товара
let selectedProductForCart = null;

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

// Функция для открытия модального окна выбора размера
function openSizeModal(productId) {
    const product = window.allProducts.find(p => p.id === productId);
    if (!product) {
        showToast('Товар не найден');
        return;
    }
    
    selectedProductForCart = product;
    
    // Получаем список размеров
    let sizes = [];
    let colors = [];
    
    if (product.sizes_data && product.sizes_data.length > 0) {
        sizes = [...new Set(product.sizes_data.map(s => s.size))];
        colors = [...new Set(product.sizes_data.map(s => s.color || product.color || '—'))];
    } else if (product.sizes && product.sizes.length > 0) {
        sizes = product.sizes;
        colors = [product.color || '—'];
    } else {
        sizes = ['—'];
        colors = [product.color || '—'];
    }
    
    const modalHtml = `
        <div id="sizeModal" class="size-modal-overlay">
            <div class="size-modal">
                <div class="size-modal-header">
                    <h3>Выберите размер</h3>
                    <button class="size-modal-close" id="closeSizeModal">&times;</button>
                </div>
                <div class="size-modal-body">
                    <div class="size-product-info">
                        <div class="size-product-title">${escapeHtml(product.title)}</div>
                        <div class="size-product-price">${product.discount_price && product.discount_price < product.price ? product.discount_price.toLocaleString() : product.price.toLocaleString()} ₽</div>
                    </div>
                    <div class="size-options">
                        <div class="size-label">Размер:</div>
                        <div class="size-buttons" id="sizeButtons">
                            ${sizes.map(size => `
                                <button class="size-btn" data-size="${escapeHtml(size)}">${escapeHtml(size)}</button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="color-options">
                        <div class="color-label">Цвет:</div>
                        <div class="color-buttons" id="colorButtons">
                            ${colors.map(color => `
                                <button class="color-btn" data-color="${escapeHtml(color)}">${escapeHtml(color)}</button>
                            `).join('')}
                        </div>
                    </div>
                    <button id="confirmAddToCart" class="confirm-cart-btn">🛒 Добавить в корзину</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    let selectedSize = sizes[0] || '—';
    let selectedColor = colors[0] || '—';
    
    // Выбор размера
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedSize = btn.dataset.size;
        };
    });
    
    // Выбор цвета
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedColor = btn.dataset.color;
        };
    });
    
    // Активируем первый элемент
    if (document.querySelector('.size-btn')) document.querySelector('.size-btn').classList.add('active');
    if (document.querySelector('.color-btn')) document.querySelector('.color-btn').classList.add('active');
    
    // Подтверждение добавления
    document.getElementById('confirmAddToCart').onclick = () => {
        const price = product.discount_price && product.discount_price < product.price ? product.discount_price : product.price;
        const image = product.images && product.images.length > 0 ? product.images[0] : null;
        
        addToCart({
            id: product.id,
            title: product.title,
            price: price,
            quantity: 1,
            size: selectedSize,
            color: selectedColor,
            article: product.article || '—',
            image: image
        });
        
        closeSizeModal();
    };
    
    // Закрытие модального окна
    const closeSizeModal = () => {
        const modal = document.getElementById('sizeModal');
        if (modal) modal.remove();
        document.body.style.overflow = '';
    };
    
    document.getElementById('closeSizeModal').onclick = closeSizeModal;
    document.getElementById('sizeModal').onclick = (e) => {
        if (e.target === document.getElementById('sizeModal')) closeSizeModal();
    };
}

// Добавление в корзину (уже есть, но убедимся)
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
        
        // Получаем размеры для отображения
        let sizesText = '—';
        if (p.sizes && p.sizes.length > 0) {
            sizesText = p.sizes.join(', ');
        } else if (p.sizes_data && p.sizes_data.length > 0) {
            sizesText = [...new Set(p.sizes_data.map(s => s.size))].join(', ');
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
    
    // Добавление в корзину - теперь с выбором размера
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            console.log('🛒 Добавление в корзину, id:', id);
            openSizeModal(id);
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
window.openSizeModal = openSizeModal;

// Автоматическая инициализация при загрузке
console.log('products.js загружен');
