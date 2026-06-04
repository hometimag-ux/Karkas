// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let allProducts = [];
let categories = [];
let currentCategory = 'all';
let currentSearch = '';

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function getRandomRating() {
    return (3 + Math.random() * 2).toFixed(1);
}

function getEmojiByTitle(title) {
    const emojiMap = {
        'халат': '👩‍⚕️',
        'костюм': '👨‍⚕️',
        'скраб': '🥼',
        'брюки': '👖',
        'туника': '👚',
        'футболка': '👕',
        'рубашка': '👔',
        'кеды': '👟'
    };
    const lowerTitle = title.toLowerCase();
    for (const [key, emoji] of Object.entries(emojiMap)) {
        if (lowerTitle.includes(key)) return emoji;
    }
    return '👕';
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

// ===== ЗАГРУЗКА ТОВАРОВ ИЗ CRM (ТОЛЬКО ИЗ НЕЁ) =====
function loadProductsFromCRM() {
    const saved = localStorage.getItem('crm_data');
    
    if (!saved) {
        // Нет данных в CRM
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
        
        // Нормализуем данные товаров (добавляем недостающие поля)
        allProducts = allProducts.map(p => ({
            id: p.id,
            title: p.title || 'Без названия',
            price: p.price || 0,
            discount_price: p.discount_price || null,
            category_id: p.category_id || null,
            sizes: p.sizes || [],
            images: p.images || [],
            emoji: p.emoji || getEmojiByTitle(p.title),
            description: p.description || '',
            rating: p.rating || getRandomRating(),
            available: p.available !== false
        }));
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
    
    // Если нет товаров в CRM
    if (allProducts.length === 0) {
        grid.innerHTML = `
            <div class="loading-message" style="grid-column:1/-1; text-align:center; padding:3rem;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem; display: block;"></i>
                <strong>Нет товаров в каталоге</strong>
                <p style="margin-top: 0.5rem; color: #64748b;">Добавьте товары в разделе "Товары" админ-панели</p>
            </div>
        `;
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
        
        return `
            <div class="product-card" data-id="${p.id}" style="--index: ${idx}">
                ${hasDiscount ? `<div class="discount-badge">-${discountPercent}%</div>` : ''}
                <div class="product-img">
                    ${productImage ? 
                        `<img src="${productImage}" alt="${escapeHtml(p.title)}" style="width:100%; height:100%; object-fit:cover;">` : 
                        `<div style="font-size: 4rem;">${p.emoji || '👕'}</div>`
                    }
                </div>
                <div class="product-info">
                    <div class="product-title">${escapeHtml(p.title)}</div>
                    <div class="product-category">${category ? escapeHtml(category.title) : ''}</div>
                    <div class="product-sizes">📏 Размеры: ${p.sizes && p.sizes.length ? p.sizes.join(', ') : '—'}</div>
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
    
    // 3D-эффект при наведении
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ===== БЫСТРЫЙ ПРОСМОТР =====
// ===== БЫСТРЫЙ ПРОСМОТР С ГАЛЕРЕЕЙ И ВСЕМИ ХАРАКТЕРИСТИКАМИ =====
function openQuickView(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const category = categories.find(c => c.id == product.category_id);
    const hasDiscount = product.discount_price && product.discount_price < product.price;
    const discountPercent = hasDiscount ? Math.round((1 - product.discount_price / product.price) * 100) : 0;
    const rating = product.rating || getRandomRating();
    
    // Формируем галерею фотографий
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
        galleryHtml = `<div class="quick-view-image-placeholder"><div style="font-size: 6rem;">${product.emoji || '👕'}</div></div>`;
    }
    
    // Формируем характеристики товара
    let characteristicsHtml = '';
    const chars = product.characteristics || {};
    
    if (Object.keys(chars).length > 0) {
        characteristicsHtml = `
            <div class="quick-view-characteristics">
                <h4>📋 Характеристики</h4>
                <table class="chars-table">
                    ${chars.brand ? `<tr><td>Бренд:</td><td>${escapeHtml(chars.brand)}</td></tr>` : ''}
                    ${chars.material ? `<tr><td>Состав:</td><td>${escapeHtml(chars.material)}</td></tr>` : ''}
                    ${chars.density ? `<tr><td>Плотность:</td><td>${escapeHtml(chars.density)}</td></tr>` : ''}
                    ${chars.texture ? `<tr><td>Текстура:</td><td>${escapeHtml(chars.texture)}</td></tr>` : ''}
                    ${chars.gender ? `<tr><td>Пол:</td><td>${escapeHtml(chars.gender)}</td></tr>` : ''}
                    ${chars.age ? `<tr><td>Возраст:</td><td>${escapeHtml(chars.age)}</td></tr>` : ''}
                    ${chars.model_size ? `<tr><td>Размер на модели:</td><td>${escapeHtml(chars.model_size)}</td></tr>` : ''}
                    ${chars.model_height ? `<tr><td>Рост на модели:</td><td>${escapeHtml(chars.model_height)}</td></tr>` : ''}
                    ${chars.collar ? `<tr><td>Воротник:</td><td>${escapeHtml(chars.collar)}</td></tr>` : ''}
                    ${chars.sleeves ? `<tr><td>Рукава:</td><td>${escapeHtml(chars.sleeves)}</td></tr>` : ''}
                    ${chars.pockets ? `<tr><td>Карманы:</td><td>${escapeHtml(chars.pockets)}</td></tr>` : ''}
                    ${chars.clasp ? `<tr><td>Застёжка:</td><td>${escapeHtml(chars.clasp)}</td></tr>` : ''}
                    ${chars.length ? `<tr><td>Длина изделия:</td><td>${escapeHtml(chars.length)}</td></tr>` : ''}
                    ${chars.silhouette ? `<tr><td>Силуэт:</td><td>${escapeHtml(chars.silhouette)}</td></tr>` : ''}
                    ${chars.features ? `<tr><td>Особенности:</td><td>${escapeHtml(chars.features)}</td></tr>` : ''}
                    ${chars.care ? `<tr><td>Уход:</td><td>${escapeHtml(chars.care)}</td></tr>` : ''}
                    ${chars.set ? `<tr><td>Комплектация:</td><td>${escapeHtml(chars.set)}</td></tr>` : ''}
                    ${chars.tnved ? `<tr><td>ТН ВЭД:</td><td>${escapeHtml(chars.tnved)}</td></tr>` : ''}
                    ${chars.country ? `<tr><td>Страна:</td><td>${escapeHtml(chars.country)}</td></tr>` : ''}
                </table>
            </div>
        `;
    }
    
    // Габариты упаковки
    let packagingHtml = '';
    const packaging = product.packaging || {};
    if (packaging.length || packaging.width || packaging.height || packaging.weight) {
        packagingHtml = `
            <div class="quick-view-packaging">
                <h4>📦 Габариты упаковки</h4>
                <div class="packaging-grid">
                    ${packaging.length ? `<div><strong>Длина:</strong> ${packaging.length} см</div>` : ''}
                    ${packaging.width ? `<div><strong>Ширина:</strong> ${packaging.width} см</div>` : ''}
                    ${packaging.height ? `<div><strong>Высота:</strong> ${packaging.height} см</div>` : ''}
                    ${packaging.weight ? `<div><strong>Вес:</strong> ${packaging.weight} кг</div>` : ''}
                </div>
            </div>
        `;
    }
    
    // Ярлыки (теги)
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
                            <span class="reviews-count">(${product.reviews_count || 0} отзывов)</span>
                        </div>
                        
                        <div class="product-sizes-info">
                            <strong>📏 Размеры в наличии:</strong>
                            <div class="sizes-list">
                                ${product.sizes && product.sizes.length ? 
                                    product.sizes.map(s => `<span class="size-option">${escapeHtml(s)}</span>`).join('') : 
                                    '<span>—</span>'
                                }
                            </div>
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
                        
                        ${characteristicsHtml}
                        ${packagingHtml}
                        
                        <div class="product-article" style="margin-top: 1rem; font-size: 0.75rem; color: #94a3b8;">
                            Артикул: ${product.article || '—'}
                        </div>
                        
                        <button class="quick-view-add" onclick="addToCartById(${product.id}); closeQuickView();">
                            🛒 Добавить в корзину
                        </button>
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
    initQuickViewGallery();
}

function initQuickViewGallery() {
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
    loadProductsFromCRM();
    initMobileMenu();
    initVoiceSearch();
    initViewSwitcher();
    initButtons();
    initMascot();
    initSnackbar();
    initCart();
});
