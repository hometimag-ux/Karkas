function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    if (allProducts.length === 0) {
        grid.innerHTML = '<div class="loading-message">Нет товаров в каталоге</div>';
        return;
    }
    
    const filtered = getFilteredProducts();
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="loading-message">😔 Товары не найдены</div>';
        return;
    }
    
    grid.innerHTML = filtered.map((p, idx) => {
        const category = categories.find(c => c.id == p.category_id);
        const hasDiscount = p.discount_price && p.discount_price < p.price;
        const discountPercent = hasDiscount ? Math.round((1 - p.discount_price / p.price) * 100) : 0;
        const rating = p.rating || getRandomRating();
        const productImage = p.images?.[0];
        const sizesText = p.sizes ? p.sizes.join(', ') : (p.sizes_data?.map(s => s.size).join(', ') || '—');
        
        return `
            <div class="product-card" data-id="${p.id}" style="--index: ${idx}">
                ${hasDiscount ? `<div class="discount-badge">-${discountPercent}%</div>` : ''}
                <div class="product-img">
                    ${productImage ? 
                        `<img src="${productImage}" alt="${escapeHtml(p.title)}" style="width:100%; height:100%; object-fit:cover;">` : 
                        `<div style="font-size: 4rem;">${p.emoji || '👕'}</div>`
                    }
                </div>
                <div class="product-info">
                    <div class="product-title">${escapeHtml(p.title)}</div>
                    <div class="product-category">${category ? escapeHtml(category.title) : ''}</div>
                    <div class="product-sizes">📏 Размеры: ${sizesText}</div>
                    <div class="product-rating">
                        <div class="stars">${renderStars(rating)}</div>
                        <span class="rating-value">${rating}</span>
                    </div>
                    <div class="product-prices">
                        ${hasDiscount ? 
                            `<span class="current-price discounted">${p.discount_price.toLocaleString()} ₽</span>
                             <span class="old-price">${p.price.toLocaleString()} ₽</span>
                             <span class="discount-percent">-${discountPercent}%</span>` :
                            `<span class="current-price">${p.price.toLocaleString()} ₽</span>`
                        }
                    </div>
                    <div class="product-actions">
                        <button class="action-icon quick-view" data-id="${p.id}" title="Быстрый просмотр">👁️</button>
                        <button class="action-icon add-to-cart" data-id="${p.id}" title="В корзину">🛒</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    attachProductEvents();
}
