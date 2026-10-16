/**
 * CEREBRO FELIZ - Learning Center & Therapy
 * Tienda Virtual & Catálogo de Estimulación Infantil
 * Especialista: Sharon Espinel (Psicóloga)
 */

// Estado global y configuración
const CONFIG = {
  defaultPhone: '573194298413', // Sharon Espinel (Colombia: 57 + 319 429 8413)
  currency: 'COP',
  symbol: '$'
};

// Datos de los productos pedagógicos
const PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Arcoíris Waldorf y Torres Apilables',
    category: 'sensorial',
    categoryLabel: 'Sensorial & Montessori',
    ageRange: '1-3',
    ageLabel: '1 a 5 años',
    badge: '⭐ Más Pedido',
    price: 85000,
    image: 'assets/img/bloques-arcoiris.jpg',
    shortDesc: 'Set de arcoíris de madera natural y anillos apilables con tintas no tóxicas en tonos vivos y pasteles.',
    pedagogicBenefit: 'Estimula la creatividad espacial, equilibrio motriz y juego no estructurado.',
    skills: ['Equilibrio y física intuitiva', 'Discriminación cromática', 'Juego simbólico', 'Paciencia y ensayo-error'],
    pedagogueNote: 'El arcoíris es un juguete abierto por excelencia: los niños lo usan como puente, cuna para muñecos, túnel o torre de equilibrio según su propia imaginación.'
  },
  {
    id: 'prod-2',
    name: 'Tablero Sensorial "Busy Board" Explorador',
    category: 'motricidad',
    categoryLabel: 'Motricidad Fina',
    ageRange: '1-3',
    ageLabel: '1 a 3 años',
    badge: '🌱 Montessori Puro',
    price: 135000,
    image: 'assets/img/busy-board-sensorial.jpg',
    shortDesc: 'Panel de madera con cerrojos, engranajes, cremalleras, cordones, reloj didáctico y laberinto de cuentas.',
    pedagogicBenefit: 'Desarrolla la pinza digital, fuerza de agarre y resolución de problemas de la vida práctica.',
    skills: ['Independencia y vida práctica', 'Coordinación ojo-mano', 'Atención sostenida', 'Curiosidad táctil'],
    pedagogueNote: 'Satisface la necesidad natural de los pequeños de manipular objetos cotidianos de manera segura, prolongando periodos de concentración autónoma.'
  },
  {
    id: 'prod-3',
    name: 'Tablero de Conteo, Formas y Letras',
    category: 'cognitivo',
    categoryLabel: 'Lógica & Conteo',
    ageRange: '3-5',
    ageLabel: '3 a 6 años',
    badge: '🧠 Neurodesarrollo',
    price: 92000,
    image: 'assets/img/puzzle-alfabeto-numeros.jpg',
    shortDesc: 'Puzzle de madera encajable con abecedario tridimensional, números, formas geométricas y aros contadores.',
    pedagogicBenefit: 'Facilita la iniciación a la lectoescritura y al concepto matemático de cantidad.',
    skills: ['Conteo uno a uno', 'Reconocimiento grafema-fonema', 'Encaje y orientación espacial', 'Clasificación por forma y color'],
    pedagogueNote: 'Al tocar las letras y números en 3D, el niño no solo memoriza visualmente, sino que fija el concepto a través de la memoria muscular y sensorial.'
  },
  {
    id: 'prod-4',
    name: 'Juego de Expresiones y Educación Emocional',
    category: 'emociones',
    categoryLabel: 'Educación Emocional',
    ageRange: '3-5',
    ageLabel: '3 a 8 años',
    badge: '💛 Salud Emocional',
    price: 78000,
    image: 'assets/img/juego-emociones.jpg',
    shortDesc: 'Tarjetas ilustradas en madera y fichas de gestos para identificar alegría, enojo, miedo, tristeza y calma.',
    pedagogicBenefit: 'Herramienta clave para la autorregulación infantil y el diálogo afectivo en familia.',
    skills: ['Identificación de emociones primarias', 'Empatía hacia otros', 'Expresión verbal de sentimientos', 'Estrategias de calma'],
    pedagogueNote: 'Ideal para usar al final del día. Ayuda a los niños que aún no tienen suficiente vocabulario a mostrar con una ficha cómo se sintieron en su día escolar.'
  },
  {
    id: 'prod-5',
    name: 'Cuencos de Madera y Bolas de Clasificación',
    category: 'sensorial',
    categoryLabel: 'Sensorial & Montessori',
    ageRange: '1-3',
    ageLabel: '1 a 4 años',
    badge: '✨ Coordinación',
    price: 68000,
    image: 'assets/img/cuencos-clasificacion.jpg',
    shortDesc: 'Set de 6 cuencos de madera de colores arcoíris con esferas a juego, pinzas de madera ergonómicas y bandeja.',
    pedagogicBenefit: 'Fortalece los músculos de la mano para la futura sujeción del lápiz.',
    skills: ['Pinza con pinzas ergonómicas', 'Agrupación por propiedades', 'Secuenciación lógica', 'Control inhibitorio'],
    pedagogueNote: 'El uso de las pinzas de madera ejercita exactamente los músculos lumbricales necesarios para que el niño tome correctamente el lápiz al entrar al colegio.'
  },
  {
    id: 'prod-6',
    name: 'Zorrito de Hilado y Costura Motriz',
    category: 'motricidad',
    categoryLabel: 'Motricidad Fina',
    ageRange: '3-5',
    ageLabel: '3 a 7 años',
    badge: '🦊 Calma y Foco',
    price: 49000,
    image: 'assets/img/juego-hilado-motricidad.jpg',
    shortDesc: 'Figura de animalito en madera pulida con perforaciones de precisión, cordones de algodón de colores y aguja de madera.',
    pedagogicBenefit: 'Estimula la paciencia, ritmo respiratorio y destreza bimanual simétrica.',
    skills: ['Coordinación óculo-manual fina', 'Paciencia y perseverancia', 'Cruzar la línea media corporal', 'Precisión de trazo'],
    pedagogueNote: 'Coser e hilar genera un efecto relajante similar a un ejercicio de mindfulness infantil. Es excelente para momentos de transición antes de ir a dormir.'
  }
];

