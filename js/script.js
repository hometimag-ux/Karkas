// ===== ОСНОВНЫЕ ДАННЫЕ И ФУНКЦИИ =====
let allProducts = [];
let categories = [];
let currentCategory = 'all';
let currentSearch = '';

// Загрузка товаров из CRM
function loadProductsFromCRM() {
    const saved = localStorage.getItem('crm_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            allProducts = data.products || [];
            categories = data.categories || [];
        } catch(e) { console.error(e); }
    }
    
    // Демо-товары, если в CRM пусто
    if (allProducts.length === 0) {
        allProducts = [
            { id: 1, title: 'Халат Aqua', price: 3490, discount_price: null, category_id: 1, sizes: ['S','M','L'], emoji: '👩‍⚕️💙' },
            { id: 2, title: 'Костюм Wave', price: 5290, discount_price: 3990, category_id: 1, sizes: ['XS','S','M','L','XL'], emoji: '👨‍⚕️💙' },
            { id: 3, title: 'Скраб Ocean', price: 4490, discount_price: null, category_id: 1, sizes: ['S','M','L'], emoji: '🥼💙' },
            { id: 4, title: 'Брюки Breeze', price: 2290, discount_price: null, category_id: 1, sizes: ['28','30','32','34'], emoji: '👖💙' }
        ];
        categories = [{ id: 1, title: 'Одежда' }];
    }
    renderFilters();
    renderProducts();
}

// Фильтрация товаров
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

// Отрисовка товаров
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

// Создание кнопок фильтров
function renderFilters() {
    const filterContainer = document.querySelector('.filter-categories');
    if (!filterContainer) return;
    
    let html = '<button class="filter-btn active" data-cat="all">Все</button>';
    categories.forEach(cat => {
        html += `<button class="filter-btn" data-cat="${cat.id}">${escapeHtml(cat.title)}</button>`;
    });
    filterContainer.innerHTML = html;
    
    // Обработчики для кнопок фильтров
    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.cat;
            renderProducts();
        });
    });
    
    // Поиск
    const searchInput = document.getElementById('catalogSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            renderProducts();
        });
    }
}

// Вспомогательная функция
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

// Блок с преимуществами и прочие эффекты (мобильное меню, голосовой поиск, виджеты)
function initWidgets() {
    // Мобильное меню
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
        document.querySelectorAll('.mobile-nav-list a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Голосовой поиск
    let recognition = null;
    const voiceBtn = document.getElementById('voiceBtn');
    const searchInput = document.getElementById('searchInput');
    if (voiceBtn && 'webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
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
            if (recognition) {
                recognition.start();
                voiceBtn.classList.add('listening');
            } else alert('Голосовой поиск поддерживается в Chrome');
        });
    }
    
    // Панель переключения вида (временная)
    const desktopBtn = document.getElementById('desktopViewBtn');
    const mobileBtn = document.getElementById('mobileViewBtn');
    if (desktopBtn && mobileBtn) {
        desktopBtn.addEventListener('click', () => setView('desktop'));
        mobileBtn.addEventListener('click', () => setView('mobile'));
    }
    
    // Кнопка "Связаться"
    const contactBtn = document.getElementById('contactBtn');
    if (contactBtn) contactBtn.addEventListener('click', () => alert('Форма обратной связи будет здесь'));
    
    // Маскот (капелька)
    const mascot = document.getElementById('mascot');
    const mascotBubble = document.getElementById('mascotBubble');
    if (mascot) {
        const messages = ['💙 Привет! Я Капля!', '💚 Хотите скидку 15%?', '🌊 Напишите нам!', '💙 У нас опт от 10 штук'];
        let idx = 0;
        mascot.addEventListener('click', () => {
            mascotBubble.textContent = messages[idx % messages.length];
            idx++;
            setTimeout(() => mascotBubble.textContent = 'Привет! Я Капля 💙', 2500);
        });
    }
    
    // Снэйк-бар акций
    const snackbar = document.getElementById('snackbar');
    const closeSnackbar = document.getElementById('closeSnackbar');
    if (snackbar && !localStorage.getItem('snackbarClosed')) {
        setTimeout(() => snackbar.classList.add('show'), 2000);
        setTimeout(() => snackbar.classList.remove('show'), 8000);
        if (closeSnackbar) closeSnackbar.addEventListener('click', () => {
            snackbar.classList.remove('show');
            localStorage.setItem('snackbarClosed', 'true');
        });
    }
    
    // Прокрутка к каталогу
    const shopBtn = document.getElementById('shopNowBtn');
    if (shopBtn) shopBtn.addEventListener('click', () => {
        document.querySelector('.products-grid')?.scrollIntoView({ behavior: 'smooth' });
    });
}

// Переключение вида (десктоп/мобильный)
function setView(view) {
    const body = document.body;
    const container = document.querySelector('.container');
    if (view === 'mobile') {
        body.classList.add('mobile-preview');
        if (container) container.style.maxWidth = '375px';
    } else {
        body.classList.remove('mobile-preview');
        if (container) container.style.maxWidth = '';
    }
    document.getElementById('desktopViewBtn').classList.toggle('active', view === 'desktop');
    document.getElementById('mobileViewBtn').classList.toggle('active', view === 'mobile');
}

// Запуск после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    loadProductsFromCRM();
    initWidgets();
});
