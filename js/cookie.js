// ==================== КУКИ (ЗАТЕМНЕНИЕ ЧЕРЕЗ 7 СЕКУНД) ====================
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('cookieOverlay');
    const cookieBar = document.getElementById('cookieBar');
    const acceptBtn = document.getElementById('cookieAccept');
    
    let timeoutId = null;
    let isAccepted = false;
    
    // Проверяем, было ли уже согласие
    if (localStorage.getItem('cookieConsent') === 'accepted') {
        return; // Ничего не показываем
    }
    
    // Показываем панель куки сразу
    if (cookieBar) cookieBar.classList.add('active');
    
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
        
        // Очищаем таймер
        if (timeoutId) clearTimeout(timeoutId);
        
        // Убираем затемнение и панель
        if (overlay) overlay.classList.remove('active');
        if (cookieBar) cookieBar.classList.remove('active');
        
        // Разблокируем скролл
        document.body.style.overflow = '';
        
        // Сохраняем согласие
        localStorage.setItem('cookieConsent', 'accepted');
        console.log('✅ Куки приняты, затемнение отменено');
    }
    
    // Обработчик кнопки
    if (acceptBtn) {
        acceptBtn.addEventListener('click', acceptCookies);
    }
    
    // Если пользователь нажимает на затемнение — не закрываем (требует явного согласия)
    if (overlay) {
        overlay.addEventListener('click', function() {
            // Ничего не делаем, только напоминаем
            if (typeof showToast === 'function') {
                showToast('🍪 Пожалуйста, примите условия использования куки');
            }
        });
    }
    
    console.log('✅ Куки панель активирована, затемнение через 7 секунд');
});
