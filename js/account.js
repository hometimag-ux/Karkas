// ===== js/account.js - ЛИЧНЫЙ КАБИНЕТ (ОПТИМИЗИРОВАННЫЙ) =====

let currentTab = 'profile';
let cachedUserOrders = null;  // Кэш заказов пользователя
let cachedUserStats = null;   // Кэш статистики

// Сброс кэша при изменении данных
function clearUserCache() {
    cachedUserOrders = null;
    cachedUserStats = null;
}

// Нормализация телефона
function normalizePhone(phone) {
    if (!phone) return '';
    const cleaned = String(phone).replace(/[^0-9]/g, '');
    if (cleaned.length === 11 && cleaned[0] === '7') {
        return cleaned;
    }
    if (cleaned.length === 10) {
        return '7' + cleaned;
    }
    return cleaned;
}

function formatPhone(phone) {
    const str = normalizePhone(phone);
    if (str.length === 11 && str[0] === '7') {
        return `+7 ${str.slice(1,4)} ${str.slice(4,7)}-${str.slice(7,9)}-${str.slice(9,11)}`;
    }
    return phone;
}

function getStatusText(status) {
    const map = { 'new': '🆕 Новый', 'paid': '💳 Оплачен', 'shipped': '📦 Отправлен', 'delivered': '✅ Доставлен', 'cancelled': '❌ Отменён' };
    return map[status] || status;
}

function getCurrentUser() {
    const savedPhone = localStorage.getItem('current_user_phone');
    if (!savedPhone) return null;
    
    const userKey = `user_${normalizePhone(savedPhone)}`;
    const user = localStorage.getItem(userKey);
    if (user) {
        return JSON.parse(user);
    }
    return null;
}

// ОПТИМИЗИРОВАННАЯ: заказы пользователя (с кэшем)
function getUserOrders(forceRefresh = false) {
    if (forceRefresh) clearUserCache();
    
    if (cachedUserOrders !== null) {
        return cachedUserOrders;  // Возвращаем кэш
    }
    
    const user = getCurrentUser();
    if (!user) return [];
    
    const userPhone = normalizePhone(user.phone);
    console.log('🔍 Поиск заказов для телефона:', userPhone);
    
    const saved = localStorage.getItem('crm_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            const allOrders = data.orders || [];
            
            cachedUserOrders = allOrders.filter(order => {
                const orderPhone = normalizePhone(order.customer?.phone);
                return orderPhone === userPhone;
            });
            
            console.log(`📦 Найдено заказов: ${cachedUserOrders.length} (кэшировано)`);
            return cachedUserOrders;
        } catch(e) {
            console.error('Ошибка загрузки заказов:', e);
        }
    }
    return [];
}

// ОПТИМИЗИРОВАННАЯ: статистика (с кэшем)
function getUserStats(forceRefresh = false) {
    if (forceRefresh) clearUserCache();
    
    if (cachedUserStats !== null) {
        return cachedUserStats;
    }
    
    const orders = getUserOrders();
    const totalSpent = orders.reduce((sum, order) => {
        if (order.status === 'paid' || order.status === 'delivered') {
            return sum + (order.total || 0);
        }
        return sum;
    }, 0);
    
    const bonuses = Math.floor(totalSpent * 0.05);
    cachedUserStats = { totalSpent, bonuses };
    return cachedUserStats;
}

// При обновлении профиля или добавлении заказа — сбрасываем кэш
function updateUserProfile(updates) {
    const user = getCurrentUser();
    if (!user) return false;
    
    Object.assign(user, updates);
    const userKey = `user_${user.phone}`;
    localStorage.setItem(userKey, JSON.stringify(user));
    
    clearUserCache();  // Сбрасываем кэш
    showToast('✅ Профиль обновлён');
    return true;
}

