/**
 * Tienda virtual — página pública.
 * Los productos, categorías y la configuración vienen del API (/api/*).
 */

const state = {
  config: null,
  products: [],
  categories: [],
  cart: [],            // [{ id, qty }]
  selectedCategory: 'all',
  selectedAge: 'all',
  searchQuery: '',
};

const CART_KEY = 'cf_carrito';
const MAX_QTY = 99;
const $ = (id) => document.getElementById(id);

// ---------- Utilidades ----------
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatPrice(n) {
  return '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Las fotos pueden ser archivos del sitio (assets/img/...) o ids guardados en KV.
function photoUrl(ref) {
  return ref.startsWith('assets/') ? '/' + ref : '/api/fotos/' + ref;
}

function formatPhone(digits) {
  const m = /^57(\d{3})(\d{3})(\d{4})$/.exec(digits);
  return m ? `+57 ${m[1]} ${m[2]} ${m[3]}` : '+' + digits;
}

function discountPct(p) {
  return p.precio_anterior && p.precio_anterior > p.precio
    ? Math.round((1 - p.precio / p.precio_anterior) * 100)
    : 0;
}

function ageLabel(p) {
  return p.edad_texto || { '1-3': '1 a 3 años', '3-5': '3 a 5 años', '5+': '5+ años' }[p.edad_rango] || '';
}

async function api(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

// ---------- Inicio ----------
document.addEventListener('DOMContentLoaded', async () => {
  loadCart();
  setupEvents();
  updateCartUI();
  try {
    const [config, products, categories] = await Promise.all([
      api('/api/config'), api('/api/productos'), api('/api/categorias'),
    ]);
    state.config = config;
    state.products = products;
    state.categories = categories;
  } catch (e) {
    console.error(e);
    $('products-grid').innerHTML = `
      <div class="grid-status">
        <p>No pudimos cargar los productos. Revisa tu conexión e inténtalo de nuevo.</p>
        <button class="btn btn-secondary" onclick="location.reload()">Reintentar</button>
      </div>`;
    return;
  }
  applyConfig();
  renderCategories();
  pruneCart();
  renderProducts();
  updateCartUI();
});

// ---------- Configuración de la tienda ----------
function applyConfig() {
  const c = state.config;

  const words = c.nombre.trim().split(/\s+/);
  const last = words.pop();
  const titleHtml = words.length ? `${esc(words.join(' '))} <span>${esc(last)}</span>` : esc(last);
  document.querySelectorAll('[data-brand-title]').forEach((el) => { el.innerHTML = titleHtml; });
  document.querySelectorAll('[data-brand-name]').forEach((el) => { el.textContent = c.nombre + (c.eslogan ? ' - ' + c.eslogan : ''); });
  document.querySelectorAll('[data-brand-subtitle]').forEach((el) => { el.textContent = c.eslogan; el.hidden = !c.eslogan; });
  if (c.logo) {
    document.querySelectorAll('[data-brand-logo]').forEach((el) => { el.src = photoUrl(c.logo); el.alt = 'Logo ' + c.nombre; });
    $('favicon').href = photoUrl(c.logo);
  }
  document.title = `${c.nombre} | Tienda de juguetes y materiales Montessori`;

  if (c.bienvenida) $('top-bar-text').textContent = c.bienvenida;

  document.querySelectorAll('[data-wa-display]').forEach((el) => {
    el.textContent = el.dataset.waDisplay === 'full' ? formatPhone(c.whatsapp) : formatPhone(c.whatsapp).replace(/^\+57 /, '');
  });

  const generalMsg = encodeURIComponent(`¡Hola! Vi tu tienda ${c.nombre} y me gustaría hacerte una consulta sobre materiales para mi hijo/a.`);
  const waDirectUrl = `https://wa.me/${c.whatsapp}?text=${generalMsg}`;
  $('floating-wa-btn').href = waDirectUrl;
  ['pedagogue-chat-btn', 'header-contact-btn', 'footer-order-btn'].forEach((id) => {
    const el = $(id);
    if (el) el.onclick = () => window.open(waDirectUrl, '_blank', 'noopener');
  });

  const addr = $('footer-address');
  addr.hidden = !c.direccion;
  addr.textContent = c.direccion ? '📍 ' + c.direccion : '';

  const links = [];
  const asUrl = (v, base) => (/^https?:\/\//i.test(v) ? v : base + v.replace(/^@/, ''));
  if (c.instagram) links.push(`<a href="${esc(asUrl(c.instagram, 'https://instagram.com/'))}" target="_blank" rel="noopener noreferrer">Instagram</a>`);
  if (c.facebook) links.push(`<a href="${esc(asUrl(c.facebook, 'https://facebook.com/'))}" target="_blank" rel="noopener noreferrer">Facebook</a>`);
  $('footer-social').innerHTML = links.join(' · ');
}

function renderCategories() {
  const pills = $('category-filter-pills');
  pills.innerHTML = '<button class="pill active" data-category="all">✨ Todos los materiales</button>' +
    state.categories.map((c) => `<button class="pill" data-category="${c.id}">${esc(c.nombre)}</button>`).join('');
  $('footer-categories').innerHTML = state.categories
    .map((c) => `<li><a href="#catalogo" data-quick-cat="${c.id}">${esc(c.nombre)}</a></li>`).join('');
}

// ---------- Catálogo ----------
function normalize(s) {
  return String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function renderProducts() {
  const container = $('products-grid');
  const emptyState = $('no-products-message');
  const q = normalize(state.searchQuery.trim());

  const filtered = state.products.filter((p) => {
    if (state.selectedCategory !== 'all' && String(p.categoria_id) !== state.selectedCategory) return false;
    if (state.selectedAge !== 'all' && p.edad_rango !== state.selectedAge) return false;
    if (q && !normalize(`${p.nombre} ${p.descripcion} ${p.categoria}`).includes(q)) return false;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  container.innerHTML = filtered.map((p) => {
    const pct = discountPct(p);
    const foto = p.fotos[0];
    return `
    <article class="product-card${p.agotado ? ' sold-out' : ''}" data-id="${p.id}">
      <div class="product-thumb-wrapper" data-action="detail" data-id="${p.id}">
        ${foto ? `<img src="${esc(photoUrl(foto))}" alt="${esc(p.nombre)}" class="product-img" loading="lazy">` : '<div class="product-img-empty">🧸</div>'}
        ${p.agotado ? '<span class="product-badge-corner badge-soldout">Agotado</span>'
          : p.destacado ? '<span class="product-badge-corner">⭐ Destacado</span>' : ''}
        ${pct ? `<span class="discount-tag">-${pct}%</span>` : ''}
      </div>
      <div class="product-card-body">
        ${p.categoria ? `<span class="product-category-name">${esc(p.categoria)}</span>` : ''}
        <h3 class="product-card-title">${esc(p.nombre)}</h3>
        <p class="product-card-desc clamp-3">${esc(p.descripcion)}</p>
        <div class="product-footer-row">
          <div class="product-price-box">
            ${p.precio_anterior ? `<span class="price-old">${formatPrice(p.precio_anterior)}</span>` : '<span class="price-label">Precio</span>'}
            <span class="price-val">${formatPrice(p.precio)}</span>
          </div>
          <div class="product-actions">
            <button class="btn-details" data-action="detail" data-id="${p.id}">Ver ficha</button>
            <button class="btn-add-cart" data-action="add" data-id="${p.id}" ${p.agotado ? 'disabled' : ''}>
              <span>${p.agotado ? 'Agotado' : '+ Agregar'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>`;
  }).join('');
}

function setActiveCategory(value) {
  state.selectedCategory = value;
  document.querySelectorAll('#category-filter-pills .pill').forEach((p) => p.classList.toggle('active', p.dataset.category === value));
  renderProducts();
}

// ---------- Eventos ----------
function setupEvents() {
  $('category-filter-pills').addEventListener('click', (e) => {
    const pill = e.target.closest('.pill');
    if (pill) setActiveCategory(pill.dataset.category);
  });

  $('age-filter-pills').addEventListener('click', (e) => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    document.querySelectorAll('#age-filter-pills .pill').forEach((p) => p.classList.toggle('active', p === pill));
    state.selectedAge = pill.dataset.age;
    renderProducts();
  });

  const searchInput = $('search-input');
  const clearBtn = $('clear-search-btn');
  searchInput.addEventListener('input', () => {
    state.searchQuery = searchInput.value;
    clearBtn.style.display = state.searchQuery ? 'flex' : 'none';
    renderProducts();
  });
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    clearBtn.style.display = 'none';
    renderProducts();
  });

  $('reset-filters-btn').addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    state.selectedAge = 'all';
    clearBtn.style.display = 'none';
    document.querySelectorAll('#age-filter-pills .pill').forEach((p) => p.classList.toggle('active', p.dataset.age === 'all'));
    setActiveCategory('all');
  });

  document.addEventListener('click', (e) => {
    const quick = e.target.closest('[data-quick-cat]');
    if (quick) setActiveCategory(quick.dataset.quickCat);

    const el = e.target.closest('[data-action]');
    if (!el) return;
    const id = Number(el.dataset.id);
    switch (el.dataset.action) {
      case 'add': addToCart(id, el); break;
      case 'detail': openProductModal(id); break;
      case 'qty': updateCartQty(id, Number(el.dataset.delta)); break;
      case 'remove': removeFromCart(id); break;
      case 'photo': showGalleryPhoto(Number(el.dataset.index)); break;
      case 'add-close': addToCart(id, el); closeProductModal(); break;
    }
  });

  // Carrito
  const drawer = $('cart-drawer');
  const overlay = $('cart-overlay');
  const openCart = () => { drawer.classList.add('active'); overlay.classList.add('active'); document.body.style.overflow = 'hidden'; };
  const closeCart = () => { drawer.classList.remove('active'); overlay.classList.remove('active'); document.body.style.overflow = ''; };
  $('open-cart-btn').addEventListener('click', openCart);
  $('close-cart-btn').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  $('empty-cart-explore-btn').addEventListener('click', closeCart);
  $('checkout-whatsapp-btn').addEventListener('click', sendOrder);

  // Modal de producto
  $('close-product-modal-btn').addEventListener('click', closeProductModal);
  $('product-modal-overlay').addEventListener('click', closeProductModal);

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeProductModal();
    closeCart();
  });
}

