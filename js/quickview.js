// ===== БЫСТРЫЙ ПРОСМОТР (ПОЛНАЯ ВЕРСИЯ) =====

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
    const pack = product.packaging || {};
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

    const modalHtml = `
        <div class="quick-view-modal" id="quickViewModal">
            <div class="quick-view-content">
                <button class="quick-view-close">&times;</button>
                <div class="quick-view-body">
                    <!-- ЛЕВАЯ КОЛОНКА: ГАЛЕРЕЯ -->
                    <div class="quick-view-left">
                        <div class="main-visual">
                            ${mainImg ? `<img src="${mainImg}" alt="${escapeHtml(product.title)}" id="modalMainImage">` : `<div style="font-size: 6rem;">${product.emoji || '👕'}</div>`}
                        </div>
                        ${product.images && product.images.length > 1 ? `
                        <div class="thumbnail-list" id="modalThumbnails">
                            ${product.images.map((thumb, idx) => `
                                <div class="thumbnail ${idx === 0 ? 'active' : ''}" data-img="${escapeHtml(thumb)}">
                                    <img src="${thumb}" alt="Фото ${idx + 1}">
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                        <div class="status-badge">✓ в наличии | профессиональная серия</div>
                        <div class="color-swatches" id="modalColorSwatches">
                            ${colors.map((color, idx) => `
                                <div class="swatch ${idx === 0 ? 'active' : ''}" style="background: ${color}; ${color === '#ffffff' ? 'border:1px solid #ccc;' : ''}" data-color="${colorNames[idx]}" data-color-code="${color}"></div>
                            `).join('')}
                        </div>
                        <div class="rating-note">★ ${rating} на основе отзывов</div>
                    </div>
                    
                    <!-- ПРАВАЯ КОЛОНКА: ИНФОРМАЦИЯ -->
                    <div class="quick-view-right">
                        <div class="brand">MURANO APPAREL — медицинская коллекция</div>
                        <h1>${escapeHtml(product.title)}</h1>
                        <div class="article">Артикул: ${escapeHtml(article)}</div>
                        
                        <div class="rating-row">
                            <div class="stars">${stars}</div>
                            <span>${rating} · отзывы</span>
                            <span class="recommend-badge">98% рекомендуют</span>
                        </div>
                        
                        <div class="price-card">
                            <div>
                                <span class="current-price">${hasDiscount ? product.discount_price.toLocaleString() : product.price.toLocaleString()} ₽</span>
                                ${hasDiscount ? `<span class="old-price">${product.price.toLocaleString()} ₽</span>` : ''}
                            </div>
                            <div class="installment">Бесплатная доставка от 3 500 ₽ / рассрочка без переплаты</div>
                        </div>
                        
                        <div class="specs-grid">
                            ${chars.material ? `<span class="spec-item">🧵 ${escapeHtml(chars.material)}</span>` : ''}
                            ${chars.features ? `<span class="spec-item">💧 ${escapeHtml(chars.features)}</span>` : ''}
                            <span class="spec-item">🔄 100+ стирок</span>
                            <span class="spec-item">🧼 антибактерия</span>
                        </div>
                        
                        <!-- РАЗМЕРЫ -->
                        ${sizesList.length > 0 ? `
                        <div class="size-selector">
                            <h4>Выберите размер</h4>
                            <div class="size-buttons" id="modalSizeButtons">
                                ${sizesList.map((size, idx) => `
                                    <span data-size="${escapeHtml(size)}" class="size-btn ${idx === Math.floor(sizesList.length/2) ? 'active' : ''}">${escapeHtml(size)}</span>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        <div class="action-group">
                            <button class="btn-primary" id="modalBuyBtn">Добавить в корзину — ${hasDiscount ? product.discount_price.toLocaleString() : product.price.toLocaleString()} ₽</button>
                            <button class="btn-secondary" id="modalOneClickBtn">Быстрый заказ</button>
                        </div>
                        
                        <div class="usp-row">
                            <span>🚚 доставка 1–3 дня</span>
                            <span>🔄 обмен 14 дней</span>
                            <span>🏷️ опт от 5 шт — скидка</span>
                            <span>🧵 логотип за 48ч</span>
                        </div>
                        
                        <div class="footer-note">✓ гарантия 12 месяцев ✓ помощь с выбором размера ✓ возврат по стандартам РФ</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Вставляем модалку
    const oldModal = document.getElementById('quickViewModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';

    // Выбранные опции
    let selectedSize = document.querySelector('#quickViewModal .size-btn.active')?.dataset.size || '—';
    let selectedColor = document.querySelector('#quickViewModal .swatch.active')?.dataset.color || '—';

    // === ОБРАБОТЧИКИ ===

    // Закрытие
    const closeBtn = document.querySelector('#quickViewModal .quick-view-close');
    if (closeBtn) closeBtn.onclick = () => closeQuickView();

    // Закрытие по клику на фон
    const modalDiv = document.getElementById('quickViewModal');
    if (modalDiv) {
        modalDiv.onclick = (e) => {
            if (e.target === modalDiv) closeQuickView();
        };
    }

    // Миниатюры
    const thumbnails = document.querySelectorAll('#quickViewModal .thumbnail');
    const mainImage = document.getElementById('modalMainImage');
    if (thumbnails.length && mainImage) {
        thumbnails.forEach(thumb => {
            thumb.onclick = () => {
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                const newSrc = thumb.dataset.img;
                if (newSrc) {
                    mainImage.style.opacity = '0.5';
                    setTimeout(() => {
                        mainImage.src = newSrc;
                        setTimeout(() => {
                            mainImage.style.opacity = '1';
                        }, 50);
                    }, 100);
                }
            };
        });
    }

    // Размеры
    document.querySelectorAll('#quickViewModal .size-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('#quickViewModal .size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedSize = this.dataset.size;
        };
    });

    // Цвета
    document.querySelectorAll('#quickViewModal .swatch').forEach(sw => {
        sw.onclick = function() {
            document.querySelectorAll('#quickViewModal .swatch').forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            selectedColor = this.dataset.color;
        };
    });

    // КНОПКА "ДОБАВИТЬ В КОРЗИНУ"
    const buyBtn = document.getElementById('modalBuyBtn');
    if (buyBtn) {
        buyBtn.onclick = () => {
            const price = product.discount_price || product.price;
            if (typeof addToCartWithDetails === 'function') {
                addToCartWithDetails(product.id, product.title, price, selectedSize, selectedColor, article);
            } else if (typeof addToCartById === 'function') {
                addToCartById(product.id);
            } else {
                showToast(`✅ ${product.title} (${selectedSize}, ${selectedColor}) добавлен в корзину`);
            }
            closeQuickView();
        };
    }

    // КНОПКА "БЫСТРЫЙ ЗАКАЗ" — открывает модальное окно с формой
    const oneClickBtn = document.getElementById('modalOneClickBtn');
    if (oneClickBtn) {
        oneClickBtn.onclick = () => {
            closeQuickView();
            setTimeout(() => {
                openQuickOrderForm(product.title, selectedSize, selectedColor, article);
            }, 300);
        };
    }

    console.log('✅ Модалка готова, размер:', selectedSize, 'цвет:', selectedColor);
}

// ===== ФУНКЦИЯ ДЛЯ БЫСТРОГО ЗАКАЗА (МОДАЛЬНОЕ ОКНО) =====
function openQuickOrderForm(productTitle, size, color, article) {
    // Удаляем старую форму, если есть
    const oldForm = document.getElementById('quickOrderModal');
    if (oldForm) oldForm.remove();

    const formHtml = `
        <div class="quick-order-modal" id="quickOrderModal">
            <div class="quick-order-content">
                <div class="quick-order-header">
                    <h3>🚀 Быстрый заказ</h3>
                    <button class="quick-order-close" id="closeOrderModal">&times;</button>
                </div>
                <div class="quick-order-body">
                    <div class="order-product-info">
                        <strong>${escapeHtml(productTitle)}</strong>
                        <span>Размер: ${escapeHtml(size)}</span>
                        <span>Цвет: ${escapeHtml(color)}</span>
                        <span>Артикул: ${escapeHtml(article)}</span>
                    </div>
                    <form id="quickOrderForm">
                        <input type="text" id="orderName" placeholder="Ваше имя *" required>
                        <input type="tel" id="orderPhone" placeholder="Телефон *" required>
                        <input type="email" id="orderEmail" placeholder="Email">
                        <textarea id="orderComment" rows="2" placeholder="Комментарий к заказу"></textarea>
                        <button type="submit" class="order-submit-btn">📞 Отправить заказ</button>
                    </form>
                    <div class="order-privacy">Нажимая кнопку, вы соглашаетесь с политикой обработки данных</div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', formHtml);
    document.body.style.overflow = 'hidden';

    // Закрытие формы
    const closeForm = document.getElementById('closeOrderModal');
    const modalForm = document.getElementById('quickOrderModal');
    
    closeForm.onclick = () => {
        modalForm.remove();
        document.body.style.overflow = '';
    };
    
    modalForm.onclick = (e) => {
        if (e.target === modalForm) {
            modalForm.remove();
            document.body.style.overflow = '';
        }
    };

    // Отправка формы
    const form = document.getElementById('quickOrderForm');
    form.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('orderName')?.value.trim();
        const phone = document.getElementById('orderPhone')?.value.trim();
        const email = document.getElementById('orderEmail')?.value.trim();
        const comment = document.getElementById('orderComment')?.value.trim();

        if (!name || !phone) {
            showToast('❌ Пожалуйста, укажите имя и телефон');
            return;
        }

        // Формируем сообщение для отправки
        const orderData = {
            product: productTitle,
            size: size,
            color: color,
            article: article,
            name: name,
            phone: phone,
            email: email,
            comment: comment,
            date: new Date().toLocaleString()
        };
        
        console.log('📦 Заказ:', orderData);
        showToast(`✅ Спасибо, ${name}! Менеджер свяжется с вами в ближайшее время`);
        
        modalForm.remove();
        document.body.style.overflow = '';
    };
}
