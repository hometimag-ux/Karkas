// ===== БЫСТРЫЙ ПРОСМОТР (полная версия) =====

function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
}

function openQuickView(id) {
    const product = window.allProducts ? window.allProducts.find(p => p.id === id) : null;
    if (!product) {
        console.error('Товар не найден, id:', id);
        return;
    }
    
    console.log('Открываем товар:', product.title);
    
    const hasDiscount = product.discount_price && product.discount_price < product.price;
    const rating = product.rating || getRandomRating();
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    const img = product.images && product.images.length > 0 ? product.images[0] : null;
    const chars = product.characteristics || {};
    
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
    
    const article = product.article || '—';
    
    // Формируем описание
    let descriptionHtml = '';
    if (product.description) {
        descriptionHtml = `<p class="product-description">${escapeHtml(product.description)}</p>`;
    }
    
    // Характеристики
    let specsHtml = '';
    if (chars.material || chars.composition || chars.features) {
        specsHtml = `
            <div class="product-specs">
                <h4>Характеристики</h4>
                <ul>
                    ${chars.material ? `<li><strong>Состав:</strong> ${escapeHtml(chars.material)}</li>` : ''}
                    ${chars.composition ? `<li><strong>Состав:</strong> ${escapeHtml(chars.composition)}</li>` : ''}
                    ${chars.features ? `<li><strong>Особенности:</strong> ${escapeHtml(chars.features)}</li>` : ''}
                    ${chars.country ? `<li><strong>Страна производства:</strong> ${escapeHtml(chars.country)}</li>` : ''}
                </ul>
            </div>
        `;
    }
    
    const modalHtml = `
        <div class="quick-view-modal" id="quickViewModal">
            <div class="quick-view-content">
                <button class="quick-view-close">&times;</button>
                <div class="quick-view-body">
                    <!-- Левая колонка: фото -->
                    <div class="quick-view-left">
                        <div class="main-visual">
                            ${img ? `<img src="${img}" alt="${escapeHtml(product.title)}" id="modalMainImage">` : `<div style="font-size: 6rem;">${product.emoji || '👕'}</div>`}
                        </div>
                        <div class="status-badge">✓ в наличии | профессиональная серия</div>
                    </div>
                    
                    <!-- Правая колонка: информация -->
                    <div class="quick-view-right">
                        <div class="brand">MURANO APPAREL — медицинская коллекция</div>
                        <h1>${escapeHtml(product.title)}</h1>
                        <div class="article">Артикул: ${escapeHtml(article)}</div>
                        
                        <div class="rating-row">
                            <div class="stars">${stars}</div>
                            <span>${rating} · отзывы</span>
                        </div>
                        
                        <div class="price-card">
                            <div>
                                <span class="current-price">${hasDiscount ? product.discount_price.toLocaleString() : product.price.toLocaleString()} ₽</span>
                                ${hasDiscount ? `<span class="old-price">${product.price.toLocaleString()} ₽</span>` : ''}
                            </div>
                        </div>
                        
                        <!-- ОПИСАНИЕ -->
                        ${descriptionHtml}
                        
                        <!-- ХАРАКТЕРИСТИКИ -->
                        ${specsHtml}
                        
                        <!-- ВЫБОР РАЗМЕРА -->
                        ${sizesList.length > 0 ? `
                        <div class="size-selector">
                            <h4>Выберите размер <span class="required-star">*</span></h4>
                            <div class="size-buttons" id="modalSizeButtons">
                                ${sizesList.map((size, idx) => `
                                    <span data-size="${escapeHtml(size)}" class="size-btn ${idx === Math.floor(sizesList.length/2) ? 'active' : ''}">${escapeHtml(size)}</span>
                                `).join('')}
                            </div>
                        </div>
                        ` : '<input type="hidden" id="modalSelectedSize" value="—">'}
                        
                        <!-- ВЫБОР ЦВЕТА -->
                        <div class="color-selector">
                            <h4>Выберите цвет</h4>
                            <div class="color-swatches" id="modalColorSwatches">
                                ${colors.map((color, idx) => `
                                    <div class="swatch ${idx === 0 ? 'active' : ''}" style="background: ${color}; ${color === '#ffffff' ? 'border:1px solid #ccc;' : ''}" data-color="${colorNames[idx]}" data-color-code="${color}"></div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="action-group">
                            <button class="btn-primary" id="modalBuyBtn">Добавить в корзину — ${hasDiscount ? product.discount_price.toLocaleString() : product.price.toLocaleString()} ₽</button>
                            <button class="btn-secondary" id="modalOneClickBtn">Быстрый заказ</button>
                        </div>
                        
                        <div class="usp-row">
                            <span>🚚 доставка 1–3 дня</span>
                            <span>🔄 обмен 14 дней</span>
                            <span>🏷️ опт от 5 шт — скидка</span>
                        </div>
                        
                        <div class="footer-note">✓ гарантия 12 месяцев ✓ помощь с выбором размера</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const oldModal = document.getElementById('quickViewModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    // Выбранные опции
    let selectedSize = document.querySelector('#quickViewModal .size-btn.active')?.dataset.size || '—';
    let selectedColor = document.querySelector('#quickViewModal .swatch.active')?.dataset.color || '—';
    let selectedColorCode = document.querySelector('#quickViewModal .swatch.active')?.dataset.colorCode || '';
    
    // Обработчики размера
    document.querySelectorAll('#quickViewModal .size-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('#quickViewModal .size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedSize = this.dataset.size;
        };
    });
    
    // Обработчики цвета
    document.querySelectorAll('#quickViewModal .swatch').forEach(sw => {
        sw.onclick = function() {
            document.querySelectorAll('#quickViewModal .swatch').forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            selectedColor = this.dataset.color;
            selectedColorCode = this.dataset.colorCode;
        };
    });
    
    // Кнопка "В корзину"
    const buyBtn = document.getElementById('modalBuyBtn');
    if (buyBtn) {
        buyBtn.onclick = () => {
            if (typeof addToCartWithDetails === 'function') {
                addToCartWithDetails(product.id, product.title, product.discount_price || product.price, selectedSize, selectedColor, article);
            } else {
                console.error('addToCartWithDetails не определена');
            }
            closeQuickView();
        };
    }
    
    // Быстрый заказ
    const oneClickBtn = document.getElementById('modalOneClickBtn');
    if (oneClickBtn) {
        oneClickBtn.onclick = () => showToast('📞 Оставьте номер телефона — менеджер перезвонит через 5 минут');
    }
    
    // Закрытие
    const closeBtn = document.querySelector('#quickViewModal .quick-view-close');
    if (closeBtn) closeBtn.onclick = () => closeQuickView();
    
    const modalDiv = document.getElementById('quickViewModal');
    if (modalDiv) {
        modalDiv.onclick = (e) => {
            if (e.target === modalDiv) closeQuickView();
        };
    }
}
