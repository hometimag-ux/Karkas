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

// ===== БЫСТРЫЙ ПРОСМОТР (в стиле образца) =====
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

       
    // Размеры
    let sizesList = [];
    if (product.sizes_data && product.sizes_data.length > 0) {
        sizesList = product.sizes_data.map(s => s.size);
    } else if (product.sizes && product.sizes.length > 0) {
        sizesList = product.sizes;
    }
    
    // Цвета (если есть в товаре, иначе стандартные)
    const colors = product.colors || ['#8F9E6B', '#ffffff', '#2F5D50', '#4a708b'];
    const colorNames = product.color_names || ['оливковый', 'белый', 'тёмно-зелёный', 'синий'];
    
    const modalHtml = `
        <div class="quick-view-modal" id="quickViewModal">
            <div class="quick-view-content">
                <button class="quick-view-close">&times;</button>
                <div class="quick-view-body">
                    <!-- Левая колонка: галерея -->
                    <div class="quick-view-left">
                        <div class="main-visual">
                            ${img ? `<img src="${img}" alt="${escapeHtml(product.title)}" style="width:100%; border-radius: 28px;">` : `<div style="font-size: 6rem;">${product.emoji || '👕'}</div>`}
                        </div>
                        <div class="status-badge">✓ в наличии | профессиональная серия</div>
                        <div class="color-swatches" id="modalColorSwatches">
                            ${colors.map((color, idx) => `
                                <div class="swatch ${idx === 0 ? 'active' : ''}" style="background: ${color}; ${color === '#ffffff' ? 'border:1px solid #ccc;' : ''}" data-color="${colorNames[idx]}"></div>
                            `).join('')}
                        </div>
                        <div style="font-size:0.7rem; margin-top:12px; color:#5b7f6a;">★ ${rating} на основе отзывов</div>
                    </div>
                    
                    <!-- Правая колонка: информация -->
                    <div class="quick-view-right">
                        <div class="brand">MURANO APPAREL — медицинская коллекция</div>
                        <h1>${escapeHtml(product.title)}</h1>
                        ${product.article ? `<div class="article">Артикул: ${escapeHtml(product.article)}</div>` : ''}
                        
                        <div class="rating-row">
                            <div class="stars">${stars}</div>
                            <span style="font-size:0.8rem;">${rating} · отзывы</span>
                            <span style="background:#EFF6F0; padding:2px 8px; border-radius:20px; font-size:0.7rem;">98% рекомендуют</span>
                        </div>
                        
                        <div class="price-card">
                            <div>
                                <span class="current-price">${hasDiscount ? product.discount_price.toLocaleString() : product.price.toLocaleString()} ₽</span>
                                ${hasDiscount ? `<span class="old-price">${product.price.toLocaleString()} ₽</span>` : ''}
                            </div>
                            <div class="installment">Бесплатная доставка от 3 500 ₽ / рассрочка без переплаты</div>
                        </div>
                        
                        <div class="specs-grid">
                            ${chars.material ? `<span class="spec-item">🧵 ${escapeHtml(chars.material)}</span>` : ''}
                            ${chars.features ? `<span class="spec-item">💧 ${escapeHtml(chars.features)}</span>` : ''}
                            <span class="spec-item">🔄 100+ стирок</span>
                            <span class="spec-item">🧼 антибактерия</span>
                        </div>
                        
                        <!-- Размеры -->
                        ${sizesList.length > 0 ? `
                        <div class="size-selector">
                            <h4>Выберите размер</h4>
                            <div class="size-buttons" id="modalSizeButtons">
                                ${sizesList.map((size, idx) => `
                                    <span data-size="${escapeHtml(size)}" class="size-btn ${idx === Math.floor(sizesList.length/2) ? 'active' : ''}">${escapeHtml(size)}</span>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        <div class="action-group">
                            <button class="btn-primary" id="modalBuyBtn">Добавить в корзину — ${hasDiscount ? product.discount_price.toLocaleString() : product.price.toLocaleString()} ₽</button>
                            <button class="btn-secondary" id="modalOneClickBtn">Быстрый заказ</button>
                        </div>
                        
                        <div class="usp-row">
                            <span>🚚 доставка 1–3 дня</span>
                            <span>🔄 обмен 14 дней</span>
                            <span>🏷️ опт от 5 шт — скидка</span>
                            <span>🧵 логотип за 48ч</span>
                        </div>
                        
                        <!-- Табы -->
                        <div class="tabs">
                            <button class="tab-btn active" data-tab="desc">описание</button>
                            <button class="tab-btn" data-tab="specs">характеристики</button>
                            <button class="tab-btn" data-tab="packaging">упаковка</button>
                            <button class="tab-btn" data-tab="b2b">для клиник и опта</button>
                        </div>
                        
                        <div class="tab-content">
                            <div class="tab-pane active" id="desc">
                                <p>${escapeHtml(product.description || 'Профессиональная медицинская одежда, разработанная с учётом пожеланий медицинских работников. Эргономичный крой, эластичная ткань и продуманные детали.')}</p>
                                <ul class="feature-list">
                                    <li>Анатомическая посадка: не стесняет движений</li>
                                    <li>Материал «дышит», отводит влагу в течение смены</li>
                                    <li>Сохраняет форму и цвет после частых стирок (до 95°C)</li>
                                    <li>Гипоаллергенно, одобрено дерматологами</li>
                                </ul>
                            </div>
                            <div class="tab-pane" id="specs">
                                <table style="width:100%; border-collapse: collapse; font-size:0.85rem;">
                                    <tbody>
                                        ${chars.brand ? `<tr><td style="padding:6px 0;">Бренд</td><td>${escapeHtml(chars.brand)}</td></tr>` : ''}
                                        ${chars.material ? `<tr><td style="padding:6px 0;">Состав</td><td>${escapeHtml(chars.material)}</td></tr>` : ''}
                                        ${chars.collar ? `<tr><td style="padding:6px 0;">Воротник</td><td>${escapeHtml(chars.collar)}</td></tr>` : ''}
                                        ${chars.sleeves ? `<tr><td style="padding:6px 0;">Рукава</td><td>${escapeHtml(chars.sleeves)}</td></tr>` : ''}
                                        ${chars.pockets ? `<tr><td style="padding:6px 0;">Карманы</td><td>${escapeHtml(chars.pockets)}</td></tr>` : ''}
                                        ${chars.clasp ? `<tr><td style="padding:6px 0;">Застёжка</td><td>${escapeHtml(chars.clasp)}</td></tr>` : ''}
                                        ${chars.length ? `<tr><td style="padding:6px 0;">Длина</td><td>${escapeHtml(chars.length)}</td></tr>` : ''}
                                        ${chars.silhouette ? `<tr><td style="padding:6px 0;">Силуэт</td><td>${escapeHtml(chars.silhouette)}</td></tr>` : ''}
                                        ${chars.country ? `<tr><td style="padding:6px 0;">Страна</td><td>${escapeHtml(chars.country)}</td></tr>` : ''}
                                    </tbody>
                                </table>
                            </div>
                            <div class="tab-pane" id="packaging">
                                <div class="packaging-grid">
                                    ${pack.length ? `<div>📏 Длина: ${pack.length} см</div>` : ''}
                                    ${pack.width ? `<div>📐 Ширина: ${pack.width} см</div>` : ''}
                                    ${pack.height ? `<div>📦 Высота: ${pack.height} см</div>` : ''}
                                    ${pack.weight ? `<div>⚖️ Вес: ${pack.weight} кг</div>` : ''}
                                </div>
                                ${!pack.length && !pack.width && !pack.height && !pack.weight ? '<p>Информация о габаритах упаковки отсутствует</p>' : ''}
                            </div>
                            <div class="tab-pane" id="b2b">
                                <p><strong>Преимущества для клиник, медцентров и оптовых заказчиков:</strong></p>
                                <ul class="feature-list">
                                    <li>Специальные цены при заказе от 5 штук</li>
                                    <li>Разработка лекал по индивидуальным замерам</li>
                                    <li>Нанесение логотипа (вышивка / трафарет)</li>
                                    <li>Подготовка документов для тендеров</li>
                                    <li>Отсрочка платежа для юридических лиц</li>
                                </ul>
                                <button class="btn-primary" id="modalB2bBtn" style="margin-top:16px; width:100%; background:#3f6e58;">📩 Запросить коммерческое предложение</button>
                            </div>
                        </div>
                        
                        <div class="lead-magnet">
                            <div><span style="font-weight:700;">📏 Как точно подобрать размер?</span> Скачайте чек-лист примерки.</div>
                            <button class="small-outline" id="modalLeadMagnetBtn">Получить PDF</button>
                        </div>
                        
                        <div class="b2b-note">
                            <span>🏥 Корпоративным клиентам: скидка от объёма, образцы ткани бесплатно.</span>
                            <button class="small-outline" id="modalCorpBtn">Связаться с менеджером</button>
                        </div>
                        
                        <div style="font-size:0.7rem; text-align:center; color:#7f9a8a;">✓ гарантия 12 месяцев ✓ помощь с выбором размера ✓ возврат по стандартам РФ</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
       const oldModal = document.getElementById('quickViewModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    // ==== ИНИЦИАЛИЗАЦИЯ СОБЫТИЙ ПОСЛЕ СОЗДАНИЯ МОДАЛКИ ====
    
    // Обработчик закрытия
    const closeBtn = document.querySelector('#quickViewModal .quick-view-close');
    if (closeBtn) {
        closeBtn.onclick = () => closeQuickView();
    }
    
    // Размеры
    const sizeBtns = document.querySelectorAll('#quickViewModal .size-btn');
    sizeBtns.forEach(btn => {
        btn.onclick = function() {
            sizeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        };
    });
    
    // Цвета
    const swatches = document.querySelectorAll('#quickViewModal .swatch');
    swatches.forEach(sw => {
        sw.onclick = function() {
            swatches.forEach(s => s.classList.remove('active'));
            this.classList.add('active');
        };
    });
    
    // Табы
    const tabBtns = document.querySelectorAll('#quickViewModal .tab-btn');
    const panes = document.querySelectorAll('#quickViewModal .tab-pane');
    tabBtns.forEach(btn => {
        btn.onclick = () => {
            const tabId = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            panes.forEach(p => p.classList.remove('active'));
            const activePane = document.getElementById(tabId);
            if (activePane) activePane.classList.add('active');
        };
    });
    
    // Кнопка "В корзину"
    const buyBtn = document.getElementById('modalBuyBtn');
    if (buyBtn) {
        buyBtn.onclick = () => {
            addToCartById(product.id);
            closeQuickView();
        };
    }
    
    // Быстрый заказ
    const oneClickBtn = document.getElementById('modalOneClickBtn');
    if (oneClickBtn) {
        oneClickBtn.onclick = () => showToast('📞 Оставьте номер телефона — менеджер перезвонит через 5 минут');
    }
    
    // Лид-магнит
    const leadBtn = document.getElementById('modalLeadMagnetBtn');
    if (leadBtn) {
        leadBtn.onclick = () => showToast('📧 Чек-лист примерки отправлен на ваш email');
    }
    
    // B2B кнопка в табе
    const b2bBtn = document.getElementById('modalB2bBtn');
    if (b2bBtn) {
        b2bBtn.onclick = () => showToast('📩 Запрос для B2B принят. Подготовим КП с ценами от 5 шт');
    }
    
    // Корпоративная кнопка
    const corpBtn = document.getElementById('modalCorpBtn');
    if (corpBtn) {
        corpBtn.onclick = () => showToast('📩 Свяжитесь с B2B-отделом: b2b@murano-apparel.ru');
    }
}


    // ==== ИНИЦИАЛИЗАЦИЯ СОБЫТИЙ ====
    // Закрытие
    const closeBtn = document.querySelector('#quickViewModal .quick-view-close');
    if (closeBtn) closeBtn.onclick = () => closeQuickView();
    
    // Размеры
    document.querySelectorAll('#quickViewModal .size-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('#quickViewModal .size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        };
    });
    
    // Цвета
    document.querySelectorAll('#quickViewModal .swatch').forEach(sw => {
        sw.onclick = function() {
            document.querySelectorAll('#quickViewModal .swatch').forEach(s => s.classList.remove('active'));
            this.classList.add('active');
        };
    });
    
    // Табы
    const tabBtns = document.querySelectorAll('#quickViewModal .tab-btn');
    const panes = document.querySelectorAll('#quickViewModal .tab-pane');
    tabBtns.forEach(btn => {
        btn.onclick = () => {
            const tabId = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            panes.forEach(p => p.classList.remove('active'));
            const activePane = document.getElementById(tabId);
            if (activePane) activePane.classList.add('active');
        };
    });
    
    // Кнопка "В корзину"
    const buyBtn = document.getElementById('modalBuyBtn');
    if (buyBtn) buyBtn.onclick = () => { addToCartById(product.id); closeQuickView(); };
    
    // Быстрый заказ
    const oneClickBtn = document.getElementById('modalOneClickBtn');
    if (oneClickBtn) oneClickBtn.onclick = () => showToast('📞 Оставьте номер телефона — менеджер перезвонит через 5 минут');
    
    // Лид-магнит
    const leadBtn = document.getElementById('modalLeadMagnetBtn');
    if (leadBtn) leadBtn.onclick = () => showToast('📧 Чек-лист примерки отправлен на ваш email');
    
    // B2B кнопка в табе
    const b2bBtn = document.getElementById('modalB2bBtn');
    if (b2bBtn) b2bBtn.onclick = () => showToast('📩 Запрос для B2B принят. Подготовим КП с ценами от 5 шт');
    
    // Корпоративная кнопка
    const corpBtn = document.getElementById('modalCorpBtn');
    if (corpBtn) corpBtn.onclick = () => showToast('📩 Свяжитесь с B2B-отделом: b2b@murano-apparel.ru');
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
