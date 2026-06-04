// Простой и надёжный скрипт для Karkas
let allProducts = [];
let categories = [];
let currentCategory = 'all';
let currentSearch = '';

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function getRandomRating() { return (3 + Math.random() * 2).toFixed(1); }

function renderStars(rating) {
    let s = '';
    for (let i = 0; i < Math.floor(rating); i++) s += '<span class="star filled">★</span>';
    if (rating % 1 >= 0.5) s += '<span class="star filled">½</span>';
    for (let i = 0; i < 5 - Math.ceil(rating); i++) s += '<span class="star">★</span>';
    return s;
}

function loadProducts() {
    const saved = localStorage.getItem('crm_data');
    if (!saved) { allProducts = []; categories = []; render(); return; }
    try {
        const data = JSON.parse(saved);
        allProducts = data.products || [];
        categories = data.categories || [];
        console.log('Товаров загружено:', allProducts.length);
    } catch(e) { console.error(e); }
    render();
}

function getFiltered() {
    let f = [...allProducts];
    if (currentCategory !== 'all') f = f.filter(p => p.category_id == currentCategory);
    if (currentSearch) f = f.filter(p => p.title.toLowerCase().includes(currentSearch.toLowerCase()));
    return f;
}

function renderFilters() {
    const c = document.getElementById('filterCategories');
    if (!c || categories.length === 0) return;
    let html = '<button class="filter-btn active" data-cat="all">Все</button>';
    categories.forEach(cat => { html += `<button class="filter-btn" data-cat="${cat.id}">${escapeHtml(cat.title)}</button>`; });
    c.innerHTML = html;
    c.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => {
            c.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.cat;
            render();
        };
    });
    const s = document.getElementById('catalogSearch');
    if (s) s.oninput = (e) => { currentSearch = e.target.value; render(); };
}

function render() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    if (allProducts.length === 0) { grid.innerHTML = '<div class="loading-message">Нет товаров</div>'; return; }
    const filtered = getFiltered();
    if (filtered.length === 0) { grid.innerHTML = '<div class="loading-message">Товары не найдены</div>'; return; }
    grid.innerHTML = filtered.map((p, idx) => {
        const cat = categories.find(c => c.id == p.category_id);
        const hasDiscount = p.discount_price && p.discount_price < p.price;
        const discPerc = hasDiscount ? Math.round((1 - p.discount_price / p.price) * 100) : 0;
        const rating = p.rating || getRandomRating();
        const img = p.images?.[0];
        const sizes = p.sizes ? p.sizes.join(', ') : (p.sizes_data?.map(s => s.size).join(', ') || '—');
        return `
            <div class="product-card" data-id="${p.id}">
                ${hasDiscount ? `<div class="discount-badge">-${discPerc}%</div>` : ''}
                <div class="product-img">${img ? `<img src="${img}" alt="${escapeHtml(p.title)}">` : '<div style="font-size:4rem;">👕</div>'}</div>
                <div class="product-info">
                    <div class="product-title">${escapeHtml(p.title)}</div>
                    <div class="product-category">${cat ? escapeHtml(cat.title) : ''}</div>
                    <div class="product-sizes">📏 Размеры: ${sizes}</div>
                    <div class="product-rating"><div class="stars">${renderStars(rating)}</div><span class="rating-value">${rating}</span></div>
                    <div class="product-prices">${hasDiscount ? `<span class="current-price discounted">${p.discount_price.toLocaleString()} ₽</span><span class="old-price">${p.price.toLocaleString()} ₽</span><span class="discount-percent">-${discPerc}%</span>` : `<span class="current-price">${p.price.toLocaleString()} ₽</span>`}</div>
                    <div class="product-actions"><button class="action-icon quick-view" data-id="${p.id}" title="Быстрый просмотр">👁️</button><button class="action-icon add-to-cart" data-id="${p.id}" title="В корзину">🛒</button></div>
                </div>
            </div>
        `;
    }).join('');
    attachEvents();
}

function attachEvents() {
    document.querySelectorAll('.quick-view').forEach(btn => {
        btn.onclick = (e) => { e.stopPropagation(); const id = parseInt(btn.dataset.id); if (id) openQuick(id); };
    });
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.onclick = (e) => { e.stopPropagation(); const id = parseInt(btn.dataset.id); if (id) addToCart(id); };
    });
}

