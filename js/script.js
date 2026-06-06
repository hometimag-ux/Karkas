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
