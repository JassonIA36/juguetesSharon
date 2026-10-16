/* Panel de administración. Habla con /api/* usando la cookie de sesión. */

const $ = (id) => document.getElementById(id);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const formatPrice = (n) => '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const photoUrl = (ref) => (ref.startsWith('assets/') ? '/' + ref : '/api/fotos/' + ref);
const isKV = (ref) => !ref.startsWith('assets/');

const state = { products: [], categories: [], config: null, tab: 'productos' };

// ---------- API ----------
async function call(method, path, body, { raw = false } = {}) {
  const opts = { method, credentials: 'same-origin', headers: {} };
  if (raw) {
    opts.body = body;
    opts.headers['Content-Type'] = 'image/jpeg';
  } else if (body !== undefined) {
    opts.body = JSON.stringify(body);
    opts.headers['Content-Type'] = 'application/json';
  }
  let res;
  try {
    res = await fetch(path, opts);
  } catch (e) {
    throw new Error('No hay conexión. Revisa tu internet e inténtalo de nuevo.');
  }
  let data = null;
  try { data = await res.json(); } catch (e) { /* sin cuerpo */ }
  if (!res.ok) {
    if (res.status === 401 && path !== '/api/login') showLogin();
    throw new Error((data && data.error) || 'Ocurrió un error. Inténtalo de nuevo.');
  }
  return data;
}

let toastTimer;
function toast(msg, isError = false) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.toggle('error', isError);
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), isError ? 5000 : 2200);
}
const ok = () => toast('✓ Guardado');
const fail = (e) => toast(e.message || 'Ocurrió un error', true);

// ---------- Sesión ----------
function showLogin() {
  closeSheet(true);
  $('panel-view').hidden = true;
  $('login-view').hidden = false;
  $('login-password').value = '';
  $('login-password').focus();
}

async function showPanel() {
  $('login-view').hidden = true;
  $('panel-view').hidden = false;
  await loadAll();
}

async function init() {
  try {
    await call('GET', '/api/sesion');
    await showPanel();
  } catch (e) {
    showLogin();
  }
}

$('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('login-btn');
  const err = $('login-error');
  err.hidden = true;
  btn.disabled = true;
  btn.textContent = 'Entrando…';
  try {
    await call('POST', '/api/login', { password: $('login-password').value });
    await showPanel();
  } catch (e2) {
    err.textContent = e2.message;
    err.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
});

$('logout-btn').addEventListener('click', async () => {
  try { await call('POST', '/api/logout'); } catch (e) { /* igual salimos */ }
  showLogin();
});

// ---------- Carga de datos ----------
async function loadAll() {
  try {
    const [products, categories, config] = await Promise.all([
      call('GET', '/api/productos'), call('GET', '/api/categorias'), call('GET', '/api/config'),
    ]);
    state.products = products;
    state.categories = categories;
    state.config = config;
  } catch (e) { fail(e); return; }
  $('admin-title').textContent = 'Panel de ' + (state.config.nombre || 'la tienda');
  renderProducts();
  renderCategories();
  renderConfig();
}

async function reloadProducts() {
  state.products = await call('GET', '/api/productos');
  renderProducts();
}
async function reloadCategories() {
  state.categories = await call('GET', '/api/categorias');
  renderCategories();
}

// ---------- Pestañas ----------
$('admin-tabs').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tab]');
  if (!b) return;
  state.tab = b.dataset.tab;
  document.querySelectorAll('.admin-tab').forEach((t) => t.classList.toggle('active', t === b));
  ['productos', 'categorias', 'tienda'].forEach((n) => { $('tab-' + n).hidden = n !== state.tab; });
  window.scrollTo(0, 0);
});

