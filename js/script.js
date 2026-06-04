// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let allProducts = [];
let categories = [];
let currentCategory = 'all';
let currentSearch = '';

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function getRandomRating() {
    return (3 + Math.random() * 2).toFixed(1);
}

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

// ===== РЕЙТИНГ =====
function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<span class="star filled">★</span>';
    }
    if (hasHalfStar) {
        starsHtml += '<span class="star filled">½</span>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<span class="star">★</span>';
    }
    return starsHtml;
}

// ===== ЗАГРУЗКА ТОВАРОВ ИЗ CRM =====
function loadProductsFromCRM() {
    const saved = localStorage.getItem('crm_data');
    console.log('Загрузка товаров из CRM:', saved ? 'данные есть' : 'данных нет');
    
    if (!saved) {
        allProducts = [];
        categories = [];
        renderFilters();
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
        allProducts = [];
        categories = [];
    }
    
    renderFilters();
    renderProducts();
    updateCartCount();
}

// ===== ФИЛЬТРАЦИЯ =====
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

// ===== ОТРИСОВКА ФИЛЬТРОВ =====
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
        grid.innerHTML = `<div class="loading-message" style="grid-column:1/-1; text-align:center; padding:3rem;">
            <i class="fas fa-box-open" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem; display: block;"></i>
            <strong>Нет товаров в каталоге</strong>
            <p style="margin-top: 0.5rem; color: #64748b;">Добавьте товары в разделе "Товары" админ-панели</p>
        </div>`;
        return;
    }
    
    const filtered = getFilteredProducts();
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="loading-message" style="grid-column:1/-1; text-align:center; padding:3rem;">😔 Товары не найдены</div>';
        return;
    }
    
    grid.innerHTML = filtered.map((p, idx) => {
        const category = categories.find(c => c.id == p.category_id);
        const hasDiscount = p.discount_price && p.discount_price < p.price;
        const discountPercent = hasDiscount ? Math.round((1 - p.discount_price / p.price) * 100) : 0;
        const rating = p.rating || getRandomRating();
        const productImage = p.images && p.images.length > 0 ? p.images[0] : null;
        const sizesText = p.sizes && p.sizes.length ? p.sizes.join(', ') : '—';
        
        return `
            <div class="product-card" data-id="${p.id}" style="--index: ${idx}">
                ${hasDiscount ? `<div class="discount-badge">-${discountPercent}%</div>` : ''}
                <div class="product-img">
                    ${productImage ? 
                        `<img src="${productImage}" alt="${escapeHtml(p.title)}" style="width:100%; height:100%; object-fit:cover;">` : 
                        `<div style="font-size: 4rem;">👕</div>`
                    }
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
                        <button class="action-icon quick-view" data-id="${p.id}" title="Быстрый просмотр">👁️</button>
                        <button class="action-icon add-to-cart" data-id="${p.id}" title="В корзину">🛒</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    attachProductEvents();
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
function attachProductEvents() {
    document.querySelectorAll('.quick-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            openQuickView(id);
        });
    });
    
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            addToCartById(id);
        });
    });
}

// ===== БЫСТРЫЙ ПРОСМОТР =====
function openQuickView(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        console.error('Товар не найден', productId);
        return;
    }
    
    console.log('Открываем быстрый просмотр для:', product.title);
    
    const category = categories.find(c => c.id == product.category_id);
    const hasDiscount = product.discount_price && product.discount_price < product.price;
    const discountPercent = hasDiscount ? Math.round((1 - product.discount_price / product.price) * 100) : 0;
    const rating = product.rating || getRandomRating();
    const sizes = product.sizes && product.sizes.length ? product.sizes.join(', ') : '—';
    const productImage = product.images && product.images.length > 0 ? product.images[0] : null;
    
    // Формируем галерею
    let galleryHtml = '';
    if (product.images && product.images.length > 0) {
        galleryHtml = `
            <div class="quick-view-gallery">
                <div class="gallery-main">
                    <img id="galleryMainImg" src="${product.images[0]}" alt="${escapeHtml(product.title)}">
                </div>
                <div class="gallery-thumbs">
                    ${product.images.map((img, idx) => `
                        <div class="gallery-thumb ${idx === 0 ? 'active' : ''}" data-img="${img}">
                            <img src="${img}" alt="Фото ${idx + 1}">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        galleryHtml = `<div class="quick-view-image-placeholder"><div style="font-size: 6rem;">👕</div></div>`;
    }
    
    // Формируем характеристики
    let charsHtml = '';
    const chars = product.characteristics || {};
    if (Object.keys(chars).some(k => chars[k])) {
        charsHtml = `
            <div class="quick-view-characteristics">
                <h4>📋 Характеристики</h4>
                <table class="chars-table">
                    ${chars.brand ? `<tr><th>Бренд</th><td>${escapeHtml(chars.brand)}</td></tr>` : ''}
                    ${chars.material ? `<tr><th>Состав</th><td>${escapeHtml(chars.material)}</td></tr>` : ''}
                    ${chars.collar ? `<td><th>Воротник</th><td>${escapeHtml(chars.collar)}</td></tr>` : ''}
                    ${chars.sleeves ? `<tr><th>Рукава</th><td>${escapeHtml(chars.sleeves)}</td></tr>` : ''}
                    ${chars.pockets ? `<tr><th>Карманы</th><td>${escapeHtml(chars.pockets)}</td></tr>` : ''}
                    ${chars.clasp ? `<tr><th>Застёжка</th><td>${escapeHtml(chars.clasp)}</td></tr>` : ''}
                    ${chars.length ? `<tr><th>Длина</th><td>${escapeHtml(chars.length)}</td></tr>` : ''}
                    ${chars.silhouette ? `<tr><th>Силуэт</th><td>${escapeHtml(chars.silhouette)}</td></tr>` : ''}
                    ${chars.country ? `<tr><th>Страна</th><td>${escapeHtml(chars.country)}</td></tr>` : ''}
                </table>
            </div>
        `;
    }
    
    // Габариты
    let packagingHtml = '';
    const pack = product.packaging || {};
    if (pack.length || pack.width || pack.height || pack.weight) {
        packagingHtml = `
            <div class="quick-view-packaging">
                <h4>📦 Габариты упаковки</h4>
                <div class="packaging-grid">
                    ${pack.length ? `<div><strong>Длина:</strong> ${pack.length} см</div>` : ''}
                    ${pack.width ? `<div><strong>Ширина:</strong> ${pack.width} см</div>` : ''}
                    ${pack.height ? `<div><strong>Высота:</strong> ${pack.height} см</div>` : ''}
                    ${pack.weight ? `<div><strong>Вес:</strong> ${pack.weight} кг</div>` : ''}
                </div>
            </div>
        `;
    }
    
    // Ярлыки
    let tagsHtml = '';
    if (product.tags && product.tags.length > 0) {
        tagsHtml = `
            <div class="quick-view-tags">
                ${product.tags.map(tag => `<span class="product-tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
        `;
    }
    
    const modalHtml = `
        <div class="quick-view-modal active" id="quickViewModal">
            <div class="quick-view-content">
                <button class="quick-view-close" onclick="closeQuickView()">&times;</button>
                <div class="quick-view-body">
                    <div class="quick-view-left">
                        ${galleryHtml}
                    </div>
                    <div class="quick-view-right">
                        <h3>${escapeHtml(product.title)}</h3>
                        <div class="category">${category ? escapeHtml(category.title) : 'Без категории'}</div>
                        ${tagsHtml}
                        <div class="product-rating">
                            <div class="stars">${renderStars(rating)}</div>
                            <span class="rating-value">${rating}</span>
                        </div>
                        <div class="product-sizes-info">
                            <strong>📏 Размеры:</strong>
                            <div class="sizes-list">${sizes}</div>
                        </div>
                        <div class="product-prices quick">
                            ${hasDiscount ? 
                                `<span class="current-price discounted">${product.discount_price.toLocaleString()} ₽</span>
                                 <span class="old-price">${product.price.toLocaleString()} ₽</span>
                                 <span class="discount-percent">-${discountPercent}%</span>` :
                                `<span class="current-price">${product.price.toLocaleString()} ₽</span>`
                            }
                        </div>
                        <div class="product-description">
                            <h4>📝 Описание</h4>
                            <p>${escapeHtml(product.description || 'Нет описания')}</p>
                        </div>
                        ${charsHtml}
                        ${packagingHtml}
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
    
    // Инициализация галереи
    const thumbs = document.querySelectorAll('.gallery-thumb');
    const mainImg = document.getElementById('galleryMainImg');
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const imgSrc = thumb.dataset.img;
            if (mainImg) mainImg.src = imgSrc;
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });
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
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ 
            id: product.id,
            title: product.title, 
            price: product.discount_price || product.price,
            quantity: 1,
            image: product.images && product.images[0] ? product.images[0] : null
        });
    }
    
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

function initCart() {
    updateCartCount();
}

// ===== МОБИЛЬНОЕ МЕНЮ =====
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            menuBtn.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
        document.querySelectorAll('.mobile-nav-list a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                menuBtn.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

// ===== ГОЛОСОВОЙ ПОИСК =====
function initVoiceSearch() {
    const voiceBtn = document.getElementById('voiceBtn');
    const searchInput = document.getElementById('searchInput');
    if (voiceBtn && 'webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'ru-RU';
        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            if (searchInput) searchInput.value = text;
            voiceBtn.classList.remove('listening');
            currentSearch = text;
            renderProducts();
        };
        recognition.onend = () => voiceBtn.classList.remove('listening');
        voiceBtn.addEventListener('click', () => {
            recognition.start();
            voiceBtn.classList.add('listening');
        });
    }
}

// ===== ПАНЕЛЬ ПЕРЕКЛЮЧЕНИЯ ВИДА =====
function initViewSwitcher() {
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
}

// ===== КНОПКИ =====
function initButtons() {
    const shopNowBtn = document.getElementById('shopNowBtn');
    const contactBtn = document.getElementById('contactBtn');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', () => {
            document.querySelector('.products-grid')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            alert('Форма обратной связи будет здесь');
        });
    }
}

// ===== ВИДЖЕТЫ =====
function initMascot() {
    const mascot = document.getElementById('mascot');
    const bubble = document.getElementById('mascotBubble');
    if (mascot) {
        const messages = ['💙 Привет! Я Капля!', '💚 Хотите скидку 15%?', '🌊 Напишите нам!', '💙 У нас опт от 10 штук'];
        let idx = 0;
        mascot.addEventListener('click', () => {
            bubble.textContent = messages[idx % messages.length];
            idx++;
            setTimeout(() => {
                if (bubble.textContent !== 'Привет! Я Капля 💙') {
                    bubble.textContent = 'Привет! Я Капля 💙';
                }
            }, 2500);
        });
    }
}

function initSnackbar() {
    const snackbar = document.getElementById('snackbar');
    const closeBtn = document.getElementById('closeSnackbar');
    if (snackbar && !localStorage.getItem('snackbarClosed')) {
        setTimeout(() => snackbar.classList.add('show'), 2000);
        setTimeout(() => snackbar.classList.remove('show'), 8000);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            snackbar.classList.remove('show');
            localStorage.setItem('snackbarClosed', 'true');
        });
    }
}

// ===== ЗАПУСК =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, инициализация...');
    loadProductsFromCRM();
    initMobileMenu();
    initVoiceSearch();
    initViewSwitcher();
    initButtons();
    initMascot();
    initSnackbar();
    initCart();
});
