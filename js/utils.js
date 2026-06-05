// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function getRandomRating() {
    return (3 + Math.random() * 2).toFixed(1);
}

function renderStars(rating) {
    let stars = '';
    for (let i = 0; i < Math.floor(rating); i++) stars += '<span class="star filled">★</span>';
    if (rating % 1 >= 0.5) stars += '<span class="star filled">½</span>';
    for (let i = 0; i < 5 - Math.ceil(rating); i++) stars += '<span class="star">★</span>';
    return stars;
}

// Делаем функции глобальными
window.escapeHtml = escapeHtml;
window.showToast = showToast;
window.getRandomRating = getRandomRating;
window.renderStars = renderStars;
