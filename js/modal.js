// ==================== МОДАЛКИ ДЛЯ ДОКУМЕНТОВ ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('modal.js: запущен');
    
    const modal = document.getElementById('docModalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.getElementById('docModalClose');
    
    if (!modal) {
        console.error('❌ Модалка не найдена!');
        return;
    }
    
    console.log('✅ Модалка найдена');
    
    // Функция открытия
    function openModal(title, content) {
        modalTitle.textContent = title;
        modalBody.innerHTML = content || '<p>Текст документа появится позже.</p>';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('✅ Модалка открыта:', title);
    }
    
    // Функция закрытия
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        console.log('✅ Модалка закрыта');
    }
    
    // Делаем функции глобальными
    window.openModal = openModal;
    window.closeModal = closeModal;
    
    // Обработчики на ссылки в футере
    const links = document.querySelectorAll('.footer-link');
    console.log('Найдено ссылок в футере:', links.length);
    
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
            
            openModal(title, `<p>Содержание документа "${title}" появится здесь позже.</p>`);
        });
    });
    
    // Закрытие по крестику
    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }
    
    // Закрытие по клику на фон
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeModal();
        }
    };
    
    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    console.log('✅ Модалки готовы');
});

.cookie-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    z-index: 9998;
    opacity: 0;
    visibility: hidden;
    transition: 0.3s;
}
.cookie-overlay.active {
    opacity: 1;
    visibility: visible;
}
.cookie-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    z-index: 9999;
    transform: translateY(100%);
    transition: 0.4s;
}
.cookie-bar.active {
    transform: translateY(0);
}
.cookie-bar-content {
    max-width: 1280px;
    margin: 0 auto;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}
.cookie-text {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}
.cookie-icon {
    font-size: 1.8rem;
}
.cookie-btn {
    background: linear-gradient(135deg, #00897b, #4db6ac);
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 40px;
    font-weight: 600;
    cursor: pointer;
}
