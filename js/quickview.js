// ===== ПОДСТРАХОВКА: Если utils.js не загрузился =====
if (typeof escapeHtml !== 'function') {
    window.escapeHtml = function(str) {
        if (!str) return '';
        return String(str).replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
    };
}

if (typeof showToast !== 'function') {
    window.showToast = function(msg) {
        alert(msg);
    };
}

if (typeof getRandomRating !== 'function') {
    window.getRandomRating = function() {
        return (3 + Math.random() * 2).toFixed(1);
    };
}

// ===== БЫСТРЫЙ ПРОСМОТР (СТИЛИЗОВАННЫЙ ПОД КАРТОЧКУ ТОВАРА) =====

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
    const rating = product.rating || (typeof getRandomRating === 'function' ? getRandomRating() : 4.9);
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

    const modalHtml = `
        <div class="quick-view-modal" id="quickViewModal">
            <div class="quick-view-content">
                <button class="quick-view-close">&times;</button>
                <div class="quick-view-body">
                    <!-- ЛЕВАЯ КОЛОНКА: ГАЛЕРЕЯ -->
                    <div class="quick-view-left">
                        <div class="main-visual">
                            ${mainImg ? `<img src="${mainImg}" alt="${escapeHtml(product.title)}" id="modalMainImage" style="width:100%; border-radius: 28px;">` : `<div style="font-size: 6rem;">${product.emoji || '👕'}</div>`}
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
                        
                        <div class="tabs">
                            <button class="tab-btn active" data-tab="desc">описание</button>
                            <button class="tab-btn" data-tab="specs">характеристики</button>
                            <button class="tab-btn" data-tab="reviews">отзывы</button>
                            <button class="tab-btn" data-tab="b2b">для клиник и опта</button>
                        </div>
                        
                        <div class="tab-content">
                            <div class="tab-pane active" id="desc">
                                <p>${escapeHtml(product.description || 'Профессиональная медицинская одежда, разработанная с учётом пожеланий медицинских работников. Эргономичный крой, эластичная ткань и продуманные детали.')}</p>
                                <ul class="feature-list">
                                    <li>Анатомическая посадка: не стесняет движений</li>
                                    <li>Материал «дышит», отводит влагу в течение смены</li>
                                    <li>Сохраняет форму и цвет после частых стирок (до 95°C)</li>
                                    <li>Гипоаллергенно, одобрено дерматологами</li>
                                </ul>
                            </div>
                            <div class="tab-pane" id="specs">
                                <table style="width:100%; border-collapse: collapse; font-size:0.85rem;">
                                    <tbody>
                                        ${chars.brand ? `<tr><td style="padding:6px 0;">Бренд</td><td>${escapeHtml(chars.brand)}</td>` : ''}
                                        ${chars.material ? `<tr><td style="padding:6px 0;">Состав</td><td>${escapeHtml(chars.material)}</td>` : ''}
                                        ${chars.collar ? `<tr><td style="padding:6px 0;">Воротник</td><td>${escapeHtml(chars.collar)}</td>` : ''}
                                        ${chars.sleeves ? `<tr><td style="padding:6px 0;">Рукава</td><td>${escapeHtml(chars.sleeves)}</td>` : ''}
                                        ${chars.pockets ? `<tr><td style="padding:6px 0;">Карманы</td><td>${escapeHtml(chars.pockets)}</td>` : ''}
                                        ${chars.country ? `<tr><td style="padding:6px 0;">Страна</td><td>${escapeHtml(chars.country)}</td>` : ''}
                                    </tbody>
                                </table>
                            </div>
                            <div class="tab-pane" id="reviews">
                                <div style="background:#F9FCF9; border-radius: 20px; padding: 12px; margin-bottom: 12px;">⭐ <strong>Екатерина, терапевт:</strong> «Отличное качество, комфортно в работе».</div>
                                <div style="background:#F9FCF9; border-radius: 20px; padding: 12px; margin-bottom: 12px;">⭐ <strong>Анна, заведующая:</strong> «Заказали для всего персонала — все довольны».</div>
                            </div>
                            <div class="tab-pane" id="b2b">
                                <p><strong>Преимущества для клиник, медцентров и оптовых заказчиков:</strong></p>
                                <ul class="feature-list">
                                    <li>Специальные цены при заказе от 5 штук</li>
                                    <li>Разработка лекал по индивидуальным замерам</li>
                                    <li>Нанесение логотипа (вышивка / трафарет)</li>
                                    <li>Отсрочка платежа для юридических лиц</li>
                                </ul>
                                <button class="btn-primary" id="modalB2bBtn" style="margin-top:16px; width:100%; background:#3f6e58;">📩 Запросить коммерческое предложение</button>
                            </div>
                        </div>
                        
                        <div class="lead-magnet">
                            <div><strong>📏 Как точно подобрать размер?</strong> Скачайте чек-лист примерки.</div>
                            <button class="small-outline" id="modalLeadMagnetBtn">Получить PDF</button>
                        </div>
                        
                        <div class="b2b-note">
                            <span>🏥 Корпоративным клиентам: скидка от объёма, образцы ткани бесплатно.</span>
                            <button class="small-outline" id="modalCorpBtn">Связаться с менеджером</button>
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

    // Табы
    const tabBtns = document.querySelectorAll('#quickViewModal .tab-btn');
    const panes = document.querySelectorAll('#quickViewModal .tab-pane');
    tabBtns.forEach(btn => {
        btn.onclick = () => {
            const tabId = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            panes.forEach(p => p.classList.remove('active'));
            const activePane = document.getElementById(tabId);
            if (activePane) activePane.classList.add('active');
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

    // КНОПКА "БЫСТРЫЙ ЗАКАЗ"
    const oneClickBtn = document.getElementById('modalOneClickBtn');
    if (oneClickBtn) {
        oneClickBtn.onclick = () => {
            closeQuickView();
            setTimeout(() => {
                if (typeof openQuickOrderForm === 'function') {
                    openQuickOrderForm(product.title, selectedSize, selectedColor, article, mainImg, product.discount_price || product.price);
                } else {
                    showToast('📞 Оставьте номер телефона — менеджер перезвонит через 5 минут');
                }
            }, 300);
        };
    }

    // Лид-магнит
    const leadBtn = document.getElementById('modalLeadMagnetBtn');
    if (leadBtn) leadBtn.onclick = () => showToast('📧 Чек-лист примерки отправлен на ваш email');

    // B2B кнопка
    const b2bBtn = document.getElementById('modalB2bBtn');
    if (b2bBtn) b2bBtn.onclick = () => showToast('📩 Запрос для B2B принят');

    // Корпоративная кнопка
    const corpBtn = document.getElementById('modalCorpBtn');
    if (corpBtn) corpBtn.onclick = () => showToast('📩 Свяжитесь с B2B-отделом: b2b@murano-apparel.ru');

    console.log('✅ Модалка готова, размер:', selectedSize, 'цвет:', selectedColor);
}

// ===== ФУНКЦИЯ ДЛЯ БЫСТРОГО ЗАКАЗА (МОДАЛЬНОЕ ОКНО) =====
function openQuickOrderForm(productTitle, size, color, article, productImage, productPrice) {
    const oldForm = document.getElementById('quickOrderModal');
    if (oldForm) oldForm.remove();

    const formHtml = `
        <div class="quick-order-modal" id="quickOrderModal">
            <div class="quick-order-content">
                <div class="quick-order-header">
                    <h3>🚀 Оформление заказа</h3>
                    <button class="quick-order-close" id="closeOrderModal">&times;</button>
                </div>
                <div class="quick-order-body">
                    <div class="order-product-card">
                        <div class="order-product-image">
                            ${productImage ? `<img src="${productImage}" alt="${escapeHtml(productTitle)}">` : `<div style="font-size: 3rem;">👕</div>`}
                        </div>
                        <div class="order-product-details">
                            <div class="order-product-title">${escapeHtml(productTitle)}</div>
                            <div class="order-product-price">${productPrice ? productPrice.toLocaleString() + ' ₽' : ''}</div>
                            <div class="order-product-specs">
                                <span>Размер: ${escapeHtml(size)}</span>
                                <span>Цвет: ${escapeHtml(color)}</span>
                                <span>Арт: ${escapeHtml(article)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <form id="quickOrderForm">
                        <div class="form-row">
                            <input type="text" id="orderName" placeholder="Ваше имя *" required>
                            <input type="tel" id="orderPhone" placeholder="Телефон *" required>
                        </div>
                        <input type="email" id="orderEmail" placeholder="Email (для чека)">
                        <textarea id="orderComment" rows="2" placeholder="Комментарий к заказу (адрес, пожелания)"></textarea>
                        <div class="order-total">
                            <span>К оплате:</span>
                            <strong>${productPrice ? productPrice.toLocaleString() + ' ₽' : ''}</strong>
                        </div>
                        <button type="submit" class="order-submit-btn">💳 Оплатить</button>
                    </form>
                    <div class="order-privacy">Нажимая кнопку, вы соглашаетесь с политикой обработки данных</div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', formHtml);
    document.body.style.overflow = 'hidden';

    const closeForm = document.getElementById('closeOrderModal');
    const modalForm = document.getElementById('quickOrderModal');
    
    if (closeForm) closeForm.onclick = () => { modalForm.remove(); document.body.style.overflow = ''; };
    if (modalForm) modalForm.onclick = (e) => { if (e.target === modalForm) { modalForm.remove(); document.body.style.overflow = ''; } };

    const form = document.getElementById('quickOrderForm');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('orderName')?.value.trim();
            const phone = document.getElementById('orderPhone')?.value.trim();
            if (!name || !phone) {
                if (typeof showToast === 'function') showToast('❌ Пожалуйста, укажите имя и телефон');
                return;
            }
            if (typeof showToast === 'function') showToast(`💳 Спасибо, ${name}! Ссылка на оплату отправлена на ${phone}`);
            modalForm.remove();
            document.body.style.overflow = '';
        };
    }
}
