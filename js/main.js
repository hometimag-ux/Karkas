// ===== КНОПКА "В КАТАЛОГ" (ГЕРОЙ) =====
document.addEventListener('DOMContentLoaded', function() {
    const shopNowBtn = document.getElementById('shopNowBtn');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const productsGrid = document.getElementById('productsGrid');
            if (productsGrid) {
                productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
});
