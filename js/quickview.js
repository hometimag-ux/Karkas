// ===== БЫСТРЫЙ ПРОСМОТР =====
function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
}

function openQuickView(id) {
    const product = window.allProducts ? window.allProducts.find(p => p.id === id) : null;
    if (!product) return;
    
    const category = window.categories ? window.categories.find(c => c.id == product.category_id) : null;
    const hasDiscount = product.discount_price && product.discount_price < product.price;
    const rating = product.rating || getRandomRating();
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    const img = product.images && product.images.length > 0 ? product.images[0] : null;
    const chars = product.characteristics || {};
    const pack = product.packaging || {};

    let sizesList = [];
    if (product.sizes_data && product.sizes_data.length > 0) {
        sizesList = product.sizes_data.map(s => s.size);
    } else if (product.sizes && product.sizes.length > 0) {
        sizesList = product.sizes;
    }
    
    const colors = product.colors || ['#8F9E6B', '#ffffff', '#2F5D50', '#4a708b'];
    const colorNames = product.color_names || ['оливковый', 'белый', 'тёмно-зелёный', 'синий'];
    
    const modalHtml = `
        <div class="quick-view-modal" id="quickViewModal">
            <div class="quick-view-content">
                <button class="quick-view-close">&times;</button>
                <div class="quick-view-body">
                    <div class="quick-view-left">
                        <div class="main-visual">
                            ${img ? `<img src="${img}" alt="${escapeHtml(product.title)}" style="width:100%; border-radius: 28px;">` : `<div style="font-size: 6rem;">${product.emoji || '👕'}</div>`}
                        </div>
                        <div class="status-badge">✓ в наличии | профессиональная серия</div>
                        <div class="color-swatches" id="modalColorSwatches">
                            ${colors.map((color, idx) => `
                                <div class="swatch ${idx === 0 ? 'active' : ''}" style="background: ${color}; ${color === '#ffffff' ? 'border:1px solid #ccc;' : ''}" data-color="${colorNames[idx]}"></div>
                            `).join('')}
                        </div>
                        <div style="font-size:0.7rem; margin-top:12px; color:#5b7f6a;">★ ${rating} на основе отзывов</div>
                    </div>
                    
                    <div class="quick-view-right">
                        <div class="brand">MURANO APPAREL — медицинская коллекция</div>
                        <h1>${escapeHtml(product.title)}</h1>
                        ${product.article ? `<div class="article">Артикул: ${escapeHtml(product.article)}</div>` : ''}
                        
                        <div class="rating-row">
                            <div class="stars">${stars}</div>
                            <span style="font-size:0.8rem;">${rating} · отзывы</span>
                        </div>
                        
                        <div class="price-card">
                            <div>
                                <span class="current-price">${hasDiscount ? product.discount_price.toLocaleString() : product.price.toLocaleString()} ₽</span>
                                ${hasDiscount ? `<span class="old-price">${product.price.toLocaleString()} ₽</span>` : ''}
                            </div>
                        </div>
                        
                        <div class="action-group">
                            <button class="btn-primary" id="modalBuyBtn">Добавить в корзину — ${hasDiscount ? product.discount_price.toLocaleString() : product.price.toLocaleString()} ₽</button>
                            <button class="btn-secondary" id="modalOneClickBtn">Быстрый заказ</button>
                        </div>
                        
                        <div style="font-size:0.7rem; text-align:center; color:#7f9a8a; margin-top: 1rem;">
                            ✓ гарантия 12 месяцев ✓ помощь с выбором размера
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const oldModal = document.getElementById('quickViewModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    // Инициализация событий
    const closeBtn = document.querySelector('#quickViewModal .quick-view-close');
    if (closeBtn) closeBtn.onclick = () => closeQuickView();
    
    const buyBtn = document.getElementById('modalBuyBtn');
    if (buyBtn) buyBtn.onclick = () => { 
        if (window.addToCartById) window.addToCartById(product.id); 
        closeQuickView(); 
    };
    
    const oneClickBtn = document.getElementById('modalOneClickBtn');
    if (oneClickBtn) oneClickBtn.onclick = () => showToast('📞 Оставьте номер телефона — менеджер перезвонит через 5 минут');
}

// Делаем функции глобальными
window.closeQuickView = closeQuickView;
window.openQuickView = openQuickView;
