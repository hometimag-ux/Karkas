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