// ===== ИЗБРАННОЕ =====
function getWishlist() {
    const user = getCurrentUser();
    if (!user) return [];
    const key = `wishlist_${user.id}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
}

function saveWishlist(wishlist) {
    const user = getCurrentUser();
    if (!user) return;
    const key = `wishlist_${user.id}`;
    localStorage.setItem(key, JSON.stringify(wishlist));
}

function addToWishlist(productId) {
    const wishlist = getWishlist();
    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        saveWishlist(wishlist);
        showToast('❤️ Товар добавлен в избранное');
        return true;
    }
    return false;
}

function removeFromWishlist(productId) {
    let wishlist = getWishlist();
    wishlist = wishlist.filter(id => id !== productId);
    saveWishlist(wishlist);
    showToast('🗑️ Товар удалён из избранного');
}

function isInWishlist(productId) {
    const wishlist = getWishlist();
    return wishlist.includes(productId);
}

function getWishlistProducts() {
    const wishlist = getWishlist();
    if (!window.allProducts) return [];
    return window.allProducts.filter(p => wishlist.includes(p.id));
}

// ===== БОНУСЫ =====
function getBonusHistory() {
    const user = getCurrentUser();
    if (!user) return [];
    return JSON.parse(localStorage.getItem(`bonus_history_${user.id}`) || '[]');
}

// ===== ОТРИСОВКА КАБИНЕТА =====
function renderAccount() {
    const user = getCurrentUser();
    const container = document.getElementById('accountContainer');
    
    if (!user) {
        container.innerHTML = `
            <div class="login-container">
                <h2>🔐 Вход в личный кабинет</h2>
                <p>Введите номер телефона и пароль</p>
                <div id="loginError" class="error-msg" style="display:none;"></div>
                <input type="tel" id="loginPhone" class="login-input" placeholder="+7 (906) 377-19-85">
                <input type="password" id="loginPassword" class="login-input" placeholder="Пароль">
                <button class="login-btn" onclick="loginWithPassword()">Войти</button>
                <div class="test-credentials">
                    <strong>📱 Тестовые данные:</strong><br>
                    Телефон: +7 906 377 19 85<br>
                    Пароль: 888999
                </div>
            </div>
        `;
        return;
    }
    
    const stats = getUserStats();
    const orders = getUserOrders();
    const wishlistCount = getWishlist().length;
    
    container.innerHTML = `
        <div class="account-header">
            <h1 class="account-title">👤 Личный кабинет</h1>
            <button class="logout-btn" id="logoutBtn">🚪 Выйти</button>
        </div>
        
        <div class="bonus-card">
            <div><div class="bonus-amount">${stats.bonuses.toLocaleString()} ₽</div><div class="bonus-rate">накоплено бонусов</div></div>
            <div><div class="bonus-amount">${stats.totalSpent.toLocaleString()} ₽</div><div class="bonus-rate">потрачено всего</div></div>
            <div><div>🎁 5% бонусами с каждого заказа</div></div>
        </div>
        
        <div class="account-tabs">
            <button class="tab-btn ${currentTab === 'profile' ? 'active' : ''}" data-tab="profile">👤 Профиль</button>
            <button class="tab-btn ${currentTab === 'orders' ? 'active' : ''}" data-tab="orders">📦 Мои заказы (${orders.length})</button>
            <button class="tab-btn ${currentTab === 'wishlist' ? 'active' : ''}" data-tab="wishlist">❤️ Избранное (${wishlistCount})</button>
            <button class="tab-btn ${currentTab === 'bonuses' ? 'active' : ''}" data-tab="bonuses">💰 Бонусы</button>
        </div>
        
        <div id="tab-profile" class="tab-content ${currentTab === 'profile' ? 'active' : ''}">
            <div class="profile-form">
                <div class="form-group"><label>Имя</label><input type="text" id="profileName" value="${escapeHtml(user.name || '')}"></div>
                <div class="form-group"><label>Телефон</label><input type="tel" id="profilePhone" value="${formatPhone(user.phone)}" readonly></div>
                <div class="form-group"><label>Email</label><input type="email" id="profileEmail" value="${escapeHtml(user.email || '')}"></div>
                <div class="form-group"><label>Адрес доставки по умолчанию</label><textarea id="profileAddress" rows="2">${escapeHtml(user.default_address || '')}</textarea></div>
                <button class="save-btn" id="saveProfileBtn">💾 Сохранить изменения</button>
            </div>
        </div>
        
        <div id="tab-orders" class="tab-content ${currentTab === 'orders' ? 'active' : ''}">
            <div class="orders-list" id="ordersList"></div>
        </div>
        
        <div id="tab-wishlist" class="tab-content ${currentTab === 'wishlist' ? 'active' : ''}">
            <div class="wishlist-grid" id="wishlistGrid"></div>
        </div>
        
        <div id="tab-bonuses" class="tab-content ${currentTab === 'bonuses' ? 'active' : ''}">
            <div class="bonus-history" id="bonusHistory"></div>
        </div>
    `;
    
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('current_user_phone');
        clearUserCache();
        location.reload();
    });
    document.getElementById('saveProfileBtn')?.addEventListener('click', saveProfile);
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentTab = btn.dataset.tab;
            renderAccount();
        });
    });
    
    renderUserOrders();
    renderWishlistGrid();
    renderBonusHistory();
}

function saveProfile() {
    const name = document.getElementById('profileName')?.value || '';
    const email = document.getElementById('profileEmail')?.value || '';
    const address = document.getElementById('profileAddress')?.value || '';
    
    updateUserProfile({ name, email, default_address: address });
    renderAccount();
}

function renderUserOrders() {
    const orders = getUserOrders();
    const container = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">📭 У вас пока нет заказов</div>';
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="order-card" onclick="viewOrderDetails('${order.order_id}')">
            <div class="order-header">
                <span class="order-number">📋 ${order.order_id}</span>
                <span class="order-date">📅 ${order.date || '—'}</span>
                <span class="order-status status-${order.status || 'new'}">${getStatusText(order.status)}</span>
                <span class="order-total">${(order.total || 0).toLocaleString()} ₽</span>
            </div>
            <div class="order-products">
                ${(order.items || []).map(i => `${i.title} x${i.quantity}`).join(', ')}
            </div>
        </div>
    `).join('');
}

