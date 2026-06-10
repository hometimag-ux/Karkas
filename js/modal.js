// ==================== МОДАЛКИ ДЛЯ ДОКУМЕНТОВ (ПРОСТАЯ ВЕРСИЯ) ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('modal.js: запущен');
    
    const modal = document.getElementById('docModalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.getElementById('docModalClose');
    
    if (!modal) {
        console.error('Модалка не найдена!');
        return;
    }
    
    console.log('Модалка найдена');
    
    // Функция открытия
    window.openModal = function(title, content) {
        modalTitle.textContent = title;
        modalBody.innerHTML = content || '<p>Текст документа появится позже.</p>';
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
        console.log('Модалка открыта:', title);
    };
    
    // Функция закрытия
    window.closeModal = function() {
        modal.style.display = 'none';
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        document.body.style.overflow = '';
        console.log('Модалка закрыта');
    };
    
    // Обработчики на ссылки в футере
    const links = document.querySelectorAll('.footer-link');
    console.log('Найдено ссылок:', links.length);
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const docId = this.getAttribute('data-doc');
            console.log('Клик по ссылке, docId:', docId);
            
            let title = '';
            switch(docId) {
                case 'offer': title = 'Договор оферты'; break;
                case 'privacy': title = 'Политика конфиденциальности'; break;
                case 'agreement': title = 'Пользовательское соглашение'; break;
                case 'return': title = 'Условия обмена и возврата'; break;
                case 'about': title = 'О компании'; break;
                case 'delivery': title = 'Доставка и оплата'; break;
                case 'contacts': title = 'Контакты'; break;
                case 'wholesale': title = 'Оптовым клиентам'; break;
                default: title = 'Документ';
            }
            
            window.openModal(title, `<p>Содержание документа "${title}" появится здесь позже.</p>`);
        });
    });
    
    // Закрытие по крестику
    if (closeBtn) {
        closeBtn.onclick = function() {
            window.closeModal();
        };
    }
    
    // Закрытие по клику на фон
    modal.onclick = function(e) {
        if (e.target === modal) {
            window.closeModal();
        }
    };
    
    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            window.closeModal();
        }
    });
    
    // Изначально скрываем модалку
    modal.style.display = 'none';
    
    console.log('✅ Модалки готовы');
});
