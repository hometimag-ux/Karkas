// ==================== КУКИ (ЗАТЕМНЕНИЕ ЧЕРЕЗ 7 СЕКУНД) ====================
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('cookieOverlay');
    const cookieBar = document.getElementById('cookieBar');
    const acceptBtn = document.getElementById('cookieAccept');
    const privacyLink = document.getElementById('cookiePrivacyLink');
    
    console.log('🔍 Куки скрипт запущен');
    
    let timeoutId = null;
    let isAccepted = false;
    
    // Проверяем, было ли уже согласие
    if (localStorage.getItem('cookieConsent') === 'accepted') {
        console.log('🍪 Куки уже приняты, панель не показываем');
        return;
    }
    
    // Проверяем наличие элементов
    if (!cookieBar) {
        console.error('❌ cookieBar не найден в DOM');
        return;
    }
    
    // Показываем панель куки сразу
    cookieBar.classList.add('active');
    console.log('📢 Панель куки показана');
    
    // Запускаем таймер на затемнение через 7 секунд
    timeoutId = setTimeout(function() {
        if (!isAccepted && overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            console.log('⏰ 7 секунд прошло — экран затемнён');
        }
    }, 7000);
    
    // Функция принятия куки
    function acceptCookies() {
        if (isAccepted) return;
        isAccepted = true;
        
        if (timeoutId) clearTimeout(timeoutId);
        if (overlay) overlay.classList.remove('active');
        if (cookieBar) cookieBar.classList.remove('active');
        document.body.style.overflow = '';
        localStorage.setItem('cookieConsent', 'accepted');
        console.log('✅ Куки приняты, затемнение отменено');
    }
    
    // === НОВЫЙ КОД: Открытие модалки с политикой конфиденциальности ===
    function openPrivacyPolicy(e) {
        e.preventDefault();
        console.log('🔗 Открытие политики конфиденциальности');
        
        // Используем глобальную функцию из modal.js
        if (typeof window.openDocModal === 'function') {
            window.openDocModal('privacy');
        } else {
            console.error('❌ openDocModal не найдена');
            alert('Политика конфиденциальности появится позже');
        }
    }
    
    // Обработчики
    if (acceptBtn) {
        acceptBtn.addEventListener('click', acceptCookies);
        console.log('🔘 Обработчик кнопки "Принять" добавлен');
    }
    
    if (privacyLink) {
        privacyLink.addEventListener('click', openPrivacyPolicy);
        console.log('🔗 Обработчик ссылки "политикой конфиденциальности" добавлен');
    } else {
        console.warn('⚠️ Ссылка #cookiePrivacyLink не найдена');
    }
    
    // Затемнение нельзя закрыть кликом, только напоминаем
    if (overlay) {
        overlay.addEventListener('click', function() {
            if (typeof showToast === 'function') {
                showToast('🍪 Пожалуйста, примите условия использования куки');
            }
        });
    }
});
