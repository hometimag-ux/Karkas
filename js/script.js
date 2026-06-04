// ==================================================
// 1. ГЛОБАЛЬНЫЕ ДАННЫЕ
// ==================================================
let allProducts = [];
let categories = [];
let currentCategory = 'all';
let currentSearch = '';

// ==================================================
// 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==================================================
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

// ==================================================
// 3. ЗАГРУЗКА ТОВАРОВ ИЗ CRM
// ==================================================
function loadProductsFromCRM() {
    console.log('🟢 Загрузка товаров из CRM');
    const saved = localStorage.getItem('crm_data');
    
    if (!saved) {
        console.log('⚠️ Нет данных в localStorage');
        allProducts = [];
        categories = [];
        renderProducts();
        return;
    }
    
    try {
        const data = JSON.parse(saved);
        allProducts = data.products || [];
        categories = data.categories || [];
        console.log(`✅ Загружено товаров: ${allProducts.length}, категорий: ${categories.length}`);
        
        // Логируем первый товар для отладки
        if (allProducts.length > 0) {
            console.log('📦 Первый товар:', allProducts[0]);
        }
    } catch(e) {
        console.error('❌ Ошибка загрузки товаров', e);
    }
    
    renderFilters();
    renderProducts();
}

// ==================================================
// 4. ФИЛЬТРАЦИЯ
// ==================================================
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

// ==================================================
// 5. ОТРИСОВКА ФИЛЬТРОВ
// ==================================================
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

