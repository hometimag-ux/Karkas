// ===== ТОВАРЫ =====
const products = [
  { id: 1, name: "Халат Aqua", price: 3490, wholesalePrice: 2610, emoji: "👩‍⚕️💙" },
  { id: 2, name: "Костюм Wave", price: 5290, wholesalePrice: 3960, emoji: "👨‍⚕️💙" },
  { id: 3, name: "Скраб Ocean", price: 4490, wholesalePrice: 3360, emoji: "🥼💙" },
  { id: 4, name: "Брюки Breeze", price: 2290, wholesalePrice: 1710, emoji: "👖💙" },
  { id: 5, name: "Туника Pearl", price: 2990, wholesalePrice: 2240, emoji: "👚💙" },
  { id: 6, name: "Футболка Fresh", price: 1990, wholesalePrice: 1490, emoji: "👕💙" }
];

let cart = [];
let userRole = "retail";
let searchQuery = "";

function getPrice(p) { return userRole === "wholesale" ? p.wholesalePrice : p.price; }
function saveCart() { localStorage.setItem("medCart", JSON.stringify(cart)); updateCart(); }
function loadCart() { const saved = localStorage.getItem("medCart"); if (saved) cart = JSON.parse(saved); updateCart(); }

function updateCart() {
  const counter = document.getElementById("cartCounter");
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  counter.innerText = totalItems;
  const container = document.getElementById("cartItems");
  const totalSpan = document.getElementById("cartTotal");
  if (cart.length === 0) { container.innerHTML = "<p style='text-align:center;'>Корзина пуста</p>"; totalSpan.innerHTML = ""; return; }
  let html = "", total = 0;
  cart.forEach(item => {
    const price = getPrice(item);
    total += price * item.quantity;
    html += `<div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; padding:0.5rem; border-bottom:1px solid #4db6ac;"><div><strong>${item.name}</strong><br>${price} ₽</div><div><button onclick="updateQty(${item.id}, -1)" style="background:#4db6ac; border:none; width:28px; border-radius:50%; color:white;">-</button><span style="margin:0 0.5rem;">${item.quantity}</span><button onclick="updateQty(${item.id}, 1)" style="background:#4db6ac; border:none; width:28px; border-radius:50%; color:white;">+</button><button onclick="removeFromCart(${item.id})" style="background:none; border:none;">🗑️</button></div></div>`;
  });
  container.innerHTML = html;
  totalSpan.innerHTML = `<strong>Итого: ${total.toLocaleString()} ₽</strong>`;
}

window.updateQty = (id, delta) => {
  const idx = cart.findIndex(i => i.id === id);
  if (idx !== -1) { cart[idx].quantity += delta; if (cart[idx].quantity <= 0) cart.splice(idx, 1); saveCart(); }
};
window.removeFromCart = (id) => { cart = cart.filter(i => i.id !== id); saveCart(); };

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) existing.quantity++; else cart.push({ ...product, quantity: 1 });
  saveCart();
  showToast(`${product.name} добавлен в корзину! 💙`);
  createDrops();
}

function checkout() {
  if (cart.length === 0) { showToast("Корзина пуста"); return; }
  showToast("✅ Заказ оформлен! Спасибо за покупку! 💙");
  createDrops();
  cart = []; saveCart(); closeCart();
}

function renderProducts() {
  let filtered = products;
  if (searchQuery) filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = filtered.map((p, idx) => `<div class="product-card"><div class="product-img">${p.emoji}</div><div class="product-info" style="padding:1.5rem;"><h3>${p.name}</h3><div style="font-size:1.5rem; font-weight:800; margin:0.5rem 0;">${getPrice(p).toLocaleString()} ₽</div><button class="btn-primary add-to-cart" data-id="${p.id}">В корзину</button></div></div>`).join('');
  document.querySelectorAll('.add-to-cart').forEach(btn => btn.addEventListener('click', () => addToCart(products.find(p => p.id === parseInt(btn.dataset.id)))));
}

