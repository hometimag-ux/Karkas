// ===== БАННЕР-КАРУСЕЛЬ =====
function initBannerCarousel() {
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('bannerPrev');
    const nextBtn = document.getElementById('bannerNext');
    
    if (!slides.length) return;
    
    let currentSlide = 0;
    let autoPlayInterval;

    function showSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
        resetAutoPlay();
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
        resetAutoPlay();
    }

    function resetAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, 5000);
    }

    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            resetAutoPlay();
        });
    });
    
    resetAutoPlay();
    
    const banner = document.querySelector('.hero-banner');
    if (banner) {
        banner.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
        banner.addEventListener('mouseleave', resetAutoPlay);
    }
}

// Запуск баннера при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initBannerCarousel();
    
    // Кнопка "В каталог" на слайдере
    const shopBtn = document.getElementById('shopNowBtn2');
    if (shopBtn) {
        shopBtn.addEventListener('click', () => {
            const productsGrid = document.getElementById('productsGrid');
            if (productsGrid) productsGrid.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Кнопка подписки
    const subscribeBtn = document.getElementById('subscribeBtn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', () => {
            if (typeof showToast === 'function') {
                showToast('📧 Подписка оформлена! Проверьте почту для получения промокода.');
            } else {
                alert('📧 Подписка оформлена! Проверьте почту для получения промокода.');
            }
        });
    }
});


// ===== 3D КАРУСЕЛЬ КОЛЛЕКЦИЙ =====
function initCollectionSlider() {
    const sliderWrapper = document.getElementById('collectionSlider');
    if (!sliderWrapper) return;
    
    // Инициализация Swiper
    const swiper = new Swiper(sliderWrapper, {
        effect: 'creative',
        creativeEffect: {
            prev: {
                translate: ['-120%', 0, -200],
                scale: 0.7,
                opacity: 0.5,
            },
            next: {
                translate: ['120%', 0, -200],
                scale: 0.7,
                opacity: 0.5,
            },
        },
        slidesPerView: 'auto',
        centeredSlides: true,
        spaceBetween: 20,
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        navigation: {
            prevEl: '#collectionPrev',
            nextEl: '#collectionNext',
        },
        pagination: {
            el: '.collection-slider__pagination',
            clickable: true,
            dynamicBullets: false,
        },
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 15,
            },
            640: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
            1280: {
                slidesPerView: 3,
                spaceBetween: 40,
            },
        },
        on: {
            init: function() {
                console.log('Коллекции карусель инициализирована');
            },
        },
    });
    
    // Пауза автопрокрутки при наведении
    const sliderContainer = document.querySelector('.collection-slider__wrapper');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => swiper.autoplay.stop());
        sliderContainer.addEventListener('mouseleave', () => swiper.autoplay.start());
    }
}

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // ... ваш существующий код ...
    initCollectionSlider(); // Добавьте эту строку
});