// ---------- Carrito ----------
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    state.cart = Array.isArray(saved)
      ? saved.filter((i) => Number.isInteger(i.id) && Number.isInteger(i.qty) && i.qty > 0).map((i) => ({ id: i.id, qty: Math.min(i.qty, MAX_QTY) }))
      : [];
  } catch (e) {
    state.cart = [];
  }
}

function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); } catch (e) { /* modo privado */ }
}

// Quita del carrito lo que ya no existe o se agotó.
function pruneCart() {
  const before = state.cart.length;
  state.cart = state.cart.filter((i) => {
    const p = state.products.find((x) => x.id === i.id);
    return p && !p.agotado;
  });
  if (state.cart.length !== before) {
    saveCart();
    showToast('Quitamos del carrito productos que ya no están disponibles');
  }
}

function cartLines() {
  return state.cart
    .map((i) => ({ ...i, product: state.products.find((p) => p.id === i.id) }))
    .filter((l) => l.product);
}

function addToCart(id, btn) {
  const product = state.products.find((p) => p.id === id);
  if (!product || product.agotado) return;
  const line = state.cart.find((i) => i.id === id);
  if (line) line.qty = Math.min(line.qty + 1, MAX_QTY);
  else state.cart.push({ id, qty: 1 });
  saveCart();
  updateCartUI();

  if (btn && btn.classList.contains('btn-add-cart')) {
    const original = btn.innerHTML;
    btn.innerHTML = '<span>✓ ¡Agregado!</span>';
    btn.classList.add('added');
    setTimeout(() => { btn.innerHTML = original; btn.classList.remove('added'); }, 1200);
  }
  showToast(`¡Agregado!: ${product.nombre}`);
  const badge = $('cart-counter');
  badge.classList.remove('bump');
  void badge.offsetWidth;
  badge.classList.add('bump');
}