// Estado de la aplicación
const savedPhone = localStorage.getItem('ludikids_wa_phone');
const initialPhone = (savedPhone && savedPhone !== '573001234567') ? savedPhone : CONFIG.defaultPhone;

const state = {
  cart: [],
  selectedCategory: 'all',
  selectedAge: 'all',
  searchQuery: '',
  targetPhone: initialPhone
};

// Formateador de precios en moneda local
function formatPrice(number) {
  return '$ ' + number.toLocaleString('es-CO');
}

// Inicialización de la app
document.addEventListener('DOMContentLoaded', () => {
  // Asegurar que el número de Sharon quede configurado
  if (!savedPhone || savedPhone === '573001234567') {
    localStorage.setItem('ludikids_wa_phone', CONFIG.defaultPhone);
  }
  loadCartFromStorage();
  updatePhoneDisplay();
  renderProducts();
  setupFilterEvents();
  setupCartEvents();
  setupModalEvents();
  setupSettingsEvents();
  setupShareGuideEvents();
});

// Guardar y cargar carrito en localStorage
function saveCartToStorage() {
  localStorage.setItem('ludikids_cart', JSON.stringify(state.cart));
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('ludikids_cart');
    if (saved) {
      state.cart = JSON.parse(saved);
      updateCartUI();
    }
  } catch (e) {
    console.error('Error cargando carrito:', e);
    state.cart = [];
  }
}