function renderWishlistGrid() {
    const wishlistProducts = getWishlistProducts();
    const container = document.getElementById('wishlistGrid');
    
    if (wishlistProducts.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">❤️ Нет товаров в избранном</div>';
        return;
    }
    
    container.innerHTML = wishlistProducts.map(product => `
        <div class="wishlist-item">
            <button class="wishlist-remove" onclick="removeFromWishlist(${product.id}); renderAccount();">🗑️</button>
            <div class="wishlist-item-img">
                ${product.images?.[0] ? `<img src="${product.images[0]}">` : '👕'}
            </div>
            <div class="wishlist-item-info">
                <div class="wishlist-item-title">${escapeHtml(product.title)}</div>
                <div class="wishlist-item-price">${(product.discount_price || product.price).toLocaleString()} ₽</div>
                <button class="save-btn" style="margin-top:10px; width:100%;" onclick="addToCartById(${product.id});">🛒 В корзину</button>
            </div>
        </div>
    `).join('');
}

function renderBonusHistory() {
    const user = getCurrentUser();
    const orders = getUserOrders();
    
    const history = orders.filter(o => o.status === 'paid' || o.status === 'delivered').map(order => ({
        date: order.date,
        amount: Math.floor((order.total || 0) * 0.05),
        reason: `Заказ ${order.order_id}`,
        balance: 0
    })).reverse();
    
    let balance = 0;
    const historyWithBalance = history.map(item => {
        balance += item.amount;
        return { ...item, balance };
    }).reverse();
    
    const container = document.getElementById('bonusHistory');
    
    if (historyWithBalance.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">💰 История начислений пуста</div>';
        return;
    }
    
    container.innerHTML = `
        <div style="background:white; border-radius:20px; overflow:hidden;">
            <table style="width:100%; border-collapse:collapse;">
                <thead><tr style="background:#f8fafc;"><th style="padding:12px;">Дата</th><th>Сумма</th><th>Описание</th><th>Баланс</th></tr></thead>
                <tbody>
                    ${historyWithBalance.map(h => `
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:12px;">${new Date(h.date).toLocaleDateString()}</td>
                            <td style="padding:12px; color:#00897b;">+${h.amount} ₽</td>
                            <td style="padding:12px;">${escapeHtml(h.reason)}</td>
                            <td style="padding:12px;">${h.balance} ₽</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function viewOrderDetails(orderId) {
    const order = getUserOrders().find(o => o.order_id === orderId);
    if (!order) return;
    alert(`📋 Заказ ${order.order_id}\n💰 Сумма: ${order.total} ₽\n📊 Статус: ${getStatusText(order.status)}`);
}

function loginWithPassword() {
    const phone = document.getElementById('loginPhone')?.value || '';
    const password = document.getElementById('loginPassword')?.value || '';
    const TEST_PASSWORD = '888999';
    
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const normalizedPhone = cleanPhone.length === 10 ? '7' + cleanPhone : cleanPhone;
    
    if (password !== TEST_PASSWORD) {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.innerText = '❌ Неверный пароль';
            errorDiv.style.display = 'block';
        }
        return;
    }
    
    if (normalizedPhone.length !== 11) {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.innerText = '❌ Неверный формат телефона';
            errorDiv.style.display = 'block';
        }
        return;
    }
    
    const userKey = `user_${normalizedPhone}`;
    let user = localStorage.getItem(userKey);
    
    if (!user) {
        user = {
            id: Date.now(),
            phone: normalizedPhone,
            name: '',
            email: '',
            default_address: '',
            created_at: new Date().toISOString(),
            bonuses: 0,
            total_spent: 0
        };
        localStorage.setItem(userKey, JSON.stringify(user));
    }
    
    localStorage.setItem('current_user_phone', normalizedPhone);
    clearUserCache();
    location.reload();
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

function showToast(msg) {
    let t = document.getElementById('cartToast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'cartToast';
        t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1a2c3e;color:white;padding:12px 24px;border-radius:40px;z-index:100000;font-size:14px;opacity:0;transition:0.3s';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    setTimeout(() => t.style.opacity = '0', 3000);
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderAccount();
    if (typeof updateCartCount === 'function') updateCartCount();
});
