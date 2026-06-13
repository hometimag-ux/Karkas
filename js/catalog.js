// ===== js/catalog.js - ИНИЦИАЛИЗАЦИЯ КАТАЛОГА =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 Каталог загружен');
    
    // Загружаем товары из CRM
    if (typeof loadProductsFromCRM === 'function') {
        loadProductsFromCRM();
    } else {
        console.warn('loadProductsFromCRM не найдена');
    }
    
    // Обновляем счётчик корзины
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    
    // Открытие модальной корзины (новая логика)
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            if (typeof openCart === 'function') {
                openCart();
            } else {
                console.error('openCart не определена');
            }
        });
    }
    
    // Поиск по каталогу
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            if (typeof currentSearch !== 'undefined') {
                window.currentSearch = e.target.value;
                if (typeof renderProducts === 'function') {
                    renderProducts();
                }
            }
        });
    }
    
    // Обработка Enter в поиске
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (typeof renderProducts === 'function') {
                    renderProducts();
                }
            }
        });
    }
    
    // Закрытие модальной корзины по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('cartModalOverlay');
            if (overlay && overlay.classList.contains('active')) {
                if (typeof closeCart === 'function') {
                    closeCart();
                }
            }
        }
    });
    
    console.log('✅ Каталог инициализирован');
});