// Renderizado del catálogo de productos
function renderProducts() {
  const container = document.getElementById('products-grid');
  const emptyState = document.getElementById('no-products-message');
  if (!container) return;

  const filtered = PRODUCTS.filter(prod => {
    // Filtro por categoría
    const matchesCategory = state.selectedCategory === 'all' || prod.category === state.selectedCategory;
    
    // Filtro por edad
    let matchesAge = true;
    if (state.selectedAge !== 'all') {
      matchesAge = prod.ageRange === state.selectedAge || (state.selectedAge === '5+' && (prod.ageRange === '3-5' || prod.ageRange === '5+'));
    }

    // Filtro por búsqueda
    let matchesSearch = true;
    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase();
      matchesSearch = prod.name.toLowerCase().includes(q) ||
                      prod.shortDesc.toLowerCase().includes(q) ||
                      prod.pedagogicBenefit.toLowerCase().includes(q) ||
                      prod.categoryLabel.toLowerCase().includes(q);
    }

    return matchesCategory && matchesAge && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = filtered.map(prod => `
    <article class="product-card" data-id="${prod.id}">
      <div class="product-thumb-wrapper">
        <img src="${prod.image}" alt="${prod.name}" class="product-img" loading="lazy">
        <span class="product-badge-corner">${prod.badge}</span>
        <span class="product-age-tag">👶 ${prod.ageLabel}</span>
      </div>

      <div class="product-card-body">
        <span class="product-category-name">${prod.categoryLabel}</span>
        <h3 class="product-card-title">${prod.name}</h3>
        <p class="product-card-desc">${prod.shortDesc}</p>

        <div class="pedagogic-benefit-pill">
          <span>🎯</span>
          <div>
            <strong>Beneficio pedagógico:</strong> ${prod.pedagogicBenefit}
          </div>
        </div>

        <div class="product-footer-row">
          <div class="product-price-box">
            <span class="price-label">Precio</span>
            <span class="price-val">${formatPrice(prod.price)}</span>
          </div>

          <div class="product-actions">
            <button class="btn-details" onclick="openProductModal('${prod.id}')" title="Ver ficha pedagógica">
              Ver Ficha
            </button>
            <button class="btn-add-cart" onclick="addToCart('${prod.id}', this)">
              <span>+ Carrito</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

// Configuración de eventos de filtros
function setupFilterEvents() {
  // Filtro por categorías
  const categoryPills = document.querySelectorAll('#category-filter-pills .pill');
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.selectedCategory = pill.getAttribute('data-category');
      renderProducts();
    });
  });

  // Filtro por edades
  const agePills = document.querySelectorAll('#age-filter-pills .pill');
  agePills.forEach(pill => {
    pill.addEventListener('click', () => {
      agePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.selectedAge = pill.getAttribute('data-age');
      renderProducts();
    });
  });

  // Buscador en tiempo real
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('clear-search-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (clearBtn) {
        clearBtn.style.display = state.searchQuery ? 'flex' : 'none';
      }
      renderProducts();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      state.searchQuery = '';
      clearBtn.style.display = 'none';
      renderProducts();
    });
  }

  // Botón restablecer filtros
  const resetBtn = document.getElementById('reset-filters-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.selectedCategory = 'all';
      state.selectedAge = 'all';
      state.searchQuery = '';
      if (searchInput) searchInput.value = '';
      if (clearBtn) clearBtn.style.display = 'none';

      categoryPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-category') === 'all'));
      agePills.forEach(p => p.classList.toggle('active', p.getAttribute('data-age') === 'all'));
      renderProducts();
    });
  }

  // Links rápidos del footer
  document.querySelectorAll('[data-quick-cat]').forEach(link => {
    link.addEventListener('click', (e) => {
      const cat = link.getAttribute('data-quick-cat');
      state.selectedCategory = cat;
      categoryPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-category') === cat));
      renderProducts();
    });
  });
}

// GESTIÓN DEL CARRITO
function addToCart(productId, triggerBtn) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = state.cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      categoryLabel: product.categoryLabel,
      qty: 1
    });
  }

  saveCartToStorage();
  updateCartUI();

  // Animación del botón si existe
  if (triggerBtn) {
    const originalText = triggerBtn.innerHTML;
    triggerBtn.innerHTML = `<span>✓ ¡Agregado!</span>`;
    triggerBtn.classList.add('added');
    setTimeout(() => {
      triggerBtn.innerHTML = originalText;
      triggerBtn.classList.remove('added');
    }, 1200);
  }

  // Toast y animación del badge
  showToast(`¡Agregado!: ${product.name}`);
  animateCartBadge();
}

function updateCartQty(productId, delta) {
  const itemIndex = state.cart.findIndex(i => i.id === productId);
  if (itemIndex === -1) return;

  state.cart[itemIndex].qty += delta;
  if (state.cart[itemIndex].qty <= 0) {
    state.cart.splice(itemIndex, 1);
  }

  saveCartToStorage();
  updateCartUI();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(i => i.id !== productId);
  saveCartToStorage();
  updateCartUI();
  showToast('Producto eliminado del carrito');
}

function updateCartUI() {
  const counter = document.getElementById('cart-counter');
  const drawerCount = document.getElementById('drawer-items-count');
  const itemsContainer = document.getElementById('cart-items-container');
  const emptyState = document.getElementById('cart-empty-state');
  const formBox = document.getElementById('drawer-form-box');
  const checkoutSection = document.getElementById('drawer-checkout-section');
  const totalPrice = document.getElementById('cart-total-price');

  const totalItemsCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPriceSum = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (counter) counter.textContent = totalItemsCount;
  if (drawerCount) drawerCount.textContent = `${totalItemsCount} ${totalItemsCount === 1 ? 'producto' : 'productos'}`;

  if (!itemsContainer) return;

  if (state.cart.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (formBox) formBox.style.display = 'none';
    if (checkoutSection) checkoutSection.style.display = 'none';
    // Limpiar items pero dejar el empty state
    const rows = itemsContainer.querySelectorAll('.cart-item-row');
    rows.forEach(r => r.remove());
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (formBox) formBox.style.display = 'block';
  if (checkoutSection) checkoutSection.style.display = 'flex';

  if (totalPrice) totalPrice.textContent = formatPrice(totalPriceSum);

  // Renderizar filas de productos
  const existingRows = itemsContainer.querySelectorAll('.cart-item-row');
  existingRows.forEach(r => r.remove());

  const rowsHTML = state.cart.map(item => `
    <div class="cart-item-row" data-id="${item.id}">
      <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
      <div class="cart-item-details">
        <span class="cart-item-meta">${item.categoryLabel}</span>
        <h4 class="cart-item-title">${item.name}</h4>
        <span class="cart-item-price">${formatPrice(item.price)}</span>
      </div>
      <div class="cart-item-actions">
        <div class="qty-stepper">
          <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)" aria-label="Disminuir">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)" aria-label="Aumentar">+</button>
        </div>
        <button class="cart-item-remove-btn" onclick="removeFromCart('${item.id}')">Quitar</button>
      </div>
    </div>
  `).join('');

  itemsContainer.insertAdjacentHTML('afterbegin', rowsHTML);
}

function animateCartBadge() {
  const badge = document.getElementById('cart-counter');
  if (badge) {
    badge.classList.remove('bump');
    void badge.offsetWidth; // trigger reflow
    badge.classList.add('bump');
  }
}

// Configuración de eventos del carrito (abrir/cerrar/checkout)
function setupCartEvents() {
  const openCartBtn = document.getElementById('open-cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const emptyCartExploreBtn = document.getElementById('empty-cart-explore-btn');
  const checkoutBtn = document.getElementById('checkout-whatsapp-btn');

  function openCart() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (openCartBtn) openCartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  if (emptyCartExploreBtn) emptyCartExploreBtn.addEventListener('click', closeCart);

  // Escuchar tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartDrawer.classList.contains('active')) {
      closeCart();
    }
  });

  // Procesar Checkout por WhatsApp
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', processWhatsAppOrder);
  }
}

// Generador de pedido por WhatsApp
function processWhatsAppOrder() {
  if (state.cart.length === 0) {
    showToast('El carrito está vacío');
    return;
  }

  const nameInput = document.getElementById('cust-name');
  const cityInput = document.getElementById('cust-city');
  const kidInput = document.getElementById('cust-kid');
  const notesInput = document.getElementById('cust-notes');

  const customerName = nameInput ? nameInput.value.trim() : '';
  const customerCity = cityInput ? cityInput.value.trim() : '';
  const customerKid = kidInput ? kidInput.value.trim() : '';
  const customerNotes = notesInput ? notesInput.value.trim() : '';

  if (!customerName) {
    showToast('Por favor escribe tu nombre en los datos del pedido');
    if (nameInput) {
      nameInput.focus();
      nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nameInput.classList.add('input-error-pulse');
      setTimeout(() => nameInput.classList.remove('input-error-pulse'), 1200);
    }
    return;
  }

  if (!customerCity) {
    showToast('Por favor escribe tu ciudad para cotizar el envío');
    if (cityInput) {
      cityInput.focus();
      cityInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cityInput.classList.add('input-error-pulse');
      setTimeout(() => cityInput.classList.remove('input-error-pulse'), 1200);
    }
    return;
  }

  const totalPriceSum = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Armar lista de artículos
  let itemsText = '';
  state.cart.forEach((item, index) => {
    const itemSubtotal = formatPrice(item.price * item.qty);
    itemsText += `  ${index + 1}. *${item.name}*\n     Cantidad: ${item.qty} | Subtotal: ${itemSubtotal}\n`;
  });

  // Armar mensaje formal y pedagógico
  let message = `👋 *¡Hola Sharon! Quiero hacer un pedido desde la tienda virtual Cerebro Feliz:*\n\n`;
  message += `📦 *PRODUCTOS SELECCIONADOS:*\n${itemsText}\n`;
  message += `💰 *TOTAL PRODUCTOS:* ${formatPrice(totalPriceSum)}\n\n`;
  message += `👤 *DATOS DEL PEDIDO:*\n`;
  message += `• *Cliente:* ${customerName}\n`;
  message += `• *Ciudad / Municipio de entrega:* ${customerCity}\n`;
  if (customerKid) {
    message += `• *Para el niño/a:* ${customerKid}\n`;
  }
  if (customerNotes) {
    message += `• *Consulta pedagógica o nota:* ${customerNotes}\n`;
  }
  message += `\n💬 ¿Me confirmas disponibilidad y los medios de pago para coordinar el envío? ¡Muchas gracias!`;

  const phone = state.targetPhone.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${phone}?text=${encodedMsg}`;

  // Abrir WhatsApp en nueva pestaña
  window.open(waUrl, '_blank');
  showToast('¡Redirigiendo a WhatsApp con tu pedido!');
}

// MODAL DE FICHA PEDAGÓGICA
function openProductModal(productId) {
  const prod = PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  const modalOverlay = document.getElementById('product-modal-overlay');
  const modal = document.getElementById('product-modal');
  const modalBody = document.getElementById('product-modal-body');

  modalBody.innerHTML = `
    <div class="product-modal-grid">
      <img src="${prod.image}" alt="${prod.name}" class="product-modal-img">

      <div class="product-modal-info">
        <div class="modal-badge-group">
          <span class="modal-badge age">👶 ${prod.ageLabel}</span>
          <span class="modal-badge cat">${prod.categoryLabel}</span>
        </div>

        <h2 class="product-modal-title">${prod.name}</h2>
        <div class="product-modal-price">${formatPrice(prod.price)}</div>

        <div class="pedagogical-box">
          <h5>💡 Criterio de la Psicóloga Sharon Espinel</h5>
          <p>${prod.pedagogueNote}</p>
        </div>

        <div class="skills-list">
          <h5>Habilidades que potencia:</h5>
          <div class="skills-tags">
            ${prod.skills.map(s => `<span class="skill-tag">✓ ${s}</span>`).join('')}
          </div>
        </div>

        <button class="btn btn-primary btn-full" onclick="addToCart('${prod.id}', this); closeProductModal();">
          <span>Añadir al Carrito (${formatPrice(prod.price)})</span>
        </button>
      </div>
    </div>
  `;

  modalOverlay.classList.add('active');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  const modalOverlay = document.getElementById('product-modal-overlay');
  const modal = document.getElementById('product-modal');
  if (modalOverlay) modalOverlay.classList.remove('active');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function setupModalEvents() {
  const closeBtn = document.getElementById('close-product-modal-btn');
  const overlay = document.getElementById('product-modal-overlay');

  if (closeBtn) closeBtn.addEventListener('click', closeProductModal);
  if (overlay) overlay.addEventListener('click', closeProductModal);
}

// CONFIGURACIÓN DEL NÚMERO DE WHATSAPP
function updatePhoneDisplay() {
  const display = document.getElementById('footer-wa-display');
  if (display) {
    display.textContent = `+${state.targetPhone}`;
  }

  // Actualizar enlaces de WhatsApp directos
  const floatBtn = document.getElementById('floating-wa-btn');
  const pedagogueChatBtn = document.getElementById('pedagogue-chat-btn');
  const headerContactBtn = document.getElementById('header-contact-btn');
  const footerOrderBtn = document.getElementById('footer-order-btn');

  const generalMsg = encodeURIComponent('¡Hola Psic. Sharon! Vi tu tienda Cerebro Feliz y me gustaría hacerte una consulta psicológica sobre materiales para mi hijo/a.');
  const waDirectUrl = `https://wa.me/${state.targetPhone}?text=${generalMsg}`;

  if (floatBtn) floatBtn.href = waDirectUrl;
  if (pedagogueChatBtn) pedagogueChatBtn.onclick = () => window.open(waDirectUrl, '_blank');
  if (headerContactBtn) headerContactBtn.onclick = () => window.open(waDirectUrl, '_blank');
  if (footerOrderBtn) footerOrderBtn.onclick = () => window.open(waDirectUrl, '_blank');
}

function setupSettingsEvents() {
  const openBtn = document.getElementById('open-settings-btn');
  const modalOverlay = document.getElementById('settings-modal-overlay');
  const modal = document.getElementById('settings-modal');
  const closeBtn = document.getElementById('close-settings-modal-btn');
  const form = document.getElementById('wa-settings-form');
  const input = document.getElementById('wa-input-phone');
  const resetBtn = document.getElementById('reset-phone-btn');

  function openSettings() {
    if (input) input.value = state.targetPhone;
    modalOverlay.classList.add('active');
    modal.classList.add('active');
  }

  function closeSettings() {
    modalOverlay.classList.remove('active');
    modal.classList.remove('active');
  }

  if (openBtn) openBtn.addEventListener('click', openSettings);
  if (closeBtn) closeBtn.addEventListener('click', closeSettings);
  if (modalOverlay) modalOverlay.addEventListener('click', closeSettings);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.replace(/[^0-9]/g, '');
      if (val.length < 8) {
        showToast('Ingresa un número válido con código de país');
        return;
      }
      state.targetPhone = val;
      localStorage.setItem('ludikids_wa_phone', val);
      updatePhoneDisplay();
      closeSettings();
      showToast(`¡Número guardado: +${val}!`);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.targetPhone = CONFIG.defaultPhone;
      localStorage.removeItem('ludikids_wa_phone');
      if (input) input.value = CONFIG.defaultPhone;
      updatePhoneDisplay();
      closeSettings();
      showToast('Número restablecido por defecto');
    });
  }
}

// MODAL GUÍA DE COMPARTIR POR LINK
function setupShareGuideEvents() {
  const openBtn = document.getElementById('open-share-guide-btn');
  const footerOpenBtn = document.getElementById('footer-open-share-guide');
  const modalOverlay = document.getElementById('share-modal-overlay');
  const modal = document.getElementById('share-modal');
  const closeBtn = document.getElementById('close-share-modal-btn');
  const closeActionBtn = document.getElementById('close-share-guide-btn-action');

  function openShare() {
    modalOverlay.classList.add('active');
    modal.classList.add('active');
  }

  function closeShare() {
    modalOverlay.classList.remove('active');
    modal.classList.remove('active');
  }

  if (openBtn) openBtn.addEventListener('click', openShare);
  if (footerOpenBtn) footerOpenBtn.addEventListener('click', openShare);
  if (closeBtn) closeBtn.addEventListener('click', closeShare);
  if (closeActionBtn) closeActionBtn.addEventListener('click', closeShare);
  if (modalOverlay) modalOverlay.addEventListener('click', closeShare);
}

// TOAST NOTIFIER
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}
