// ===== js/account.js - ЛИЧНЫЙ КАБИНЕТ =====

let currentTab = 'profile';

function renderAccount() {
    const user = getCurrentUser();
    const container = document.getElementById('accountContainer');
    
    if (!user) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px;">
                <div style="font-size: 64px; margin-bottom: 20px;">🔐</div>
                <h2>Войдите в личный кабинет</h2>
                <p style="color: #666; margin: 20px 0;">Введите номер телефона для входа</p>
                <input type="tel" id="loginPhone" class="auth-input" style="max-width: 300px; margin: 0 auto;" placeholder="+7 (___) ___-__-__">
                <button id="startLoginBtn" class="auth-btn" style="max-width: 300px; margin: 10px auto;">Войти</button>
            </div>
        `;
        
        document.getElementById('startLoginBtn')?.addEventListener('click', () => {
            const phone = document.getElementById('loginPhone').value;
            if (phone) showAuthModal(phone);
        });
        return;
    }
    
    container.innerHTML = `
        <div class="account-header">
            <h1 class="account-title">👤 Личный кабинет</h1>
            <button class="logout-btn" id="logoutBtn">🚪 Выйти</button>
        </div>
        
        <div class="bonus-card">
            <div><div class="bonus-amount">${user.bonuses || 0} ₽</div><div class="bonus-rate">накоплено бонусов</div></div>
            <div><div class="bonus-amount">${user.total_spent?.toLocaleString() || 0} ₽</div><div class="bonus-rate">потрачено всего</div></div>
            <div><div>🎁 5% бонусами с каждого заказа</div></div>
        </div>
        
        <div class="account-tabs">
            <button class="tab-btn ${currentTab === 'profile' ? 'active' : ''}" data-tab="profile">👤 Профиль</button>
            <button class="tab-btn ${currentTab === 'orders' ? 'active' : ''}" data-tab="orders">📦 Мои заказы (${getUserOrders().length})</button>
            <button class="tab-btn ${currentTab === 'wishlist' ? 'active' : ''}" data-tab="wishlist">❤️ Избранное (${getWishlist().length})</button>
            <button class="tab-btn ${currentTab === 'bonuses' ? 'active' : ''}" data-tab="bonuses">💰 Бонусы</button>
        </div>
        
        <div id="tab-profile" class="tab-content ${currentTab === 'profile' ? 'active' : ''}">
            <div class="profile-form">
                <div class="form-group"><label>Имя</label><input type="text" id="profileName" value="${escapeHtml(user.name || '')}"></div>
                <div class="form-group"><label>Телефон</label><input type="tel" id="profilePhone" value="${escapeHtml(user.phone)}" readonly></div>
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
    
    // Обработчики
    document.getElementById('logoutBtn')?.addEventListener('click', logoutUser);
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

function getUserOrders() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const saved = localStorage.getItem('crm_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            const allOrders = data.orders || [];
            return allOrders.filter(o => o.customer?.phone === user.phone || o.customer?.phone?.replace(/[^0-9]/g, '') === user.phone);
        } catch(e) {}
    }
    return [];
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
                <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
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
    const history = getBonusHistory();
    const container = document.getElementById('bonusHistory');
    
    if (history.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">💰 История начислений пуста</div>';
        return;
    }
    
    container.innerHTML = `
        <div style="background:white; border-radius:20px; overflow:hidden;">
            <table style="width:100%; border-collapse:collapse;">
                <thead><tr style="background:#f8fafc;"><th style="padding:12px;">Дата</th><th>Сумма</th><th>Описание</th><th>Баланс</th></tr></thead>
                <tbody>
                    ${history.map(h => `
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

function showAuthModal(phone) {
    const modal = document.getElementById('authModal');
    const authContent = document.getElementById('authContent');
    
    authContent.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 16px;">📱</div>
        <div style="font-size: 14px; color: #666; margin-bottom: 16px;">Код отправлен на ${phone}</div>
        <input type="text" id="authCode" class="auth-input auth-code-input" placeholder="_ _ _ _ _ _" maxlength="6">
        <button id="verifyCodeBtn" class="auth-btn">Подтвердить</button>
        <button id="resendCodeBtn" class="auth-resend">Отправить код повторно</button>
    `;
    
    modal.classList.add('active');
    
    document.getElementById('verifyCodeBtn')?.addEventListener('click', async () => {
        const code = document.getElementById('authCode').value;
        if (verifyCode(phone, code)) {
            modal.classList.remove('active');
            renderAccount();
        }
    });
    
    document.getElementById('resendCodeBtn')?.addEventListener('click', async () => {
        await sendAuthCode(phone);
        document.getElementById('resendInfo').innerHTML = '✨ Новый код отправлен!';
        setTimeout(() => document.getElementById('resendInfo').innerHTML = '', 3000);
    });
}

function viewOrderDetails(orderId) {
    // Открыть детали заказа
    alert(`Детали заказа ${orderId} - скоро появится детальный просмотр`);
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderAccount();
    if (typeof updateCartCount === 'function') updateCartCount();
});

// Добавляем кнопку входа в шапку
document.addEventListener('DOMContentLoaded', () => {
    const accountBtn = document.getElementById('accountBtn');
    if (accountBtn) {
        accountBtn.onclick = () => {
            const user = getCurrentUser();
            if (user) {
                window.location.href = '/murano-apparel/pages/account.html';
            } else {
                const phone = prompt('Введите номер телефона для входа:', '+7');
                if (phone) showAuthModal(phone);
            }
        };
    }
});