// ---------- Productos: lista ----------
function renderProducts() {
  const list = $('product-list');
  if (!state.products.length) {
    list.innerHTML = '<div class="admin-empty">Todavía no tienes productos.<br>Toca «+ Nuevo producto» para crear el primero.</div>';
    return;
  }
  const last = state.products.length - 1;
  list.innerHTML = state.products.map((p, i) => `
    <article class="product-row${p.agotado ? ' is-soldout' : ''}">
      ${p.fotos[0] ? `<img class="product-row-thumb" src="${esc(photoUrl(p.fotos[0]))}" alt="">` : '<div class="product-row-thumb">🧸</div>'}
      <div>
        <div class="product-row-name">${esc(p.nombre)}</div>
        <div class="product-row-meta">
          ${formatPrice(p.precio)}${p.precio_anterior ? ` <s>${formatPrice(p.precio_anterior)}</s>` : ''} · ${esc(p.categoria || 'Sin categoría')}
        </div>
        <div style="margin-top:.3rem">
          ${p.agotado ? '<span class="tag tag-soldout">Agotado</span>' : ''}
          ${p.destacado ? '<span class="tag tag-star">⭐ Destacado</span>' : ''}
        </div>
      </div>
      <div class="product-row-actions" data-id="${p.id}">
        <div class="move-btns">
          <button class="btn btn-secondary btn-sm" data-act="up" ${i === 0 ? 'disabled' : ''} aria-label="Subir">↑</button>
          <button class="btn btn-secondary btn-sm" data-act="down" ${i === last ? 'disabled' : ''} aria-label="Bajar">↓</button>
        </div>
        <button class="btn btn-secondary btn-sm" data-act="edit">✏️ Editar</button>
        <button class="btn btn-secondary btn-sm" data-act="soldout">${p.agotado ? '✅ Marcar disponible' : '🚫 Marcar agotado'}</button>
        <button class="btn btn-secondary btn-sm" data-act="star">${p.destacado ? '⭐ Quitar destacado' : '☆ Destacar'}</button>
        <button class="btn btn-danger btn-sm" data-act="delete">🗑️ Eliminar</button>
      </div>
    </article>`).join('');
}

$('product-list').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn || btn.disabled) return;
  const id = Number(btn.closest('[data-id]').dataset.id);
  const idx = state.products.findIndex((p) => p.id === id);
  const p = state.products[idx];
  if (!p) return;
  btn.disabled = true;
  try {
    switch (btn.dataset.act) {
      case 'edit': openSheet(p); break;
      case 'up':
      case 'down': {
        const j = btn.dataset.act === 'up' ? idx - 1 : idx + 1;
        const ids = state.products.map((x) => x.id);
        [ids[idx], ids[j]] = [ids[j], ids[idx]];
        await call('POST', '/api/productos/orden', { ids });
        await reloadProducts();
        ok();
        break;
      }
      case 'soldout':
        await call('PUT', '/api/productos/' + id, { ...p, agotado: !p.agotado });
        await reloadProducts();
        toast(p.agotado ? '✓ Marcado como disponible' : '✓ Marcado como agotado');
        break;
      case 'star':
        await call('PUT', '/api/productos/' + id, { ...p, destacado: !p.destacado });
        await reloadProducts();
        ok();
        break;
      case 'delete':
        if (confirm(`¿Eliminar «${p.nombre}»?\n\nSe borrará también sus fotos. Esto no se puede deshacer.`)) {
          await call('DELETE', '/api/productos/' + id);
          await reloadProducts();
          await reloadCategories();
          toast('✓ Producto eliminado');
        }
        break;
    }
  } catch (err) { fail(err); }
  btn.disabled = false;
});

$('new-product-btn').addEventListener('click', () => openSheet(null));

// ---------- Fotos: compresión y subida ----------
async function compressImage(file, maxSide = 1200) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch (e) {
    bitmap = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('No se pudo leer la imagen. Prueba con otra foto.'));
      img.src = URL.createObjectURL(file);
    });
  }
  const w0 = bitmap.width, h0 = bitmap.height;
  const scale = Math.min(1, maxSide / Math.max(w0, h0));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w0 * scale);
  canvas.height = Math.round(h0 * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; // los PNG con transparencia quedan sobre blanco
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
  if (!blob) throw new Error('No se pudo preparar la foto.');
  return blob;
}

async function uploadPhoto(file) {
  if (!file.type.startsWith('image/')) throw new Error('El archivo debe ser una imagen.');
  const blob = await compressImage(file);
  const r = await call('POST', '/api/fotos', blob, { raw: true });
  return r.ref;
}

// Fotos subidas durante esta edición y todavía no guardadas: si se descartan, se borran de KV.
function discardUploaded(ref, uploaded) {
  if (uploaded.has(ref)) {
    uploaded.delete(ref);
    call('DELETE', '/api/fotos/' + ref).catch(() => {});
  }
}

function pickFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => resolve(input.files[0] || null);
    input.oncancel = () => resolve(null);
    input.click();
  });
}

// ---------- Producto: formulario ----------
let form = null; // { id, fotos:[], uploaded:Set, original:[] }

