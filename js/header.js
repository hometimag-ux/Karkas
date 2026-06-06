// ===== НОВАЯ ЛОГИКА ДЛЯ ШАПКИ =====
document.addEventListener('DOMContentLoaded', () => {
    // --- Бургер-меню ---
    const burger = document.getElementById('burgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileMenuOverlay');
    const closeMenuBtn = document.getElementById('closeMobileMenu');

    function toggleMenu() {
        mobileMenu.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        burger.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    if (burger) burger.addEventListener('click', toggleMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', toggleMenu);

    // --- Мобильный поиск ---
    const mobileSearchIcon = document.getElementById('mobileSearchIcon');
    const mobileSearch = document.getElementById('mobileSearch');
    const closeMobileSearch = document.getElementById('closeMobileSearch');

    if (mobileSearchIcon) {
        mobileSearchIcon.addEventListener('click', () => {
            mobileSearch.classList.add('active');
        });
    }
    if (closeMobileSearch) {
        closeMobileSearch.addEventListener('click', () => {
            mobileSearch.classList.remove('active');
        });
    }

    // --- Синхронизация поиска (десктоп и мобильный) ---
    const desktopSearch = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');

    if (desktopSearch && mobileSearchInput) {
        desktopSearch.addEventListener('input', () => {
            mobileSearchInput.value = desktopSearch.value;
        });
        mobileSearchInput.addEventListener('input', () => {
            desktopSearch.value = mobileSearchInput.value;
        });
    }

    // --- Корзина (открытие боковой панели) ---
    const cartBtn = document.getElementById('cartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const overlay = document.getElementById('overlay');

    if (cartBtn && cartSidebar && overlay) {
        cartBtn.addEventListener('click', () => {
            cartSidebar.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeCart && cartSidebar && overlay) {
        closeCart.addEventListener('click', () => {
            cartSidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
        overlay.addEventListener('click', () => {
            cartSidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
});