function updateCartQty(id, delta) {
  const i = state.cart.findIndex((x) => x.id === id);
  if (i === -1) return;
  state.cart[i].qty = Math.min(state.cart[i].qty + delta, MAX_QTY);
  if (state.cart[i].qty <= 0) state.cart.splice(i, 1);
  saveCart();
  updateCartUI();
}

function removeFromCart(id) {
  state.cart = state.cart.filter((i) => i.id !== id);
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const lines = state.products.length ? cartLines() : state.cart.map((i) => ({ ...i, product: null }));
  const count = state.cart.reduce((s, i) => s + i.qty, 0);
  const total = lines.reduce((s, l) => s + (l.product ? l.product.precio * l.qty : 0), 0);

  $('cart-counter').textContent = count;
  $('drawer-items-count').textContent = `${count} ${count === 1 ? 'producto' : 'productos'}`;

  const container = $('cart-items-container');
  container.querySelectorAll('.cart-item-row').forEach((r) => r.remove());
  const empty = state.cart.length === 0;
  $('cart-empty-state').style.display = empty ? 'block' : 'none';
  $('drawer-form-box').style.display = empty ? 'none' : 'block';
  $('drawer-checkout-section').style.display = empty ? 'none' : 'flex';
  if (empty) return;

  $('cart-total-price').textContent = formatPrice(total);
  container.insertAdjacentHTML('afterbegin', lines.filter((l) => l.product).map(({ product: p, qty }) => `
    <div class="cart-item-row" data-id="${p.id}">
      ${p.fotos[0] ? `<img src="${esc(photoUrl(p.fotos[0]))}" alt="${esc(p.nombre)}" class="cart-item-thumb">` : '<div class="cart-item-thumb product-img-empty">🧸</div>'}
      <div class="cart-item-details">
        ${p.categoria ? `<span class="cart-item-meta">${esc(p.categoria)}</span>` : ''}
        <h4 class="cart-item-title">${esc(p.nombre)}</h4>
        <span class="cart-item-price">${formatPrice(p.precio)} · Subtotal ${formatPrice(p.precio * qty)}</span>
      </div>
      <div class="cart-item-actions">
        <div class="qty-stepper">
          <button class="qty-btn" data-action="qty" data-id="${p.id}" data-delta="-1" aria-label="Disminuir">−</button>
          <span class="qty-val">${qty}</span>
          <button class="qty-btn" data-action="qty" data-id="${p.id}" data-delta="1" aria-label="Aumentar">+</button>
        </div>
        <button class="cart-item-remove-btn" data-action="remove" data-id="${p.id}">Quitar</button>
      </div>
    </div>`).join(''));
}

