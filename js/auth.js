// ===== js/auth.js - АВТОРИЗАЦИЯ =====

let currentUser = null;

// Нормализация телефона (только цифры, без +7, без пробелов)
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

// Форматирование телефона для отображения
function formatPhone(phone) {
    const str = normalizePhone(phone);
    if (str.length === 11 && str[0] === '7') {
        return `+7 ${str.slice(1,4)} ${str.slice(4,7)}-${str.slice(7,9)}-${str.slice(9,11)}`;
    }
    return phone;
}

function getUserKey(phone) {
    return `user_${normalizePhone(phone)}`;
}

// Отправка кода авторизации
async function sendAuthCode(phone) {
    const cleanPhone = normalizePhone(phone);
    if (cleanPhone.length !== 11) {
        showToast('❌ Введите корректный номер телефона (10 цифр)');
        return false;
    }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`auth_code_${cleanPhone}`, JSON.stringify({
        code: code,
        expires: Date.now() + 5 * 60 * 1000
    }));
    
    console.log(`📱 Код для ${formatPhone(cleanPhone)}: ${code}`);
    showToast(`📧 Код отправлен на email: ${code}`, 'info');
    return true;
}

// Проверка кода
function verifyCode(phone, code) {
    const cleanPhone = normalizePhone(phone);
    const stored = localStorage.getItem(`auth_code_${cleanPhone}`);
    
    if (!stored) {
        showToast('❌ Код не найден. Запросите новый');
        return false;
    }
    
    try {
        const data = JSON.parse(stored);
        if (data.expires < Date.now()) {
            showToast('❌ Код истёк. Запросите новый');
            localStorage.removeItem(`auth_code_${cleanPhone}`);
            return false;
        }
        
        if (data.code !== code) {
            showToast('❌ Неверный код');
            return false;
        }
        
        loginUser(cleanPhone);
        localStorage.removeItem(`auth_code_${cleanPhone}`);
        return true;
    } catch(e) {
        return false;
    }
}

// Вход пользователя
function loginUser(phone) {
    const cleanPhone = normalizePhone(phone);
    const userKey = getUserKey(cleanPhone);
    let user = localStorage.getItem(userKey);
    
    if (user) {
        user = JSON.parse(user);
    } else {
        user = {
            id: Date.now(),
            phone: cleanPhone,
            name: '',
            email: '',
            default_address: '',
            created_at: new Date().toISOString(),
            bonuses: 0,
            total_spent: 0
        };
        localStorage.setItem(userKey, JSON.stringify(user));
    }
    
    user.last_login = new Date().toISOString();
    localStorage.setItem(userKey, JSON.stringify(user));
    
    currentUser = user;
    localStorage.setItem('current_user_phone', cleanPhone);
    
    showToast(`✅ Добро пожаловать, ${user.name || 'пользователь'}!`);
    return user;
}

// Выход
function logoutUser() {
    currentUser = null;
    localStorage.removeItem('current_user_phone');
    showToast('👋 Вы вышли из аккаунта');
    window.location.reload();
}

// Получить текущего пользователя
function getCurrentUser() {
    if (currentUser) return currentUser;
    
    const savedPhone = localStorage.getItem('current_user_phone');
    if (savedPhone) {
        const cleanPhone = normalizePhone(savedPhone);
        const userKey = getUserKey(cleanPhone);
        const user = localStorage.getItem(userKey);
        if (user) {
            currentUser = JSON.parse(user);
            return currentUser;
        }
    }
    return null;
}

// Обновить данные пользователя
function updateUserProfile(updates) {
    if (!currentUser) return false;
    
    Object.assign(currentUser, updates);
    const userKey = getUserKey(currentUser.phone);
    localStorage.setItem(userKey, JSON.stringify(currentUser));
    
    showToast('✅ Профиль обновлён');
    return true;
}

// Добавить бонусы пользователю
function addBonuses(amount, reason) {
    if (!currentUser) return false;
    
    currentUser.bonuses = (currentUser.bonuses || 0) + amount;
    currentUser.total_spent = (currentUser.total_spent || 0) + amount;
    
    const bonusHistory = JSON.parse(localStorage.getItem(`bonus_history_${currentUser.id}`) || '[]');
    bonusHistory.unshift({
        date: new Date().toISOString(),
        amount: amount,
        reason: reason,
        balance: currentUser.bonuses
    });
    localStorage.setItem(`bonus_history_${currentUser.id}`, JSON.stringify(bonusHistory));
    
    const userKey = getUserKey(currentUser.phone);
    localStorage.setItem(userKey, JSON.stringify(currentUser));
    
    return true;
}

// Списать бонусы
function spendBonuses(amount) {
    if (!currentUser) return false;
    if (currentUser.bonuses < amount) return false;
    
    currentUser.bonuses -= amount;
    const userKey = getUserKey(currentUser.phone);
    localStorage.setItem(userKey, JSON.stringify(currentUser));
    
    return true;
}
