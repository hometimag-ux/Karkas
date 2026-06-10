// ==================== КУКИ (НИЖНЯЯ ПАНЕЛЬ + ЗАТЕМНЕНИЕ) ====================
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('cookieOverlay');
    const cookieBar = document.getElementById('cookieBar');
    const acceptBtn = document.getElementById('cookieAccept');
    const settingsBtn = document.getElementById('cookieSettings');
    
    // Проверяем, было ли уже согласие
    if (localStorage.getItem('cookieConsent') === 'accepted') {
        return; // Ничего не показываем
    }
    
    // Показываем затемнение и панель сразу
    if (overlay) overlay.classList.add('active');
    if (cookieBar) cookieBar.classList.add('active');
    
    // Блокируем скролл фона
    document.body.style.overflow = 'hidden';
    
    // Функция принятия куки
    function acceptCookies() {
        if (overlay) overlay.classList.remove('active');
        if (cookieBar) cookieBar.classList.remove('active');
        document.body.style.overflow = '';
        localStorage.setItem('cookieConsent', 'accepted');
    }
    
    // Функция для настроек
    function openSettings() {
        if (typeof showToast === 'function') {
            showToast('⚙️ Настройки куки появятся позже');
        } else {
            alert('⚙️ Настройки куки появятся позже');
        }
    }
    
    // Обработчики кнопок
    if (acceptBtn) {
        acceptBtn.addEventListener('click', acceptCookies);
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
    }
    
    // Затемнение нельзя закрыть кликом — только кнопкой
    console.log('✅ Куки панель активирована');
});
