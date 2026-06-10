// ==================== МОДАЛКИ ДЛЯ ДОКУМЕНТОВ ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('modal.js: DOM загружен');
    
    // Элементы модалки
    const modalOverlay = document.getElementById('docModalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('docModalClose');
    
    if (!modalOverlay) {
        console.error('Ошибка: не найден #docModalOverlay');
        return;
    }
    console.log('✅ Модалка найдена');
    
    // Функция открытия модалки
    function openDocModal(docId) {
        console.log('openDocModal вызван с docId:', docId);
        
        let title = '';
        
        switch(docId) {
            case 'offer':
                title = 'Договор оферты';
                break;
            case 'privacy':
                title = 'Политика конфиденциальности';
                break;
            case 'agreement':
                title = 'Пользовательское соглашение';
                break;
            case 'return':
                title = 'Условия обмена и возврата';
                break;
            case 'about':
                title = 'О компании';
                break;
            case 'delivery':
                title = 'Доставка и оплата';
                break;
            case 'contacts':
                title = 'Контакты';
                break;
            case 'wholesale':
                title = 'Оптовым клиентам';
                break;
            default:
                title = 'Документ';
        }
        
        if (modalTitle) modalTitle.textContent = title;
        if (modalBody) modalBody.innerHTML = `<p>Содержание документа "${title}" появится здесь позже.</p>`;
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('Модалка открыта, заголовок:', title);
    }
    
    // Функция закрытия модалки
    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        console.log('Модалка закрыта');
    }
    
    // Делаем функцию глобальной
    window.openDocModal = openDocModal;
    
    // Навешиваем обработчики на ссылки в футере
    const footerLinks = document.querySelectorAll('.footer-link');
    console.log('Найдено ссылок в футере:', footerLinks.length);
    
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const docId = this.getAttribute('data-doc');
            console.log('Клик по ссылке, data-doc:', docId);
            if (docId) {
                openDocModal(docId);
            }
        });
    });
    
    // Закрытие по крестику
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
        console.log('Обработчик крестика добавлен');
    }
    
    // Закрытие по клику на оверлей
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });
    
    console.log('✅ Модалки футера инициализированы');
});
