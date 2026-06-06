function openQuickView(id) {
    console.log('🔍 1. openQuickView вызвана, id:', id);
    console.log('🔍 2. allProducts:', allProducts);
    
    const product = allProducts.find(p => p.id === id);
    console.log('🔍 3. Найденный товар:', product);
    
    if (!product) {
        console.error('❌ Товар не найден! id:', id);
        showToast('Ошибка: товар не найден');
        return;
    }
    
    console.log('🔍 4. Начинаем создавать модалку для:', product.title);
    
    const category = categories.find(c => c.id == product.category_id);
    const hasDiscount = product.discount_price && product.discount_price < product.price;
    const discountPercent = hasDiscount ? Math.round((1 - product.discount_price / product.price) * 100) : 0;
    const rating = product.rating || getRandomRating();
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    const img = product.images && product.images.length > 0 ? product.images[0] : null;
    const chars = product.characteristics || {};
    const pack = product.packaging || {};

    // Размеры
    let sizesList = [];
    if (product.sizes_data && product.sizes_data.length > 0) {
        sizesList = product.sizes_data.map(s => s.size);
    } else if (product.sizes && product.sizes.length > 0) {
        sizesList = product.sizes;
    }
    
    const colors = product.colors || ['#8F9E6B', '#ffffff', '#2F5D50', '#4a708b'];
    const colorNames = product.color_names || ['оливковый', 'белый', 'тёмно-зелёный', 'синий'];
    
    console.log('🔍 5. Данные собраны, создаём HTML модалки');
    
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
                            <span style="background:#EFF6F0; padding:2px 8px; border-radius:20px; font-size:0.7rem;">98% рекомендуют</span>
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
                            <button class="tab-btn" data-tab="packaging">упаковка</button>
                            <button class="tab-btn" data-tab="b2b">для клиник и опта</button>
                        </div>
                        
                        <div class="tab-content">
                            <div class="tab-pane active" id="desc">
                                <p>${escapeHtml(product.description || 'Профессиональная медицинская одежда...')}</p>
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
                                        ${chars.brand ? `<tr><td style="padding:6px 0;">Бренд</td><td>${escapeHtml(chars.brand)}</td></tr>` : ''}
                                        ${chars.material ? `<tr><td style="padding:6px 0;">Состав</td><td>${escapeHtml(chars.material)}</td></tr>` : ''}
                                        ${chars.collar ? `<tr><td style="padding:6px 0;">Воротник</td><td>${escapeHtml(chars.collar)}</td></tr>` : ''}
                                        ${chars.sleeves ? `<tr><td style="padding:6px 0;">Рукава</td><td>${escapeHtml(chars.sleeves)}</td></tr>` : ''}
                                        ${chars.pockets ? `<tr><td style="padding:6px 0;">Карманы</td><td>${escapeHtml(chars.pockets)}</td></tr>` : ''}
                                        ${chars.clasp ? `<tr><td style="padding:6px 0;">Застёжка</td><td>${escapeHtml(chars.clasp)}</td></tr>` : ''}
                                        ${chars.length ? `<tr><td style="padding:6px 0;">Длина</td><td>${escapeHtml(chars.length)}</td></tr>` : ''}
                                        ${chars.silhouette ? `<tr><td style="padding:6px 0;">Силуэт</td><td>${escapeHtml(chars.silhouette)}</td></tr>` : ''}
                                        ${chars.country ? `<tr><td style="padding:6px 0;">Страна</td><td>${escapeHtml(chars.country)}</td></tr>` : ''}
                                    </tbody>
                                </table>
                            </div>
                            <div class="tab-pane" id="packaging">
                                <div class="packaging-grid">
                                    ${pack.length ? `<div>📏 Длина: ${pack.length} см</div>` : ''}
                                    ${pack.width ? `<div>📐 Ширина: ${pack.width} см</div>` : ''}
                                    ${pack.height ? `<div>📦 Высота: ${pack.height} см</div>` : ''}
                                    ${pack.weight ? `<div>⚖️ Вес: ${pack.weight} кг</div>` : ''}
                                </div>
                            </div>
                            <div class="tab-pane" id="b2b">
                                <p><strong>Преимущества для клиник, медцентров и оптовых заказчиков:</strong></p>
                                <ul class="feature-list">
                                    <li>Специальные цены при заказе от 5 штук</li>
                                    <li>Разработка лекал по индивидуальным замерам</li>
                                    <li>Нанесение логотипа (вышивка / трафарет)</li>
                                    <li>Подготовка документов для тендеров</li>
                                    <li>Отсрочка платежа для юридических лиц</li>
                                </ul>
                                <button class="btn-primary" id="modalB2bBtn" style="margin-top:16px; width:100%; background:#3f6e58;">📩 Запросить коммерческое предложение</button>
                            </div>
                        </div>
                        
                        <div class="lead-magnet">
                            <div><span style="font-weight:700;">📏 Как точно подобрать размер?</span> Скачайте чек-лист примерки.</div>
                            <button class="small-outline" id="modalLeadMagnetBtn">Получить PDF</button>
                        </div>
                        
                        <div class="b2b-note">
                            <span>🏥 Корпоративным клиентам: скидка от объёма, образцы ткани бесплатно.</span>
                            <button class="small-outline" id="modalCorpBtn">Связаться с менеджером</button>
                        </div>
                        
                        <div style="font-size:0.7rem; text-align:center; color:#7f9a8a;">✓ гарантия 12 месяцев ✓ помощь с выбором размера ✓ возврат по стандартам РФ</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Удаляем старую модалку и вставляем новую
    const oldModal = document.getElementById('quickViewModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
    
    console.log('🔍 6. Модалка вставлена в DOM');
    
    // ===== ИНИЦИАЛИЗАЦИЯ СОБЫТИЙ =====
    
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
    
    // Размеры
    document.querySelectorAll('#quickViewModal .size-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('#quickViewModal .size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        };
    });
    
    // Цвета
    document.querySelectorAll('#quickViewModal .swatch').forEach(sw => {
        sw.onclick = function() {
            document.querySelectorAll('#quickViewModal .swatch').forEach(s => s.classList.remove('active'));
            this.classList.add('active');
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
    
    // Кнопка "В корзину"
    const buyBtn = document.getElementById('modalBuyBtn');
    if (buyBtn) buyBtn.onclick = () => { 
        if (window.addToCartById) window.addToCartById(product.id); 
        closeQuickView(); 
    };
    
    // Быстрый заказ
    const oneClickBtn = document.getElementById('modalOneClickBtn');
    if (oneClickBtn) oneClickBtn.onclick = () => showToast('📞 Оставьте номер телефона — менеджер перезвонит через 5 минут');
    
    // Лид-магнит
    const leadBtn = document.getElementById('modalLeadMagnetBtn');
    if (leadBtn) leadBtn.onclick = () => showToast('📧 Чек-лист примерки отправлен на ваш email');
    
    // B2B кнопка
    const b2bBtn = document.getElementById('modalB2bBtn');
    if (b2bBtn) b2bBtn.onclick = () => showToast('📩 Запрос для B2B принят');
    
    // Корпоративная кнопка
    const corpBtn = document.getElementById('modalCorpBtn');
    if (corpBtn) corpBtn.onclick = () => showToast('📩 Свяжитесь с B2B-отделом: b2b@murano-apparel.ru');
    
    console.log('🔍 7. Все обработчики навешены, модалка должна работать');
}
