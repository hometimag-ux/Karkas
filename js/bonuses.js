// ===== js/bonuses.js - БОНУСНАЯ СИСТЕМА =====

// Настройки бонусной системы
const BONUS_RATE = 0.05; // 5% от суммы заказа
const BONUS_SPEND_RATE = 1; // 1 бонус = 1 рубль

function calculateBonusesForOrder(amount) {
    return Math.floor(amount * BONUS_RATE);
}

function getBonusHistory() {
    const user = getCurrentUser();
    if (!user) return [];
    return JSON.parse(localStorage.getItem(`bonus_history_${user.id}`) || '[]');
}

function getBonusesBalance() {
    const user = getCurrentUser();
    return user?.bonuses || 0;
}

// Применение бонусов к заказу
function applyBonusesToOrder(orderTotal, bonusesToUse) {
    const userBonuses = getBonusesBalance();
    const maxBonuses = Math.min(userBonuses, orderTotal * 0.3); // максимум 30% от суммы
    
    if (bonusesToUse > maxBonuses) {
        return { success: false, message: `Можно использовать не более ${maxBonuses} бонусов` };
    }
    
    const discount = bonusesToUse;
    const newTotal = orderTotal - discount;
    
    return { success: true, discount: discount, newTotal: newTotal };
}

// Начисление бонусов после заказа
function addBonusesForOrder(orderData) {
    const bonusAmount = calculateBonusesForOrder(orderData.total);
    if (bonusAmount > 0) {
        addBonuses(bonusAmount, `Заказ ${orderData.orderId}`);
    }
    return bonusAmount;
}
