// ===== КОРЗИНА =====
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counter = document.getElementById('cartCounter');
    if (counter) counter.textContent = total;
}

function addToCartById(id) {
    const product = window.allProducts ? window.allProducts.find(p => p.id === id) : null;
    if (!product) return;
    
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === id);
    
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.discount_price || product.price,
            quantity: 1,
            image: product.images?.[0] || null
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    if (window.showToast) window.showToast(`✅ ${product.title} добавлен в корзину`);
}

// Загружаем счётчик при старте
document.addEventListener('DOMContentLoaded', updateCartCount);

// Делаем функции глобальными
window.updateCartCount = updateCartCount;
window.addToCartById = addToCartById;
