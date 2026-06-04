// ===== ТОВАРЫ (ДЛЯ ПРИМЕРА) =====
const products = [
    { id: 1, name: "Халат Aqua", price: 3490, emoji: "👩‍⚕️💙" },
    { id: 2, name: "Костюм Wave", price: 5290, emoji: "👨‍⚕️💙" },
    { id: 3, name: "Скраб Ocean", price: 4490, emoji: "🥼💙" },
    { id: 4, name: "Брюки Breeze", price: 2290, emoji: "👖💙" },
    { id: 5, name: "Туника Pearl", price: 2990, emoji: "👚💙" },
    { id: 6, name: "Футболка Fresh", price: 1990, emoji: "👕💙" }
];

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = products.map(p => `
        <div class="product-card">
            <div class="product-img">${p.emoji}</div>
            <div class="product-info">
                <h3>${p.name}</h3>
                <div class="product-price">${p.price.toLocaleString()} ₽</div>
                <button class="add-to-cart" data-id="${p.id}">В корзину</button>
            </div>
        </div>
    `).join('');
}

// ===== ПАНЕЛЬ ПЕРЕКЛЮЧЕНИЯ ВИДА (ВРЕМЕННАЯ) =====
function setView(view) {
    const body = document.body;
    const container = document.querySelector('.container');
    const heroImage = document.querySelector('.hero-image img');
    
    if (view === 'mobile') {
        // Добавляем класс для мобильного вида
        body.classList.add('mobile-preview');
        // Ограничиваем ширину контейнера
        if (container) container.style.maxWidth = '375px';
        if (heroImage) heroImage.style.maxWidth = '100%';
    } else {
        // Убираем класс для десктопного вида
        body.classList.remove('mobile-preview');
        // Возвращаем нормальную ширину
        if (container) container.style.maxWidth = '';
        if (heroImage) heroImage.style.maxWidth = '';
    }
    
    // Обновляем активную кнопку
    const desktopBtn = document.getElementById('desktopViewBtn');
    const mobileBtn = document.getElementById('mobileViewBtn');
    if (desktopBtn) desktopBtn.classList.toggle('active', view === 'desktop');
    if (mobileBtn) mobileBtn.classList.toggle('active', view === 'mobile');
}

// ===== МОБИЛЬНОЕ МЕНЮ =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
}

// Закрытие меню при клике на ссылку
document.querySelectorAll('.mobile-nav-list a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ===== ГОЛОСОВОЙ ПОИСК =====
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
        // Здесь можно добавить логику поиска
        console.log('Поиск по голосу:', text);
    };
    recognition.onend = () => voiceBtn.classList.remove('listening');
    
    voiceBtn.addEventListener('click', () => {
        if (recognition) {
            recognition.start();
            voiceBtn.classList.add('listening');
        } else {
            alert('Голосовой поиск поддерживается в Chrome');
        }
    });
}

// ===== КНОПКИ =====
document.getElementById('desktopViewBtn')?.addEventListener('click', () => setView('desktop'));
document.getElementById('mobileViewBtn')?.addEventListener('click', () => setView('mobile'));
document.getElementById('shopNowBtn')?.addEventListener('click', () => {
    document.querySelector('.products-grid')?.scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('contactBtn')?.addEventListener('click', () => {
    alert('Форма обратной связи будет здесь');
});

renderProducts();

// ===== ВИДЖЕТ: МАСКОТ (КАПЕЛЬКА) =====
const mascot = document.getElementById('mascot');
const mascotBubble = document.getElementById('mascotBubble');

if (mascot) {
    const messages = ['💙 Привет! Я Капля!', '💚 Хотите скидку 15%?', '🌊 Напишите нам!', '💙 У нас опт от 10 штук'];
    let messageIndex = 0;
    
    mascot.addEventListener('click', () => {
        mascotBubble.textContent = messages[messageIndex % messages.length];
        messageIndex++;
        setTimeout(() => {
            if (mascotBubble.textContent !== 'Привет! Я Капля 💙') {
                mascotBubble.textContent = 'Привет! Я Капля 💙';
            }
        }, 2500);
    });
}

// ===== ВИДЖЕТ: СНЕЙК-БАР АКЦИЙ =====
const snackbar = document.getElementById('snackbar');
const closeSnackbar = document.getElementById('closeSnackbar');

if (snackbar && !localStorage.getItem('snackbarClosed')) {
    setTimeout(() => {
        snackbar.classList.add('show');
    }, 2000);
    
    setTimeout(() => {
        snackbar.classList.remove('show');
    }, 8000);
}

if (closeSnackbar) {
    closeSnackbar.addEventListener('click', () => {
        snackbar.classList.remove('show');
        localStorage.setItem('snackbarClosed', 'true');
    });
}
