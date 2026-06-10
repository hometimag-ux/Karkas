// ==================== МОДАЛЬНОЕ ОКНО КУКИ ====================
document.addEventListener('DOMContentLoaded', function() {
    const cookieModal = document.getElementById('cookieModal');
    const acceptBtn = document.getElementById('cookieAccept');
    const settingsBtn = document.getElementById('cookieSettings');
    
    // Проверяем, было ли уже согласие
    if (localStorage.getItem('cookieConsent') === 'accepted') {
        return; // Модалку не показываем
    }
    
    let timeoutId = null;
    let isBlocked = false;
    
    // Функция блокировки экрана
    function blockScreen() {
        if (isBlocked) return;
        isBlocked = true;
        
        if (cookieModal) {
            cookieModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Функция разблокировки и сохранения согласия
    function acceptCookies() {
        if (timeoutId) clearTimeout(timeoutId);
        if (cookieModal) {
            cookieModal.classList.remove('active');
            document.body.style.overflow = '';
        }
        localStorage.setItem('cookieConsent', 'accepted');
        isBlocked = false;
    }
    
    // Функция для настроек (показываем уведомление)
    function openSettings() {
        if (typeof showToast === 'function') {
            showToast('⚙️ Настройки куки появятся позже');
        } else {
            alert('⚙️ Настройки куки появятся позже');
        }
    }
    
    // Показываем модалку через 10 секунд
    timeoutId = setTimeout(blockScreen, 10000);
    
    // Обработчики кнопок
    if (acceptBtn) {
        acceptBtn.addEventListener('click', acceptCookies);
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
    }
    
    // Если пользователь нажимает на фон — не закрываем (требует явного согласия)
    if (cookieModal) {
        cookieModal.addEventListener('click', function(e) {
            if (e.target === cookieModal) {
                // Не закрываем, просто напоминаем
                if (typeof showToast === 'function') {
                    showToast('🍪 Пожалуйста, примите условия использования куки');
                }
            }
        });
    }
    
    console.log('✅ Модалка куки загружена, блокировка через 10 секунд');
});
