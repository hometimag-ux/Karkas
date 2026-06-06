// ===== НОВАЯ ШАПКА =====
document.addEventListener('DOMContentLoaded', () => {
    // Мобильное меню
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    const closeMenu = document.getElementById('closeMobileMenu');

    function toggleMenu() {
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (closeMenu) closeMenu.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);

    // Модальный поиск
    const searchIcon = document.getElementById('searchIcon');
    const searchModal = document.getElementById('searchModal');
    const closeSearch = document.getElementById('closeSearchModal');

    if (searchIcon && searchModal) {
        searchIcon.addEventListener('click', () => {
            searchModal.classList.add('active');
            document.getElementById('mobileSearchInput')?.focus();
        });
    }
    if (closeSearch) {
        closeSearch.addEventListener('click', () => {
            searchModal.classList.remove('active');
        });
    }

    // Синхронизация поиска
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
});