function openQuick(id) {
    const p = allProducts.find(p => p.id === id);
    if (!p) return;
    const cat = categories.find(c => c.id == p.category_id);
    const hasDiscount = p.discount_price && p.discount_price < p.price;
    const discPerc = hasDiscount ? Math.round((1 - p.discount_price / p.price) * 100) : 0;
    const rating = p.rating || getRandomRating();
    const sizes = p.sizes ? p.sizes.join(', ') : (p.sizes_data?.map(s => s.size).join(', ') || '—');
    const img = p.images?.[0];
    const chars = p.characteristics || {};
    const pack = p.packaging || {};
    const modalHtml = `
        <div class="quick-view-modal active" id="quickViewModal">
            <div class="quick-view-content">
                <button class="quick-view-close" onclick="closeQuick()">&times;</button>
                <div class="quick-view-body">
                    <div class="quick-view-left"><div class="quick-view-image">${img ? `<img src="${img}" alt="${escapeHtml(p.title)}">` : '<div style="font-size:6rem;">👕</div>'}</div></div>
                    <div class="quick-view-right">
                        <h3>${escapeHtml(p.title)}</h3>
                        <div class="category">${cat ? escapeHtml(cat.title) : 'Без категории'}</div>
                        <div class="product-rating"><div class="stars">${renderStars(rating)}</div><span class="rating-value">${rating}</span></div>
                        <div class="product-sizes-info"><strong>📏 Размеры:</strong> ${sizes}</div>
                        <div class="product-prices quick">${hasDiscount ? `<span class="current-price discounted">${p.discount_price.toLocaleString()} ₽</span><span class="old-price">${p.price.toLocaleString()} ₽</span><span class="discount-percent">-${discPerc}%</span>` : `<span class="current-price">${p.price.toLocaleString()} ₽</span>`}</div>
                        <div class="product-description"><h4>📝 Описание</h4><p>${escapeHtml(p.description || 'Нет описания')}</p></div>
                        ${chars.brand || chars.material ? `<div class="quick-view-characteristics"><h4>📋 Характеристики</h4><table class="chars-table">${chars.brand ? `<tr><th>Бренд</th><td>${escapeHtml(chars.brand)}</td></tr>` : ''}${chars.material ? `<tr><th>Состав</th><td>${escapeHtml(chars.material)}</td></tr>` : ''}${chars.collar ? `<tr><th>Воротник</th><td>${escapeHtml(chars.collar)}</td></tr>` : ''}${chars.sleeves ? `<tr><th>Рукава</th><td>${escapeHtml(chars.sleeves)}</td></tr>` : ''}${chars.silhouette ? `<tr><th>Силуэт</th><td>${escapeHtml(chars.silhouette)}</td></tr>` : ''}${chars.country ? `<tr><th>Страна</th><td>${escapeHtml(chars.country)}</td></tr>` : ''}</table></div>` : ''}
                        ${pack.length || pack.width || pack.height || pack.weight ? `<div class="quick-view-packaging"><h4>📦 Габариты упаковки</h4><div>${pack.length ? `Длина: ${pack.length} см, ` : ''}${pack.width ? `Ширина: ${pack.width} см, ` : ''}${pack.height ? `Высота: ${pack.height} см, ` : ''}${pack.weight ? `Вес: ${pack.weight} кг` : ''}</div></div>` : ''}
                        <button class="quick-view-add" onclick="addToCart(${p.id}); closeQuick();">🛒 Добавить в корзину</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    const old = document.getElementById('quickViewModal');
    if (old) old.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
}

function closeQuick() {
    const m = document.getElementById('quickViewModal');
    if (m) m.remove();
    document.body.style.overflow = '';
}

function addToCart(id) {
    const p = allProducts.find(p => p.id === id);
    if (!p) return;
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const exist = cart.find(i => i.id === id);
    if (exist) exist.quantity++;
    else cart.push({ id: p.id, title: p.title, price: p.discount_price || p.price, quantity: 1, image: p.images?.[0] || null });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`✅ ${p.title} добавлен в корзину!`);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const total = cart.reduce((s, i) => s + i.quantity, 0);
    const c = document.getElementById('cartCounter');
    if (c) c.innerText = total;
}

document.addEventListener('DOMContentLoaded', () => {
    renderFilters();
    loadProducts();
    updateCartCount();
});
window.closeQuick = closeQuick;
window.addToCart = addToCart;
