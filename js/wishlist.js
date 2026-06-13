// ===== js/wishlist.js - ИЗБРАННОЕ =====

function getWishlist() {
    const user = getCurrentUser();
    if (!user) return [];
    const key = `wishlist_${user.id}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
}

function saveWishlist(wishlist) {
    const user = getCurrentUser();
    if (!user) return;
    const key = `wishlist_${user.id}`;
    localStorage.setItem(key, JSON.stringify(wishlist));
}

function addToWishlist(productId) {
    const wishlist = getWishlist();
    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        saveWishlist(wishlist);
        showToast('❤️ Товар добавлен в избранное');
        return true;
    }
    return false;
}

function removeFromWishlist(productId) {
    let wishlist = getWishlist();
    wishlist = wishlist.filter(id => id !== productId);
    saveWishlist(wishlist);
    showToast('🗑️ Товар удалён из избранного');
}

function isInWishlist(productId) {
    const wishlist = getWishlist();
    return wishlist.includes(productId);
}

function toggleWishlist(productId) {
    if (isInWishlist(productId)) {
        removeFromWishlist(productId);
        return false;
    } else {
        addToWishlist(productId);
        return true;
    }
}

function getWishlistProducts() {
    const wishlist = getWishlist();
    if (!window.allProducts) return [];
    return window.allProducts.filter(p => wishlist.includes(p.id));
}
