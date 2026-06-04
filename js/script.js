// ===== ТОВАРЫ =====
let allProducts = [];
let categories = [];
let currentCategory = 'all';
let currentSearch = '';

function loadProductsFromCRM() {
    const saved = localStorage.getItem('crm_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            allProducts = data.products || [];
            categories = data.categories || [];
        } catch(e) {
            console.error('Ошибка загрузки товаров', e);
        }
    }
    
    // Демо-товары, если в CRM пусто
    if (allProducts.length === 0) {
        allProducts = [
            { id: 1, title: 'Халат Aqua', price: 3490, discount_price: null, category_id: 1, sizes: ['S','M','L'], emoji: '👩‍⚕️💙' },
            { id: 2, title: 'Костюм Wave', price: 5290, discount_price: 3990, category_id: 1, sizes: ['XS','S','M','L','XL'], emoji: '👨‍⚕️💙' },
            { id: 3, title: 'Скраб Ocean', price: 4490, discount_price: null, category_id: 1, sizes: ['S','M','L'], emoji: '🥼💙' },
            { id: 4, title: 'Брюки Breeze', price: 2290, discount_price: null, category_id: 1, sizes: ['28','30','32','34'], emoji: '👖💙' },
            { id: 5, title: 'Туника Pearl', price: 2990, discount_price: 2490, category_id: 1, sizes: ['S','M','L'], emoji: '👚💙' },
            { id: 6, title: 'Футболка Fresh', price: 1990, discount_price: null, category_id: 1, sizes: ['S','M','L','XL'], emoji: '👕💙' }
        ];
        categories = [{ id: 1, title: 'Одежда' }];
    }
    
    renderFilters();
    renderProducts();

    // 3D-эффект при наведении на карточку (как в STOCKX)
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

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    const filtered = getFilteredProducts();
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="loading-message">😔 Товары не найдены</div>';
        return;
    }
    
    grid.innerHTML = filtered.map(p => {
        const category = categories.find(c => c.id == p.category_id);
        const hasDiscount = p.discount_price && p.discount_price < p.price;
        const sizesText = p.sizes ? p.sizes.join(', ') : '—';
        
        return `
            <div class="product-card">
                <div class="product-img">${p.emoji || '👕'}</div>
                <div class="product-info">
                    <div class="product-title">${escapeHtml(p.title)}</div>
                    <div class="product-category">${category ? escapeHtml(category.title) : ''}</div>
                    <div class="product-sizes">📏 Размеры: ${sizesText}</div>
                    <div class="product-price">
                        ${hasDiscount ? 
                            `<span>${p.discount_price.toLocaleString()} ₽</span>
                             <span class="product-price-old">${p.price.toLocaleString()} ₽</span>` :
                            `<span>${p.price.toLocaleString()} ₽</span>`
                        }
                    </div>
                    <button class="add-to-cart" data-id="${p.id}">В корзину</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderFilters() {
    const container = document.getElementById('filterCategories');
    if (!container) return;
    
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

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
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
            // Обновляем поиск в каталоге
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

// ===== ВИДЖЕТ: МАСКОТ =====
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

// ===== ВИДЖЕТ: СНЕЙК-БАР =====
function initSnackbar() {
    const snackbar = document.getElementById('snackbar');
    const closeBtn = document.getElementById('closeSnackbar');
    
    if (snackbar && !localStorage.getItem('snackbarClosed')) {
        setTimeout(() => {
            snackbar.classList.add('show');
        }, 2000);
        
        setTimeout(() => {
            snackbar.classList.remove('show');
        }, 8000);
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
});

// ===== ГЕНЕРАЦИЯ СЛУЧАЙНОГО РЕЙТИНГА =====
function getRandomRating() {
    return (3 + Math.random() * 2).toFixed(1); // от 3.0 до 5.0
}

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

// ===== ОБНОВЛЁННАЯ ФУНКЦИЯ РЕНДЕРА ТОВАРОВ =====
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
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
        
        return `
            <div class="product-card" data-id="${p.id}" style="--index: ${idx}">
                ${hasDiscount ? `<div class="discount-badge">-${discountPercent}%</div>` : ''}
                <div class="product-img">${p.emoji || '👕'}</div>
                <div class="product-info">
                    <div class="product-title">${escapeHtml(p.title)}</div>
                    <div class="product-category">${category ? escapeHtml(category.title) : ''}</div>
                    <div class="product-sizes">📏 Размеры: ${p.sizes ? p.sizes.join(', ') : 'S, M, L, XL'}</div>
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
                        <button class="action-icon quick-view" data-id="${p.id}" title="Быстрый просмотр">
                            👁️
                        </button>
                        <button class="action-icon add-to-cart" data-id="${p.id}" title="В корзину">
                            🛒
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Навешиваем обработчики
    attachProductEvents();
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ ДЛЯ ТОВАРОВ =====
function attachProductEvents() {
    // Быстрый просмотр
    document.querySelectorAll('.quick-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            openQuickView(id);
        });
    });
    
    // Добавление в корзину
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

