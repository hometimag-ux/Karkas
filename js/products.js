function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) {
        console.warn('productsGrid не найден');
        return;
    }
    
    if (window.allProducts.length === 0) {
        grid.innerHTML = '<div class="loading-message">📭 Нет товаров в каталоге</div>';
        return;
    }
    
    const filtered = getFilteredProducts();
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="loading-message">🔍 Товары не найдены</div>';
        return;
    }
    
    grid.innerHTML = filtered.map(p => {
        const category = window.categories.find(c => c.id == p.category_id);
        const hasDiscount = p.discount_price && p.discount_price < p.price;
        const discountPercent = hasDiscount ? Math.round((1 - p.discount_price / p.price) * 100) : 0;
        const rating = p.rating || getRandomRating();
        const img = p.images && p.images.length > 0 ? p.images[0] : null;
        const sizesText = p.sizes ? p.sizes.join(', ') : (p.sizes_data ? p.sizes_data.map(s => s.size).join(', ') : '—');
        
        // Левая метка (скидка или тег)
        let leftBadgeHtml = '';
        if (hasDiscount) {
            leftBadgeHtml = `<div class="product-badge discount">🔥 -${discountPercent}%</div>`;
        } else if (p.tags && p.tags.length > 0) {
            if (p.tags.includes('новинка')) {
                leftBadgeHtml = `<div class="product-badge new">✨ Новинка</div>`;
            } else if (p.tags.includes('хит')) {
                leftBadgeHtml = `<div class="product-badge hit">⭐ Хит продаж</div>`;
            } else if (p.tags.includes('популярное')) {
                leftBadgeHtml = `<div class="product-badge popular">🔥 Популярное</div>`;
            }
        }
        
        // Правая метка (рейтинг)
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let starsHtml = '';
        for (let i = 0; i < fullStars; i++) starsHtml += '★';
        if (halfStar) starsHtml += '½';
        for (let i = 0; i < emptyStars; i++) starsHtml += '☆';
        
        const rightBadgeHtml = `
            <div class="product-rating-badge">
                <span class="stars">${starsHtml}</span>
                <span class="rating-value">${rating}</span>
            </div>
        `;
        
        return `
            <div class="product-card" data-id="${p.id}">
                ${leftBadgeHtml}
                ${rightBadgeHtml}
                <div class="product-img">
                    ${img ? `<img src="${img}" alt="${escapeHtml(p.title)}">` : `<div style="font-size: 4rem;">${p.emoji || '👕'}</div>`}
                </div>
                <div class="product-info">
                    <div class="product-title">${escapeHtml(p.title)}</div>
                    <div class="product-category">${category ? escapeHtml(category.title) : ''}</div>
                    <div class="product-sizes">📏 Размеры: ${sizesText}</div>
                    <div class="product-prices">
                        ${hasDiscount ? 
                            `<span class="current-price discounted">${p.discount_price.toLocaleString()} ₽</span>
                             <span class="old-price">${p.price.toLocaleString()} ₽</span>` :
                            `<span class="current-price">${p.price.toLocaleString()} ₽</span>`
                        }
                    </div>
                    <div class="product-actions">
                        <button class="quick-view" data-id="${p.id}">👁️ Быстрый просмотр</button>
                        <button class="add-to-cart" data-id="${p.id}">🛒 В корзину</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    attachProductEvents();
}
