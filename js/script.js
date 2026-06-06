<script>
// ===== БАННЕР-КАРУСЕЛЬ =====
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('bannerPrev');
    const nextBtn = document.getElementById('bannerNext');
    let currentSlide = 0;
    let autoPlayInterval;

    function showSlide(index) {
        // Зацикливание
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        // Скрываем все слайды
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Показываем нужный
        slides[index].classList.add('active');
        dots[index].classList.add('active');
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
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, 5000);
    }

    // События кнопок
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // События точек
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            resetAutoPlay();
        });
    });
    
    // Запуск автопрокрутки
    autoPlayInterval = setInterval(nextSlide, 5000);
    
    // Остановка автопрокрутки при наведении
    const banner = document.querySelector('.hero-banner');
    if (banner) {
        banner.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
        banner.addEventListener('mouseleave', () => {
            autoPlayInterval = setInterval(nextSlide, 5000);
        });
    }
    
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
            showToast('📧 Подписка оформлена! Проверьте почту для получения промокода.');
        });
    }
});
</script>