// ===== ДОБАВЛЕНИЕ В КОРЗИНУ =====
function addToCartById(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
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

// ===== БЫСТРЫЙ ПРОСМОТР ТОВАРА =====
function openQuickView(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const category = categories.find(c => c.id == product.category_id);
    const hasDiscount = product.discount_price && product.discount_price < product.price;
    const discountPercent = hasDiscount ? Math.round((1 - product.discount_price / product.price) * 100) : 0;
    const rating = product.rating || getRandomRating();
    const sizes = product.sizes ? product.sizes.join(', ') : 'S, M, L, XL';
    
    const modalHtml = `
        <div class="quick-view-modal active" id="quickViewModal">
            <div class="quick-view-content">
                <button class="quick-view-close" onclick="closeQuickView()">&times;</button>
                <div class="quick-view-body">
                    <div class="quick-view-image">
                        <div style="font-size: 8rem;">${product.emoji || '👕'}</div>
                    </div>
                    <div class="quick-view-info">
                        <h3>${escapeHtml(product.title)}</h3>
                        <div class="category">${category ? escapeHtml(category.title) : 'Без категории'}</div>
                        <div class="product-rating">
                            <div class="stars">${renderStars(rating)}</div>
                            <span class="rating-value">${rating}</span>
                        </div>
                        <div class="prices">
                            ${hasDiscount ? 
                                `<span class="current-price discounted">${product.discount_price.toLocaleString()} ₽</span>
                                 <span class="old-price">${product.price.toLocaleString()} ₽</span>
                                 <span class="discount-percent">-${discountPercent}%</span>` :
                                `<span class="current-price">${product.price.toLocaleString()} ₽</span>`
                            }
                        </div>
                        <div class="sizes">
                            <strong>Размеры:</strong><br>
                            ${sizes.split(',').map(s => `<span class="size-badge">${s.trim()}</span>`).join('')}
                        </div>
                        <p class="description">${product.description || 'Дышащие ткани, идеальная посадка, современный дизайн. Создано для вашего комфорта.'}</p>
                        <button class="quick-view-add" onclick="addToCartById(${product.id}); closeQuickView();">
                            🛒 Добавить в корзину
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Удаляем старую модалку, если есть
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

// ===== ОБНОВЛЁННАЯ ЗАГРУЗКА ТОВАРОВ С РЕЙТИНГОМ =====
function loadProductsFromCRM() {
    const saved = localStorage.getItem('crm_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            allProducts = data.products || [];
            categories = data.categories || [];
            
            // Добавляем рейтинг, если его нет
            allProducts = allProducts.map(p => ({
                ...p,
                rating: p.rating || getRandomRating()
            }));
        } catch(e) {
            console.error('Ошибка загрузки товаров', e);
        }
    }
    
    // Демо-товары, если в CRM пусто
    if (allProducts.length === 0) {
        allProducts = [
            { id: 1, title: 'Халат Aqua', price: 3490, discount_price: null, category_id: 1, sizes: ['S','M','L'], emoji: '👩‍⚕️💙', rating: 4.8, description: 'Мягкий халат из дышащей ткани' },
            { id: 2, title: 'Костюм Wave', price: 5290, discount_price: 3990, category_id: 1, sizes: ['XS','S','M','L','XL'], emoji: '👨‍⚕️💙', rating: 4.5, description: 'Современный костюм для медиков' },
            { id: 3, title: 'Скраб Ocean', price: 4490, discount_price: null, category_id: 1, sizes: ['S','M','L'], emoji: '🥼💙', rating: 4.9, description: 'Удобный скраб для процедур' },
            { id: 4, title: 'Брюки Breeze', price: 2290, discount_price: null, category_id: 1, sizes: ['28','30','32','34'], emoji: '👖💙', rating: 4.3, description: 'Лёгкие брюки из хлопка' },
            { id: 5, title: 'Туника Pearl', price: 2990, discount_price: 2490, category_id: 1, sizes: ['S','M','L'], emoji: '👚💙', rating: 4.7, description: 'Элегантная туника для приёмов' },
            { id: 6, title: 'Футболка Fresh', price: 1990, discount_price: null, category_id: 1, sizes: ['S','M','L','XL'], emoji: '👕💙', rating: 4.6, description: 'Дышащая футболка для работы' }
        ];
        categories = [{ id: 1, title: 'Одежда' }];
    }
    
    renderFilters();
    renderProducts();
    updateCartCount();
}

// ===== ЗАГРУЗКА КОРЗИНЫ ПРИ СТАРТЕ =====
function initCart() {
    updateCartCount();
}

// ===== ТОСТ-УВЕДОМЛЕНИЕ =====
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
