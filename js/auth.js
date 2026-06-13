// ===== js/auth.js - АВТОРИЗАЦИЯ =====

let currentUser = null;

function getUserKey(phone) {
    return `user_${phone.replace(/[^0-9]/g, '')}`;
}

// Отправка кода авторизации
async function sendAuthCode(phone) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
        showToast('❌ Введите корректный номер телефона');
        return false;
    }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`auth_code_${cleanPhone}`, JSON.stringify({
        code: code,
        expires: Date.now() + 5 * 60 * 1000 // 5 минут
    }));
    
    // В реальном проекте здесь отправка SMS/Email
    console.log(`📱 Код для ${phone}: ${code}`);
    showToast(`📧 Код отправлен на email: ${code}`, 'info');
    return true;
}

// Проверка кода
function verifyCode(phone, code) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
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
        
        // Код верный — авторизуем
        loginUser(phone);
        localStorage.removeItem(`auth_code_${cleanPhone}`);
        return true;
    } catch(e) {
        return false;
    }
}

// Вход пользователя
function loginUser(phone) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const userKey = getUserKey(cleanPhone);
    let user = localStorage.getItem(userKey);
    
    if (user) {
        user = JSON.parse(user);
    } else {
        // Новый пользователь
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
        const userKey = getUserKey(savedPhone);
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
    
    currentUser.bonuses += amount;
    currentUser.total_spent = (currentUser.total_spent || 0) + amount;
    
    // Добавляем запись о начислении
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