// ==================================================
// 6. ОТРИСОВКА ТОВАРОВ (С ЦЕНАМИ ДО/ПОСЛЕ СКИДКИ)
// ==================================================
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    if (allProducts.length === 0) {
        grid.innerHTML = `<div class="loading-message">📭 Нет товаров в каталоге</div>`;
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
        
        // Берём первое фото из массива images
        const productImage = p.images && p.images.length > 0 ? p.images[0] : null;
        
        // Размеры: сначала смотрим sizes_data, потом sizes
        let sizesText = '—';
        if (p.sizes_data && p.sizes_data.length > 0) {
            sizesText = p.sizes_data.map(s => s.size).join(', ');
        } else if (p.sizes && p.sizes.length > 0) {
            sizesText = p.sizes.join(', ');
        }
        
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

// ==================================================
// 7. ОБРАБОТЧИКИ СОБЫТИЙ
// ==================================================
function attachProductEvents() {
    // Удаляем старые обработчики, чтобы не было дублей
    document.body.removeEventListener('click', productClickHandler);
    document.body.addEventListener('click', productClickHandler);
}

function productClickHandler(e) {
    // Быстрый просмотр (глазик)
    const quickViewBtn = e.target.closest('.quick-view');
    if (quickViewBtn) {
        e.stopPropagation();
        const id = parseInt(quickViewBtn.dataset.id);
        if (id && !isNaN(id)) {
            console.log('👁️ Быстрый просмотр товара ID:', id);
            openQuickView(id);
        }
        return;
    }
    
    // Добавление в корзину
    const cartBtn = e.target.closest('.add-to-cart');
    if (cartBtn) {
        e.stopPropagation();
        const id = parseInt(cartBtn.dataset.id);
        if (id && !isNaN(id)) {
            addToCartById(id);
        }
        return;
    }
}

// ==================================================
// 8. БЫСТРЫЙ ПРОСМОТР (С ГАЛЕРЕЕЙ И ХАРАКТЕРИСТИКАМИ)
// ==================================================
function openQuickView(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        console.error('❌ Товар не найден', productId);
        return;
    }
    
    console.log('🟢 Открываем быстрый просмотр для:', product.title);
    
    const category = categories.find(c => c.id == product.category_id);
    const hasDiscount = product.discount_price && product.discount_price < product.price;
    const discountPercent = hasDiscount ? Math.round((1 - product.discount_price / product.price) * 100) : 0;
    const rating = product.rating || getRandomRating();
    
    // Размеры
    let sizesText = '—';
    if (product.sizes_data && product.sizes_data.length > 0) {
        sizesText = product.sizes_data.map(s => s.size).join(', ');
    } else if (product.sizes && product.sizes.length > 0) {
        sizesText = product.sizes.join(', ');
    }
    
    // Галерея фотографий
    let galleryHtml = '';
    const productImages = product.images || [];
    
    if (productImages.length > 0) {
        galleryHtml = `
            <div class="quick-view-gallery">
                <div class="gallery-main">
                    <img id="galleryMainImg" src="${productImages[0]}" alt="${escapeHtml(product.title)}">
                </div>
                ${productImages.length > 1 ? `
                <div class="gallery-thumbs">
                    ${productImages.map((img, idx) => `
                        <div class="gallery-thumb ${idx === 0 ? 'active' : ''}" data-img="${img}">
                            <img src="${img}" alt="Фото ${idx + 1}">
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;
    } else {
        galleryHtml = `<div class="quick-view-image-placeholder"><div style="font-size: 6rem;">${product.emoji || '👕'}</div></div>`;
    }
    
    // Характеристики
    const chars = product.characteristics || {};
    let charsHtml = '';
    const charEntries = [
        { key: 'brand', label: 'Бренд', value: chars.brand },
        { key: 'material', label: 'Состав', value: chars.material },
        { key: 'collar', label: 'Воротник', value: chars.collar },
        { key: 'sleeves', label: 'Рукава', value: chars.sleeves },
        { key: 'pockets', label: 'Карманы', value: chars.pockets },
        { key: 'clasp', label: 'Застёжка', value: chars.clasp },
        { key: 'length', label: 'Длина', value: chars.length },
        { key: 'silhouette', label: 'Силуэт', value: chars.silhouette },
        { key: 'country', label: 'Страна', value: chars.country }
    ];
    
    const filteredChars = charEntries.filter(c => c.value);
    if (filteredChars.length > 0) {
        charsHtml = `
            <div class="quick-view-characteristics">
                <h4>📋 Характеристики</h4>
                <table class="chars-table">
                    ${filteredChars.map(c => `
                        <tr>
                            <td>${c.label}</td>
                            <td>${escapeHtml(c.value)}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        `;
    }
    
    // Габариты упаковки
    const packaging = product.packaging || {};
    let packagingHtml = '';
    const packEntries = [
        { key: 'length', label: 'Длина', value: packaging.length, unit: 'см' },
        { key: 'width', label: 'Ширина', value: packaging.width, unit: 'см' },
        { key: 'height', label: 'Высота', value: packaging.height, unit: 'см' },
        { key: 'weight', label: 'Вес', value: packaging.weight, unit: 'кг' }
    ];
    const filteredPack = packEntries.filter(p => p.value);
    if (filteredPack.length > 0) {
        packagingHtml = `
            <div class="quick-view-packaging">
                <h4>📦 Габариты упаковки</h4>
                <div class="packaging-grid">
                    ${filteredPack.map(p => `<div><strong>${p.label}:</strong> ${p.value} ${p.unit}</div>`).join('')}
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
                        </div>
                        <div class="product-sizes-info">
                            <strong>📏 Размеры:</strong> ${sizesText}
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
    
    // Инициализация галереи (переключение фото)
    initGalleryEvents();
}

function initGalleryEvents() {
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

// ==================================================
// 9. КОРЗИНА
// ==================================================
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
            image: (product.images && product.images[0]) ? product.images[0] : null
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

// ==================================================
// 10. ОСТАЛЬНЫЕ ВИДЖЕТЫ (маскот, снэйк-бар и т.д.)
// ==================================================
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

// ==================================================
// 11. ЗАПУСК
// ==================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🟢 DOM загружен, инициализация...');
    loadProductsFromCRM();
    initMascot();
    initSnackbar();
    initViewSwitcher();
    initMobileMenu();
    initVoiceSearch();
    initButtons();
    updateCartCount();
});