// ===== МОДАЛЬНОЕ ОКНО ДЛЯ ФУТЕРА =====
document.addEventListener('DOMContentLoaded', function() {
    // Контент для каждого документа
    const contentMap = {
        // Документы
        offer: {
            title: "Договор оферты",
            content: `
                <h4>1. Общие положения</h4>
                <p>Настоящий договор является официальной офертой интернет-магазина Murano Apparel...</p>
                <h4>2. Порядок оформления заказа</h4>
                <p>Заказ осуществляется через корзину на сайте или по телефону +7 (906) 377-19-85...</p>
                <h4>3. Оплата товара</h4>
                <p>Оплата производится банковской картой, наличными при получении или по счету для юрлиц...</p>
                <h4>4. Доставка</h4>
                <p>Доставка осуществляется в течение 1-5 рабочих дней по всей России...</p>
                <p><strong>Дата публикации:</strong> 1 января 2026 г.</p>
            `
        },
        privacy: {
            title: "Политика конфиденциальности",
            content: `
                <h4>1. Сбор персональных данных</h4>
                <p>Мы собираем только те данные, которые вы добровольно предоставляете: имя, телефон, email, адрес доставки...</p>
                <h4>2. Использование данных</h4>
                <p>Данные используются исключительно для обработки заказов и информирования о статусе заказа...</p>
                <h4>3. Защита данных</h4>
                <p>Ваши данные надежно защищены и не передаются третьим лицам без вашего согласия...</p>
                <h4>4. Файлы cookie</h4>
                <p>Сайт использует cookie для улучшения работы. Вы можете отключить их в настройках браузера...</p>
            `
        },
        agreement: {
            title: "Пользовательское соглашение",
            content: `
                <h4>1. Права и обязанности сторон</h4>
                <p>Пользователь обязуется использовать сайт только в законных целях...</p>
                <h4>2. Интеллектуальная собственность</h4>
                <p>Все материалы сайта являются собственностью Murano Apparel...</p>
                <h4>3. Ограничение ответственности</h4>
                <p>Администрация не несет ответственности за перебои в работе сайта...</p>
            `
        },
        return: {
            title: "Условия обмена и возврата",
            content: `
                <h4>1. Сроки возврата</h4>
                <p>Обмен и возврат товара возможен в течение 14 дней с момента получения...</p>
                <h4>2. Условия возврата</h4>
                <p>Товар должен быть не использован, сохранены фабричные ярлыки и упаковка...</p>
                <h4>3. Порядок возврата денежных средств</h4>
                <p>Деньги возвращаются в течение 10 рабочих дней на банковскую карту...</p>
            `
        },
        // Информация
        about: {
            title: "О компании",
            content: `
                <h4>Murano Apparel</h4>
                <p>Мы производим медицинскую одежду с 2020 года. Наша миссия — обеспечить медицинских работников комфортной, стильной и функциональной одеждой.</p>
                <h4>Наши преимущества</h4>
                <p>✓ Собственное производство в России<br>
                ✓ Ткани премиум-качества<br>
                ✓ Индивидуальный подход к каждому клиенту<br>
                ✓ Помощь в разработке лекал</p>
                <h4>Реквизиты</h4>
                <p>ООО «Murano Apparel»<br>
                ИНН: 7723456789<br>
                ОГРН: 1234567890123</p>
            `
        },
        delivery: {
            title: "Доставка и оплата",
            content: `
                <h4>Способы доставки</h4>
                <p>• Курьерская доставка по Москве — 1-2 дня<br>
                • Доставка по России — СДЭК, Почта России (3-7 дней)<br>
                • Самовывоз из шоурума — бесплатно</p>
                <h4>Стоимость доставки</h4>
                <p>При заказе от 5 000 ₽ — бесплатно. Менее 5 000 ₽ — 350 ₽.</p>
                <h4>Способы оплаты</h4>
                <p>• Банковской картой онлайн<br>
                • Наличными при получении<br>
                • Безналичный расчет для юрлиц</p>
            `
        },
        contacts: {
            title: "Контакты",
            content: `
                <h4>Свяжитесь с нами</h4>
                <p>📞 Телефон: <a href="tel:+79063771985">+7 (906) 377-19-85</a><br>
                ✉️ Email: <a href="mailto:murano-apparel@bk.ru">murano-apparel@bk.ru</a></p>
                <h4>Адрес шоурума</h4>
                <p>г. Москва, ул. Тверская, д. 15, офис 301<br>
                Режим работы: Пн-Пт с 10:00 до 19:00</p>
                <h4>Социальные сети</h4>
                <p>📱 Instagram: @murano_apparel<br>
                💬 Telegram: t.me/murano_apparel<br>
                📱 WhatsApp: wa.me/79063771985</p>
            `
        },
        wholesale: {
            title: "Оптовым клиентам",
            content: `
                <h4>Преимущества оптовых закупок</h4>
                <p>• Скидка от 15% до 35% в зависимости от объема<br>
                • Индивидуальные условия для клиник и медцентров<br>
                • Помощь в разработке лекал под ваши размеры<br>
                • Нанесение логотипа (вышивка / трафарет)<br>
                • Подготовка документов для тендеров</p>
                <h4>Как начать сотрудничество</h4>
                <p>1. Оставьте заявку на сайте<br>
                2. Наш менеджер свяжется для уточнения деталей<br>
                3. Подготовим коммерческое предложение<br>
                4. Отправим образцы тканей</p>
                <p><strong>Свяжитесь с нашим отделом оптовых продаж:</strong><br>
                📞 +7 (906) 377-19-85<br>
                ✉️ opt@murano-apparel.ru</p>
            `
        }
    };
    
    // Элементы модалки
    const overlay = document.getElementById('docModalOverlay');
    const modalContainer = document.getElementById('docModalContainer');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.getElementById('docModalClose');
    
    // Закрытие модалки
    function closeModal() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Открытие модалки
    function openModal(docId) {
        const data = contentMap[docId];
        if (!data) return;
        
        modalTitle.textContent = data.title;
        modalBody.innerHTML = data.content;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Обработчики на ссылки
    const footerLinks = document.querySelectorAll('.footer-link');
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const docId = link.getAttribute('data-doc');
            if (docId) openModal(docId);
        });
    });
    
    // Закрытие по крестику
    if (closeBtn) closeBtn.onclick = closeModal;
    
    // Закрытие по клику на оверлей
    if (overlay) {
        overlay.onclick = (e) => {
            if (e.target === overlay) closeModal();
        };
    }
    
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeModal();
        }
    });
});
