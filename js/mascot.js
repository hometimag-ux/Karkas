// ==================== МАСКОТ — СЕРДЦЕ С ЦИТАТАМИ ====================
document.addEventListener('DOMContentLoaded', function() {
    const mascot = document.getElementById('mascot');
    const bubble = document.getElementById('mascotBubble');
    
    // Цитаты о сердце и медицине
    const quotes = [
        '❤️ Ваше сердце спасает жизни. Наше — заботится о вас.',
        '💚 Спасибо, что дарите тепло. Мы дарим комфорт.',
        '🫀 Там, где сердце врача, там выздоравливают сердца пациентов.',
        '❤️ Вы лечите сердца. Мы шьём для вас с любовью.',
        '💚 Спасибо за ваш труд. Вы — настоящее сердце медицины!',
        '🫀 Каждое биение — это чья-то жизнь. Спасибо, что вы рядом.',
        '❤️ Ваша работа — искусство. Наша — забота о вашем комфорте.',
        '💚 Носите с комфортом. Спасайте с любовью.'
    ];
    
    let currentQuoteIndex = 0;
    let isHovering = false;
    let intervalId = null;
    
    // Смена цитаты каждые 8 секунд
    function changeQuote() {
        if (!isHovering && bubble) {
            currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
            bubble.textContent = quotes[currentQuoteIndex];
        }
    }
    
    if (mascot && bubble) {
        // Запускаем автопереключение
        intervalId = setInterval(changeQuote, 8000);
        
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
    }
    
    console.log('✅ Маскот-сердце запущен (только десктоп)');
});