function openSheet(p) {
  form = {
    id: p ? p.id : null,
    fotos: p ? [...p.fotos] : [],
    uploaded: new Set(),
    busy: -1,
  };
  const v = p || { nombre: '', descripcion: '', precio: '', precio_anterior: '', categoria_id: '', edad_rango: '1-3', edad_texto: '', habilidades: [], nota: '', agotado: false, destacado: false };
  $('product-form').innerHTML = `
    <h2 id="sheet-title">${p ? 'Editar producto' : 'Nuevo producto'}</h2>

    <div class="field"><label for="f-nombre">Nombre del producto *</label>
      <input type="text" id="f-nombre" maxlength="120" value="${esc(v.nombre)}" required></div>

    <div class="field"><label for="f-descripcion">Descripción</label>
      <textarea id="f-descripcion" rows="5" maxlength="2000">${esc(v.descripcion)}</textarea></div>

    <div class="field-row">
      <div class="field"><label for="f-precio">Precio (pesos) *</label>
        <input type="text" id="f-precio" inputmode="numeric" placeholder="45000" value="${esc(v.precio)}" required></div>
      <div class="field"><label for="f-anterior">Precio anterior</label>
        <input type="text" id="f-anterior" inputmode="numeric" placeholder="Opcional" value="${esc(v.precio_anterior ?? '')}">
        <small>Si lo llenas, se muestra tachado con el descuento.</small></div>
    </div>

    <div class="field"><label for="f-categoria">Categoría</label>
      <select id="f-categoria">
        <option value="">Sin categoría</option>
        ${state.categories.map((c) => `<option value="${c.id}" ${String(v.categoria_id) === String(c.id) ? 'selected' : ''}>${esc(c.nombre)}</option>`).join('')}
      </select></div>

    <div class="field-row">
      <div class="field"><label for="f-rango">Rango de edad (para filtrar) *</label>
        <select id="f-rango">
          ${[['1-3', '1 a 3 años'], ['3-5', '3 a 5 años'], ['5+', '5 años o más']].map(([k, t]) => `<option value="${k}" ${v.edad_rango === k ? 'selected' : ''}>${t}</option>`).join('')}
        </select></div>
      <div class="field"><label for="f-edadtxt">Edad recomendada</label>
        <input type="text" id="f-edadtxt" maxlength="40" placeholder="Ej. 3 a 6 años" value="${esc(v.edad_texto)}">
        <small>Es el texto que ve el cliente.</small></div>
    </div>

    <div class="field"><span class="field-label">Fotos (hasta 4)</span>
      <div class="photo-grid" id="photo-grid"></div>
      <small>Se reducen automáticamente para que carguen rápido. La primera es la foto principal.</small></div>

    <div class="field"><label for="f-habilidades">Habilidades que potencia (opcional)</label>
      <textarea id="f-habilidades" rows="4" placeholder="Una por línea">${esc(v.habilidades.join('\n'))}</textarea></div>

    <div class="field"><label for="f-nota">Nota de la pedagoga (opcional)</label>
      <textarea id="f-nota" rows="3" maxlength="1000">${esc(v.nota)}</textarea>
      <small>Solo se muestra en la tienda si escribes algo aquí.</small></div>

    <label class="check"><input type="checkbox" id="f-agotado" ${v.agotado ? 'checked' : ''}> Producto agotado</label>
    <label class="check"><input type="checkbox" id="f-destacado" ${v.destacado ? 'checked' : ''}> ⭐ Producto destacado</label>

    <div class="sheet-footer">
      <button type="button" class="btn btn-secondary" id="sheet-cancel">Cancelar</button>
      <button type="submit" class="btn btn-primary" id="sheet-save">Guardar</button>
    </div>`;
  renderPhotoGrid();
  $('sheet-overlay').hidden = false;
  $('sheet').hidden = false;
  $('sheet').scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closeSheet(silent) {
  if (form && !silent) form.uploaded.forEach((ref) => call('DELETE', '/api/fotos/' + ref).catch(() => {}));
  form = null;
  $('sheet-overlay').hidden = true;
  $('sheet').hidden = true;
  document.body.style.overflow = '';
}

function renderPhotoGrid() {
  const slots = [];
  for (let i = 0; i < 4; i++) {
    const ref = form.fotos[i];
    const busy = form.busy === i ? ' photo-busy' : '';
    if (ref) {
      slots.push(`<div class="photo-slot${busy}">
        <img src="${esc(photoUrl(ref))}" alt="Foto ${i + 1}">
        <div class="photo-slot-actions">
          <button type="button" class="btn btn-secondary" data-photo="replace" data-i="${i}">Cambiar</button>
          <button type="button" class="btn btn-danger" data-photo="remove" data-i="${i}">Quitar</button>
        </div></div>`);
    } else if (i === form.fotos.length) {
      slots.push(`<div class="photo-slot${busy}"><div class="photo-empty" data-photo="add" data-i="${i}"><span>📷</span>${form.busy === i ? 'Subiendo…' : 'Agregar foto'}</div></div>`);
    }
  }
  $('photo-grid').innerHTML = slots.join('');
}

$('product-form').addEventListener('click', async (e) => {
  if (e.target.id === 'sheet-cancel') { closeSheet(); return; }
  const el = e.target.closest('[data-photo]');
  if (!el || !form) return;
  const i = Number(el.dataset.i);
  const act = el.dataset.photo;

  if (act === 'remove') {
    const [ref] = form.fotos.splice(i, 1);
    discardUploaded(ref, form.uploaded); // si era de assets/ o ya guardada, solo se quita de la lista
    renderPhotoGrid();
    return;
  }
  const file = await pickFile();
  if (!file || !form) return;
  form.busy = i;
  renderPhotoGrid();
  try {
    const ref = await uploadPhoto(file);
    if (!form) { call('DELETE', '/api/fotos/' + ref).catch(() => {}); return; }
    form.uploaded.add(ref);
    if (act === 'replace') {
      discardUploaded(form.fotos[i], form.uploaded);
      form.fotos[i] = ref;
    } else {
      form.fotos.push(ref);
    }
  } catch (err) { fail(err); }
  if (form) { form.busy = -1; renderPhotoGrid(); }
});

const digits = (s) => String(s).replace(/\D/g, '');

$('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form) return;
  const saveBtn = $('sheet-save');
  const precio = digits($('f-precio').value);
  const anterior = digits($('f-anterior').value);
  const data = {
    nombre: $('f-nombre').value,
    descripcion: $('f-descripcion').value,
    precio: precio === '' ? '' : Number(precio),
    precio_anterior: anterior === '' ? null : Number(anterior),
    categoria_id: $('f-categoria').value === '' ? null : Number($('f-categoria').value),
    edad_rango: $('f-rango').value,
    edad_texto: $('f-edadtxt').value,
    fotos: form.fotos,
    habilidades: $('f-habilidades').value.split('\n'),
    nota: $('f-nota').value,
    agotado: $('f-agotado').checked,
    destacado: $('f-destacado').checked,
  };
  saveBtn.disabled = true;
  saveBtn.textContent = 'Guardando…';
  try {
    if (form.id) await call('PUT', '/api/productos/' + form.id, data);
    else await call('POST', '/api/productos', data);
    closeSheet(true);
    await reloadProducts();
    await reloadCategories();
    ok();
  } catch (err) {
    fail(err);
    saveBtn.disabled = false;
    saveBtn.textContent = 'Guardar';
  }
});

