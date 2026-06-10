// ==================== ШАПКА ====================
document.addEventListener('DOMContentLoaded', function() {
    // --- Мобильное меню ---
    const burger = document.getElementById('burgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    const closeMenu = document.getElementById('closeMobileMenu');
    
    function toggleMenu() {
        if (!mobileMenu || !overlay) return;
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        if (burger) burger.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }
    
    if (burger && mobileMenu && overlay) {
        burger.addEventListener('click', toggleMenu);
    }
    if (closeMenu && mobileMenu && overlay) {
        closeMenu.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
    }
    
    // --- Мобильный поиск ---
    const mobileSearchIcon = document.getElementById('mobileSearchIcon');
    const mobileSearch = document.getElementById('mobileSearch');
    const closeSearch = document.getElementById('closeMobileSearch');
    
    if (mobileSearchIcon && mobileSearch) {
        mobileSearchIcon.addEventListener('click', function() {
            mobileSearch.classList.add('active');
            const input = document.getElementById('mobileSearchInput');
            if (input) input.focus();
        });
    }
    if (closeSearch && mobileSearch) {
        closeSearch.addEventListener('click', function() {
            mobileSearch.classList.remove('active');
        });
    }
    
    // --- Синхронизация поиска ---
    const desktopSearch = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    
    if (desktopSearch && mobileSearchInput) {
        desktopSearch.addEventListener('input', function() {
            mobileSearchInput.value = this.value;
        });
        mobileSearchInput.addEventListener('input', function() {
            desktopSearch.value = this.value;
        });
    }
    
    // --- Корзина ---
    const cartBtn = document.getElementById('cartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const overlayCart = document.getElementById('overlay');
    
    if (cartBtn && cartSidebar && overlayCart) {
        cartBtn.addEventListener('click', function() {
            cartSidebar.classList.add('open');
            overlayCart.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeCart && cartSidebar && overlayCart) {
        closeCart.addEventListener('click', function() {
            cartSidebar.classList.remove('open');
            overlayCart.classList.remove('active');
            document.body.style.overflow = '';
        });
        overlayCart.addEventListener('click', function() {
            cartSidebar.classList.remove('open');
            overlayCart.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    console.log('✅ Шапка инициализирована');
});
