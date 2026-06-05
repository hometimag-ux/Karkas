// ===== ШАПКА, БУРГЕР И ПОИСК =====
document.addEventListener('DOMContentLoaded', function() {
    // 1. Бургер меню
    const burgerBtn = document.getElementById('burgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    if (burgerBtn && mobileMenu && menuOverlay) {
        burgerBtn.onclick = function() {
            mobileMenu.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            this.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        };
        
        menuOverlay.onclick = function() {
            mobileMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
            if (burgerBtn) burgerBtn.classList.remove('active');
            document.body.style.overflow = '';
        };
    }
    
    // 2. Мобильный поиск
    const searchMobileIcon = document.getElementById('searchMobileIcon');
    const mobileSearch = document.getElementById('mobileSearch');
    const closeSearchBtn = document.getElementById('closeSearchBtn');
    
    if (searchMobileIcon && mobileSearch && closeSearchBtn) {
        searchMobileIcon.onclick = function() {
            mobileSearch.classList.add('active');
            const mobileInput = document.getElementById('mobileSearchInput');
            if (mobileInput) mobileInput.focus();
        };
        
        closeSearchBtn.onclick = function() {
            mobileSearch.classList.remove('active');
        };
    }
    
    // 3. Синхронизация поиска (десктоп + мобильный)
    const desktopSearch = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    
    if (desktopSearch && mobileSearchInput) {
        desktopSearch.oninput = function() {
            mobileSearchInput.value = this.value;
        };
        mobileSearchInput.oninput = function() {
            desktopSearch.value = this.value;
        };
    }
});