function setRole(role) {
  userRole = role;
  document.querySelectorAll('.role-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.role === role));
  renderProducts(); updateCart();
  showToast(role === "wholesale" ? "📦 Оптовый режим! Цены снижены на 25%" : "🛍️ Розничный режим");
}

function showToast(msg) {
  const toast = document.createElement("div"); toast.className = "toast"; toast.innerText = msg;
  document.body.appendChild(toast); setTimeout(() => toast.remove(), 3000);
}

function createDrops() {
  for (let i = 0; i < 40; i++) {
    const drop = document.createElement('div');
    drop.innerHTML = ['💧','💙','💚','🌊'][Math.floor(Math.random()*4)];
    drop.style.position = 'fixed';
    drop.style.left = Math.random() * 100 + '%';
    drop.style.top = Math.random() * 100 + '%';
    drop.style.fontSize = Math.random() * 20 + 15 + 'px';
    drop.style.pointerEvents = 'none';
    drop.style.zIndex = '999';
    drop.style.animation = `floatDrop ${Math.random() * 2 + 1}s ease-out forwards`;
    document.body.appendChild(drop);
    setTimeout(() => drop.remove(), 2000);
  }
}

// ===== СКРОЛЛ-ТРИГГЕР АНИМАЦИИ (ФИШКА 3) =====
function initScrollTrigger() {
  const elements = document.querySelectorAll('.fade-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.2 });
  elements.forEach(el => observer.observe(el));
}

// ===== ПАРАЛЛАКС ЭФФЕКТ (ФИШКА 2) =====
function initParallax() {
  const card = document.querySelector('.parallax-card');
  if (!card) return;
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    card.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
  });
}

// ===== ГОЛОСОВОЙ ПОИСК (ФИШКА 4) =====
let recognition = null;
function initVoiceSearch() {
  const voiceBtn = document.getElementById('voiceBtn');
  const searchInput = document.getElementById('searchInput');
  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      searchInput.value = text;
      searchQuery = text;
      renderProducts();
      voiceBtn.classList.remove('listening');
    };
    recognition.onend = () => voiceBtn.classList.remove('listening');
  }
  voiceBtn.addEventListener('click', () => {
    if (recognition) {
      recognition.start();
      voiceBtn.classList.add('listening');
    } else alert('Голосовой поиск поддерживается в Chrome');
  });
  searchInput.addEventListener('input', (e) => { searchQuery = e.target.value; renderProducts(); });
}

// ===== СНЕЙК-БАР (ФИШКА 5) =====
function initSnackbar() {
  const snackbar = document.getElementById('snackbar');
  const closeBtn = document.getElementById('closeSnackbar');
  if (!localStorage.getItem('snackbarClosed')) {
    setTimeout(() => snackbar.classList.add('show'), 2000);
    setTimeout(() => snackbar.classList.remove('show'), 8000);
  }
  closeBtn.addEventListener('click', () => { snackbar.classList.remove('show'); localStorage.setItem('snackbarClosed', 'true'); });
}

// ===== МАСКОТ (ФИШКА 1) =====
function initMascot() {
  const mascot = document.getElementById('mascot');
  const bubble = document.getElementById('mascotBubble');
  const messages = ['💙 Привет! Я Капля!', '💚 Хотите скидку?', '🌊 Напишите нам!', '💙 У нас опт от 10 штук'];
  let i = 0;
  mascot.addEventListener('click', () => {
    bubble.textContent = messages[i % messages.length];
    i++;
    setTimeout(() => { if (bubble.textContent !== 'Привет! Я Капля 💙') bubble.textContent = 'Привет! Я Капля 💙'; }, 2000);
  });
}

// ===== КОРЗИНА =====
function openCart() { document.getElementById("cartSidebar").classList.add("open"); document.getElementById("overlay").classList.add("active"); }
function closeCart() { document.getElementById("cartSidebar").classList.remove("open"); document.getElementById("overlay").classList.remove("active"); }


// ===== Мобильное меню ===== 
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });
}

// Закрытие меню при клике вне его
document.addEventListener('click', (e) => {
    if (mobileMenu && mobileMenuBtn) {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.remove('active');
        }
    }
});
// ===== ИНИЦИАЛИЗАЦИЯ =====
document.querySelectorAll(".magnet-item").forEach(m => m.addEventListener("click", () => { showToast(`📩 "${m.querySelector('h4').innerText}" отправлен на email!`); createDrops(); }));
document.getElementById("shopNowBtn")?.addEventListener("click", () => document.getElementById("productsGrid").scrollIntoView({ behavior: "smooth" }));
document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
document.getElementById("overlay").addEventListener("click", closeCart);
document.getElementById("checkoutBtn").addEventListener("click", checkout);
document.querySelectorAll(".role-btn").forEach(btn => btn.addEventListener("click", () => setRole(btn.dataset.role)));

loadCart(); renderProducts(); initScrollTrigger(); initParallax(); initVoiceSearch(); initSnackbar(); initMascot();
