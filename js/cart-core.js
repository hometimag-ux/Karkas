// =====  ЯДРО КОРЗИНЫ =====

// Корзина хранится в localStorage, НЕ ОЧИЩАЕТСЯ до успешной оплаты
// Все операции с данными корзины производятся через этот модуль

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

// Безопасное экранирование HTML
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Показ уведомлений (toast)
function showToast(message, type = 'info') {
    let toast = document.getElementById('cartToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cartToast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #1a2c3e;
            color: white;
            padding: 12px 24px;
            border-radius: 40px;
            z-index: 100000;
            font-size: 14px;
            opacity: 0;
            transition: 0.3s;
            pointer-events: none;
            white-space: nowrap;
            font-family: system-ui, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(toast);
    }
    
    // Стили в зависимости от типа уведомления
    if (type === 'success') {
        toast.style.background = '#00897b';
    } else if (type === 'error') {
        toast.style.background = '#e74c3c';
    } else {
        toast.style.background = '#1a2c3e';
    }
    
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

// ===== ОСНОВНЫЕ ФУНКЦИИ РАБОТЫ С КОРЗИНОЙ =====

// Получить корзину из localStorage
function getCart() {
    try {
        const cart = localStorage.getItem('cart');
        if (!cart) {
            return [];
        }
        return JSON.parse(cart);
    } catch (e) {
        console.error('Ошибка чтения корзины из localStorage:', e);
        return [];
    }
}

// Сохранить корзину в localStorage
function saveCart(cart) {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('💾 Корзина сохранена, товаров:', cart.length);
        
        // Обновляем счётчик и отображение, если функция доступна
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
    } catch (e) {
        console.error('Ошибка сохранения корзины в localStorage:', e);
        showToast('Ошибка сохранения корзины', 'error');
    }
}

// Добавить товар в корзину
function addToCart(product) {
    // Проверка обязательных полей
    if (!product || !product.id || !product.title || !product.price) {
        console.error('Ошибка: неверные данные товара', product);
        showToast('Ошибка: неверные данные товара', 'error');
        return false;
    }
    
    const cart = getCart();
    
    // Поиск существующего товара с такими же id, размером и цветом
    const existingIndex = cart.findIndex(item => 
        item.id === product.id && 
        item.size === product.size && 
        item.color === product.color
    );
    
    if (existingIndex !== -1) {
        // Товар уже есть - увеличиваем количество
        cart[existingIndex].quantity += product.quantity || 1;
        console.log('📦 Товар уже в корзине, увеличили количество:', cart[existingIndex]);
    } else {
        // Новый товар - добавляем
        const newItem = {
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: product.quantity || 1,
            size: product.size || '—',
            color: product.color || '—',
            image: product.image || null,
            article: product.article || '—'
        };
        cart.push(newItem);
        console.log('➕ Товар добавлен в корзину:', newItem);
    }
    
    saveCart(cart);
    showToast(`✅ ${product.title} добавлен в корзину`, 'success');
    return true;
}

// Добавить товар в корзину по ID (для совместимости со старым кодом)
function addToCartById(id, quantity = 1, size = '—', color = '—') {
    // Проверяем, есть ли глобальный массив products
    if (typeof products !== 'undefined' && products) {
        const product = products.find(p => p.id === id);
        if (product) {
            return addToCart({
                id: product.id,
                title: product.title,
                price: product.discount_price || product.price,
                quantity: quantity,
                size: size,
                color: color,
                image: product.images ? product.images[0] : null,
                article: product.article
            });
        }
    }
    
    console.error('Товар с id ' + id + ' не найден в каталоге');
    showToast('Ошибка: товар не найден', 'error');
    return false;
}

// Обновить количество товара
function updateCartItemQuantity(id, size, color, delta) {
    const cart = getCart();
    const index = cart.findIndex(item => 
        item.id === id && 
        item.size === size && 
        item.color === color
    );
    
    if (index !== -1) {
        const newQuantity = cart[index].quantity + delta;
        
        if (newQuantity <= 0) {
            // Удаляем товар если количество становится 0 или меньше
            cart.splice(index, 1);
            console.log('🗑️ Товар удалён из корзины (количество = 0)');
            showToast('Товар удалён из корзины', 'info');
        } else {
            cart[index].quantity = newQuantity;
            console.log('🔄 Количество товара изменено:', cart[index]);
        }
        
        saveCart(cart);
    } else {
        console.warn('Товар не найден для обновления:', {id, size, color});
    }
}

// Удалить товар из корзины
function removeCartItem(id, size, color) {
    let cart = getCart();
    const initialLength = cart.length;
    
    cart = cart.filter(item => 
        !(item.id === id && item.size === size && item.color === color)
    );
    
    if (cart.length < initialLength) {
        saveCart(cart);
        showToast('Товар удалён из корзины', 'info');
        console.log('🗑️ Товар удалён:', {id, size, color});
    } else {
        console.warn('Товар не найден для удаления:', {id, size, color});
    }
}

// Полностью очистить корзину
// ВНИМАНИЕ: эта функция вызывается ТОЛЬКО после успешной оплаты заказа!
function clearCart() {
    const cart = getCart();
    
    if (cart.length === 0) {
        console.log('Корзина уже пуста, очистка не требуется');
        return;
    }
    
    console.log('🗑️ ОЧИСТКА КОРЗИНЫ - вызывается только после успешной оплаты');
    console.log('Товары которые были удалены:', JSON.parse(JSON.stringify(cart)));
    
    localStorage.setItem('cart', '[]');
    
    // Обновляем интерфейс
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    
    console.log('✅ Корзина очищена');
}

// Получить общую сумму корзины
function getCartTotal() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return total;
}

// Получить количество товаров в корзине
function getCartItemsCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    return count;
}

// Получить детальную информацию о корзине
function getCartDetails() {
    const cart = getCart();
    const total = getCartTotal();
    const count = getCartItemsCount();
    
    return {
        items: cart,
        total: total,
        count: count,
        isEmpty: cart.length === 0
    };
}

// Проверить, есть ли товар в корзине
function isInCart(id, size, color) {
    const cart = getCart();
    return cart.some(item => 
        item.id === id && 
        item.size === size && 
        item.color === color
    );
}

// Получить количество конкретного товара в корзине
function getItemQuantity(id, size, color) {
    const cart = getCart();
    const item = cart.find(item => 
        item.id === id && 
        item.size === size && 
        item.color === color
    );
    return item ? item.quantity : 0;
}

// ===== РАБОТА С НЕЗАВЕРШЁННЫМИ ЗАКАЗАМИ =====

// Сохранить незавершённый заказ
function savePendingOrder(orderData) {
    try {
        localStorage.setItem('pendingOrder', JSON.stringify(orderData));
        console.log('💾 Незавершённый заказ сохранён:', orderData.orderId);
    } catch (e) {
        console.error('Ошибка сохранения незавершённого заказа:', e);
    }
}

// Получить незавершённый заказ
function getPendingOrder() {
    try {
        const pending = localStorage.getItem('pendingOrder');
        return pending ? JSON.parse(pending) : null;
    } catch (e) {
        console.error('Ошибка чтения незавершённого заказа:', e);
        return null;
    }
}

// Очистить незавершённый заказ
function clearPendingOrder() {
    localStorage.removeItem('pendingOrder');
    console.log('🗑️ Незавершённый заказ удалён');
}

// Проверить наличие незавершённого заказа
function hasPendingOrder() {
    return getPendingOrder() !== null;
}