$('sheet-overlay').addEventListener('click', () => closeSheet());
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && form) closeSheet(); });

// ---------- Categorías ----------
function renderCategories() {
  const list = $('category-list');
  if (!state.categories.length) {
    list.innerHTML = '<div class="admin-empty">Aún no hay categorías. Crea la primera arriba.</div>';
    return;
  }
  list.innerHTML = state.categories.map((c) => `
    <div class="category-row" data-id="${c.id}">
      <input type="text" value="${esc(c.nombre)}" maxlength="60" aria-label="Nombre de la categoría">
      <button class="btn btn-secondary btn-sm" data-act="rename">Guardar nombre</button>
      <button class="btn btn-danger btn-sm" data-act="delete">Eliminar</button>
      <small>${c.productos} ${c.productos === 1 ? 'producto' : 'productos'}</small>
    </div>`).join('');
}

$('new-category-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await call('POST', '/api/categorias', { nombre: $('new-category-name').value });
    $('new-category-name').value = '';
    await reloadCategories();
    ok();
  } catch (err) { fail(err); }
});

$('category-list').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const row = btn.closest('[data-id]');
  const id = Number(row.dataset.id);
  const cat = state.categories.find((c) => c.id === id);
  try {
    if (btn.dataset.act === 'rename') {
      await call('PUT', '/api/categorias/' + id, { nombre: row.querySelector('input').value });
      await Promise.all([reloadCategories(), reloadProducts()]);
      ok();
    } else if (confirm(`¿Eliminar la categoría «${cat.nombre}»?\n\n${cat.productos ? `Sus ${cat.productos} productos NO se borran: quedarán «Sin categoría».` : 'No tiene productos.'}`)) {
      await call('DELETE', '/api/categorias/' + id);
      await Promise.all([reloadCategories(), reloadProducts()]);
      toast('✓ Categoría eliminada');
    }
  } catch (err) { fail(err); }
});

