// ==================== МОДАЛКИ ДЛЯ ФУТЕРА ====================
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('docModalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.getElementById('docModalClose');
    
    // Контент для модалок
    const contentMap = {
        offer: { title: "Договор оферты", content: "<p>Текст договора оферты...</p>" },
        privacy: { title: "Политика конфиденциальности", content: "<p>Текст политики конфиденциальности...</p>" },
        agreement: { title: "Пользовательское соглашение", content: "<p>Текст пользовательского соглашения...</p>" },
        return: { title: "Условия обмена и возврата", content: "<p>Текст условий обмена и возврата...</p>" },
        about: { title: "О компании", content: "<p>Информация о компании...</p>" },
        delivery: { title: "Доставка и оплата", content: "<p>Информация о доставке и оплате...</p>" },
        contacts: { title: "Контакты", content: "<p>Контактная информация...</p>" },
        wholesale: { title: "Оптовым клиентам", content: "<p>Информация для оптовых клиентов...</p>" }
    };
    
    function openModal(docId) {
        const data = contentMap[docId];
        if (!data || !overlay) return;
        modalTitle.textContent = data.title;
        modalBody.innerHTML = data.content;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        if (!overlay) return;
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Навешиваем обработчики на ссылки футера
    document.querySelectorAll('.footer-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const docId = this.getAttribute('data-doc');
            if (docId) openModal(docId);
        });
    });
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeModal();
    });
    
    console.log('✅ Модалки футера инициализированы');
});
