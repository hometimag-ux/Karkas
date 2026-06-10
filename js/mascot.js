// ==================== МАСКОТ — РЕАЛИСТИЧНОЕ СЕРДЦЕ ====================
document.addEventListener('DOMContentLoaded', function() {
    const mascot = document.getElementById('mascot');
    const bubble = document.getElementById('mascotBubble');
    
    if (!mascot || !bubble) {
        console.log('❌ Маскот не найден');
        return;
    }
    
    console.log('✅ Реалистичное сердце запущено');
    
    // Цитаты о сердце, жизни и врачах
    const quotes = [
        '❤️ Ваше сердце спасает жизни каждый день.',
        '🫀 Сердце врача — самое доброе сердце на свете.',
        '💚 Спасибо, что дарите тепло. Мы дарим комфорт.',
        '❤️ Вы лечите сердца — мы заботимся о вас.',
        '🫀 Каждое биение — это чья-то спасённая жизнь.',
        '💚 Ваша работа — искусство. Наша — забота о вашем комфорте.',
        '❤️ Берегите себя. Мы позаботимся о вашей одежде.',
        '🫀 24 часа смены? Мы сделали всё, чтобы вы не уставали.',
        '💚 Вы — настоящие герои в белых халатах!',
        '❤️ Спасибо за ваш труд. Вы — сердце медицины!'
    ];
    
    let currentQuoteIndex = 0;
    let isHovering = false;
    
    // Смена цитаты каждые 8 секунд
    function changeQuote() {
        if (!isHovering) {
            currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
            bubble.textContent = quotes[currentQuoteIndex];
        }
    }
    
    const intervalId = setInterval(changeQuote, 8000);
    
    // При наведении — случайная цитата
    mascot.addEventListener('mouseenter', function() {
        isHovering = true;
        const randomIndex = Math.floor(Math.random() * quotes.length);
        bubble.textContent = quotes[randomIndex];
    });
    
    // При уходе мыши — возвращаем автопереключение
    mascot.addEventListener('mouseleave', function() {
        isHovering = false;
        currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
        bubble.textContent = quotes[currentQuoteIndex];
    });
    
    // При клике — особое сообщение
    mascot.addEventListener('click', function() {
        bubble.textContent = '❤️ Спасибо, что доверяете нам заботу о вашем комфорте!';
        setTimeout(() => {
            if (!isHovering) {
                bubble.textContent = quotes[currentQuoteIndex];
            }
        }, 3500);
    });
});