// ---------- Configuración de la tienda ----------
let cfgLogo = { ref: '', uploaded: new Set() };

function renderConfig() {
  const c = state.config;
  cfgLogo = { ref: c.logo || '', uploaded: new Set() };
  $('config-form').innerHTML = `
    <div class="field"><label for="c-nombre">Nombre de la tienda *</label>
      <input type="text" id="c-nombre" maxlength="60" value="${esc(c.nombre)}" required></div>
    <div class="field"><label for="c-eslogan">Frase debajo del nombre</label>
      <input type="text" id="c-eslogan" maxlength="80" value="${esc(c.eslogan)}"></div>

    <div class="field"><span class="field-label">Logo</span>
      <div class="logo-edit" id="logo-edit"></div></div>

    <div class="field"><label for="c-whatsapp">Número de WhatsApp (con indicativo 57) *</label>
      <input type="tel" id="c-whatsapp" inputmode="numeric" placeholder="573001234567" value="${esc(c.whatsapp)}" required>
      <small>Solo números, empezando por 57. Ejemplo: 573001234567. A este número llegan los pedidos.</small></div>

    <div class="field"><label for="c-bienvenida">Mensaje de bienvenida</label>
      <input type="text" id="c-bienvenida" maxlength="200" value="${esc(c.bienvenida)}">
      <small>Se muestra en la franja de color arriba de la tienda.</small></div>

    <div class="field"><label for="c-direccion">Dirección</label>
      <input type="text" id="c-direccion" maxlength="200" value="${esc(c.direccion)}"></div>
    <div class="field"><label for="c-instagram">Instagram</label>
      <input type="text" id="c-instagram" maxlength="200" placeholder="@mitienda o https://instagram.com/mitienda" value="${esc(c.instagram)}"></div>
    <div class="field"><label for="c-facebook">Facebook</label>
      <input type="text" id="c-facebook" maxlength="200" placeholder="mitienda o https://facebook.com/mitienda" value="${esc(c.facebook)}"></div>

    <button type="submit" class="btn btn-primary btn-full" id="config-save">Guardar cambios</button>`;
  renderLogo();
}

function renderLogo(busy = false) {
  $('logo-edit').innerHTML = `
    ${cfgLogo.ref ? `<img src="${esc(photoUrl(cfgLogo.ref))}" alt="Logo actual">` : '<img alt="" style="visibility:hidden">'}
    <div class="logo-edit-actions">
      <button type="button" class="btn btn-secondary btn-sm" data-logo="change" ${busy ? 'disabled' : ''}>${busy ? 'Subiendo…' : cfgLogo.ref ? 'Cambiar logo' : 'Subir logo'}</button>
      ${cfgLogo.ref ? '<button type="button" class="btn btn-danger btn-sm" data-logo="remove">Quitar logo</button>' : ''}
    </div>`;
}

$('config-form').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-logo]');
  if (!b) return;
  if (b.dataset.logo === 'remove') {
    discardUploaded(cfgLogo.ref, cfgLogo.uploaded);
    cfgLogo.ref = '';
    renderLogo();
    return;
  }
  const file = await pickFile();
  if (!file) return;
  renderLogo(true);
  try {
    const ref = await uploadPhoto(file);
    cfgLogo.uploaded.add(ref);
    discardUploaded(cfgLogo.ref, cfgLogo.uploaded);
    cfgLogo.ref = ref;
  } catch (err) { fail(err); }
  renderLogo();
});

$('config-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('config-save');
  btn.disabled = true;
  btn.textContent = 'Guardando…';
  try {
    await call('PUT', '/api/config', {
      nombre: $('c-nombre').value, eslogan: $('c-eslogan').value, logo: cfgLogo.ref,
      whatsapp: $('c-whatsapp').value, bienvenida: $('c-bienvenida').value,
      direccion: $('c-direccion').value, instagram: $('c-instagram').value, facebook: $('c-facebook').value,
    });
    state.config = await call('GET', '/api/config');
    $('admin-title').textContent = 'Panel de ' + state.config.nombre;
    renderConfig();
    ok();
  } catch (err) { fail(err); }
  btn.disabled = false;
  btn.textContent = 'Guardar cambios';
});

init();