// ---------- Pedido por WhatsApp ----------
function requireField(id, message) {
  const input = $(id);
  const value = input.value.trim();
  if (value) return value;
  showToast(message);
  input.focus();
  input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  input.classList.add('input-error-pulse');
  setTimeout(() => input.classList.remove('input-error-pulse'), 1200);
  return null;
}

function sendOrder() {
  const lines = cartLines();
  if (lines.length === 0) { showToast('El carrito está vacío'); return; }

  const name = requireField('cust-name', 'Por favor escribe tu nombre');
  if (!name) return;
  const city = requireField('cust-city', 'Por favor escribe tu ciudad');
  if (!city) return;
  const address = requireField('cust-address', 'Por favor escribe tu dirección de entrega');
  if (!address) return;
  const kid = $('cust-kid').value.trim();
  const notes = $('cust-notes').value.trim();

  const total = lines.reduce((s, l) => s + l.product.precio * l.qty, 0);
  const items = lines.map((l, i) =>
    `  ${i + 1}. *${l.product.nombre}*\n     Cantidad: ${l.qty} | Subtotal: ${formatPrice(l.product.precio * l.qty)}`).join('\n');

  let msg = `👋 *¡Hola! Quiero hacer un pedido en ${state.config.nombre}:*\n\n`;
  msg += `📦 *PRODUCTOS:*\n${items}\n\n`;
  msg += `💰 *TOTAL PRODUCTOS:* ${formatPrice(total)}\n\n`;
  msg += `👤 *DATOS DEL PEDIDO:*\n• *Nombre:* ${name}\n• *Ciudad:* ${city}\n• *Dirección:* ${address}\n`;
  if (kid) msg += `• *Para el niño/a:* ${kid}\n`;
  if (notes) msg += `• *Nota:* ${notes}\n`;
  msg += `\n💬 ¿Me confirmas disponibilidad, costo de envío y medios de pago? ¡Muchas gracias!`;

  window.open(`https://wa.me/${state.config.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  showToast('¡Abriendo WhatsApp con tu pedido!');
}

// ---------- Detalle del producto ----------
let galleryPhotos = [];

function openProductModal(id) {
  const p = state.products.find((x) => x.id === id);
  if (!p) return;
  galleryPhotos = p.fotos;
  const pct = discountPct(p);

  $('product-modal-body').innerHTML = `
    <div class="product-modal-grid">
      <div class="gallery">
        <div class="gallery-main">
          ${p.fotos[0] ? `<img src="${esc(photoUrl(p.fotos[0]))}" alt="${esc(p.nombre)}" class="product-modal-img" id="gallery-main-img">` : '<div class="product-modal-img product-img-empty">🧸</div>'}
          ${p.agotado ? '<span class="product-badge-corner badge-soldout">Agotado</span>' : ''}
        </div>
        ${p.fotos.length > 1 ? `<div class="gallery-thumbs">${p.fotos.map((f, i) =>
          `<button class="gallery-thumb${i === 0 ? ' active' : ''}" data-action="photo" data-index="${i}" aria-label="Ver foto ${i + 1}"><img src="${esc(photoUrl(f))}" alt=""></button>`).join('')}</div>` : ''}
      </div>

      <div class="product-modal-info">
        <div class="modal-badge-group">
          ${ageLabel(p) ? `<span class="modal-badge age">👶 ${esc(ageLabel(p))}</span>` : ''}
          ${p.categoria ? `<span class="modal-badge cat">${esc(p.categoria)}</span>` : ''}
        </div>
        <h2 class="product-modal-title">${esc(p.nombre)}</h2>
        <div class="product-modal-price">
          ${formatPrice(p.precio)}
          ${p.precio_anterior ? `<span class="price-old">${formatPrice(p.precio_anterior)}</span>` : ''}
          ${pct ? `<span class="discount-inline">-${pct}%</span>` : ''}
        </div>
        ${p.descripcion ? `<p class="product-modal-desc">${esc(p.descripcion)}</p>` : ''}

        ${p.nota ? `<div class="pedagogical-box"><h5>💡 Nota de la pedagoga</h5><p>${esc(p.nota)}</p></div>` : ''}
        ${p.habilidades.length ? `<div class="skills-list"><h5>Habilidades que potencia:</h5>
          <div class="skills-tags">${p.habilidades.map((s) => `<span class="skill-tag">✓ ${esc(s)}</span>`).join('')}</div></div>` : ''}

        <button class="btn btn-primary btn-full" data-action="add-close" data-id="${p.id}" ${p.agotado ? 'disabled' : ''}>
          <span>${p.agotado ? 'Producto agotado' : `Agregar al carrito (${formatPrice(p.precio)})`}</span>
        </button>
      </div>
    </div>`;

  $('product-modal-overlay').classList.add('active');
  $('product-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function showGalleryPhoto(i) {
  const img = $('gallery-main-img');
  if (!img || !galleryPhotos[i]) return;
  img.src = photoUrl(galleryPhotos[i]);
  document.querySelectorAll('.gallery-thumb').forEach((t, n) => t.classList.toggle('active', n === i));
}

function closeProductModal() {
  $('product-modal-overlay').classList.remove('active');
  $('product-modal').classList.remove('active');
  if (!$('cart-drawer').classList.contains('active')) document.body.style.overflow = '';
}

// ---------- Aviso ----------
let toastTimer = null;
function showToast(message) {
  $('toast-message').textContent = message;
  $('toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2800);
}
