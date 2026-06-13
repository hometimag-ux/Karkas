// ===== js/account.js - ЛИЧНЫЙ КАБИНЕТ =====

let currentTab = 'profile';

// Нормализация телефона (должна совпадать с auth.js)
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

function getUserOrders() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const userPhone = normalizePhone(user.phone);
    console.log('🔍 Поиск заказов для телефона:', userPhone);
    
    const saved = localStorage.getItem('crm_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            const allOrders = data.orders || [];
            
            const userOrders = allOrders.filter(order => {
                const orderPhone = normalizePhone(order.customer?.phone);
                return orderPhone === userPhone;
            });
            
            console.log(`📦 Найдено заказов: ${userOrders.length}`);
            return userOrders;
        } catch(e) {
            console.error('Ошибка загрузки заказов:', e);
        }
    }
    return [];
}

function getUserStats() {
    const orders = getUserOrders();
    const totalSpent = orders.reduce((sum, order) => {
        if (order.status === 'paid' || order.status === 'delivered') {
            return sum + (order.total || 0);
        }
        return sum;
    }, 0);
    
    const bonuses = Math.floor(totalSpent * 0.05);
    return { totalSpent, bonuses };
}

// ... остальные функции без изменений
