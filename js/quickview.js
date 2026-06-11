// ===== БЫСТРЫЙ ПРОСМОТР И БЫСТРЫЙ ЗАКАЗ =====

function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
}

function openQuickView(id) {
    const product = window.allProducts ? window.allProducts.find(p => p.id === id) : null;
    if (!product) {
        console.error('Товар не найден, id:', id);
        if (typeof showToast === 'function') showToast('Ошибка: товар не найден');
        return;
    }

    const hasDiscount = product.discount_price && product.discount_price < product.price;
    const rating = product.rating || (typeof getRandomRating === 'function' ? getRandomRating() : 4.5);
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    const mainImg = product.images && product.images.length > 0 ? product.images[0] : null;
    const chars = product.characteristics || {};
    const article = product.article || '—';

    // Размеры
    let sizesList = [];
    if (product.sizes_data && product.sizes_data.length > 0) {
        sizesList = product.sizes_data.map(s => s.size);
    } else if (product.sizes && product.sizes.length > 0) {
        sizesList = product.sizes;
    }

    // Цвета
    const colors = product.colors || ['#8F9E6B', '#ffffff', '#2F5D50', '#4a708b'];
    const colorNames = product.color_names || ['оливковый', 'белый', 'тёмно-зелёный', 'синий'];

    const modalHtml = `...`; // (здесь ваш HTML модалки, как в предыдущей версии)

    const oldModal = document.getElementById('quickViewModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';

    let selectedSize = document.querySelector('#quickViewModal .size-btn.active')?.dataset.size || '—';
    let selectedColor = document.querySelector('#quickViewModal .swatch.active')?.dataset.color || '—';

    // Обработчики (закрытие, миниатюры, размеры, цвета, табы, кнопки...)
    // ... (как в предыдущей версии)

    // Кнопка "Добавить в корзину"
    const buyBtn = document.getElementById('modalBuyBtn');
    if (buyBtn) {
        buyBtn.onclick = () => {
            const price = product.discount_price || product.price;
            if (typeof addToCartWithDetails === 'function') {
                addToCartWithDetails(product.id, product.title, price, selectedSize, selectedColor, article);
            }
            closeQuickView();
        };
    }

    // Кнопка "Быстрый заказ"
    const oneClickBtn = document.getElementById('modalOneClickBtn');
    if (oneClickBtn) {
        oneClickBtn.onclick = () => {
            closeQuickView();
            setTimeout(() => {
                openQuickOrderForm(product.title, selectedSize, selectedColor, article, mainImg, product.discount_price || product.price);
            }, 300);
        };
    }
}

function openQuickOrderForm(productTitle, size, color, article, productImage, productPrice) {
    // ... (как в предыдущей версии)
}

// Делаем глобальными
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;
