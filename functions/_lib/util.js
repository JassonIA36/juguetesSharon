// Utilidades compartidas por las funciones del API.

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

export function error(mensaje, status = 400) {
  return json({ error: mensaje }, status);
}

export async function leerJSON(request) {
  try {
    const data = await request.json();
    if (data && typeof data === 'object' && !Array.isArray(data)) return data;
  } catch (e) { /* cae abajo */ }
  return null;
}

// Referencias de fotos: archivo de ejemplo del sitio o id de KV.
const REF_ASSET = /^assets\/img\/[A-Za-z0-9._-]+$/;
const REF_KV = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const esRefAsset = (ref) => REF_ASSET.test(ref);
export const esRefKV = (ref) => REF_KV.test(ref);
export const refValida = (ref) => typeof ref === 'string' && (esRefAsset(ref) || esRefKV(ref));

// Borra de KV solo las fotos que viven en KV (nunca intenta borrar las de assets).
export async function borrarFotosKV(env, refs) {
  const kv = [...new Set(refs.filter(esRefKV))];
  await Promise.all(kv.map((ref) => env.FOTOS.delete(ref)));
}

export const RANGOS_EDAD = ['1-3', '3-5', '5+'];

function texto(valor, max, nombreCampo, { obligatorio = false } = {}) {
  const v = typeof valor === 'string' ? valor.trim() : '';
  if (obligatorio && !v) throw new Error(`Escribe ${nombreCampo}.`);
  if (v.length > max) throw new Error(`${nombreCampo[0].toUpperCase() + nombreCampo.slice(1)} es demasiado largo (máximo ${max} letras).`);
  return v;
}

function entero(valor, nombreCampo, { opcional = false } = {}) {
  if (opcional && (valor === null || valor === undefined || valor === '')) return null;
  const n = Number(valor);
  if (!Number.isInteger(n) || n < 0 || n > 1_000_000_000) {
    throw new Error(`El ${nombreCampo} debe ser un número entero, sin puntos ni comas.`);
  }
  return n;
}

// Valida y normaliza un producto. Lanza Error con mensaje en español si algo está mal.
export async function validarProducto(env, d) {
  const nombre = texto(d.nombre, 120, 'el nombre del producto', { obligatorio: true });
  const descripcion = texto(d.descripcion, 2000, 'la descripción');
  const precio = entero(d.precio, 'precio');
  if (precio === 0) throw new Error('El precio debe ser mayor que cero.');
  const precioAnterior = entero(d.precio_anterior, 'precio anterior', { opcional: true });
  if (precioAnterior !== null && precioAnterior <= precio) {
    throw new Error('El precio anterior debe ser mayor que el precio actual (o déjalo vacío).');
  }

  let categoriaId = null;
  if (d.categoria_id !== null && d.categoria_id !== undefined && d.categoria_id !== '') {
    categoriaId = Number(d.categoria_id);
    const existe = await env.DB.prepare('SELECT id FROM categorias WHERE id = ?').bind(categoriaId).first();
    if (!existe) throw new Error('La categoría elegida no existe.');
  }

  if (!RANGOS_EDAD.includes(d.edad_rango)) throw new Error('Elige un rango de edad.');
  const edadTexto = texto(d.edad_texto, 40, 'la edad recomendada');

  if (!Array.isArray(d.fotos) || d.fotos.length > 4) throw new Error('Un producto puede tener hasta 4 fotos.');
  if (!d.fotos.every(refValida)) throw new Error('Alguna foto no es válida. Súbela de nuevo.');
  const fotos = [...new Set(d.fotos)];

  const habIn = Array.isArray(d.habilidades) ? d.habilidades : [];
  if (habIn.length > 12) throw new Error('Máximo 12 habilidades.');
  const habilidades = habIn
    .map((h) => (typeof h === 'string' ? h.trim() : ''))
    .filter(Boolean);
  if (habilidades.some((h) => h.length > 100)) throw new Error('Cada habilidad debe tener máximo 100 letras.');

  const nota = texto(d.nota, 1000, 'la nota de la pedagoga');

  return {
    nombre, descripcion, precio, precio_anterior: precioAnterior, categoria_id: categoriaId,
    edad_rango: d.edad_rango, edad_texto: edadTexto,
    fotos, habilidades, nota,
    agotado: d.agotado ? 1 : 0,
    destacado: d.destacado ? 1 : 0,
  };
}

// Convierte una fila de D1 en el objeto que ve el navegador.
export function productoDesdeFila(f) {
  const parse = (s) => { try { const a = JSON.parse(s); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
  return {
    id: f.id,
    nombre: f.nombre,
    descripcion: f.descripcion,
    precio: f.precio,
    precio_anterior: f.precio_anterior,
    categoria_id: f.categoria_id,
    categoria: f.categoria_nombre ?? null,
    edad_rango: f.edad_rango,
    edad_texto: f.edad_texto,
    fotos: parse(f.fotos),
    habilidades: parse(f.habilidades),
    nota: f.nota,
    agotado: !!f.agotado,
    destacado: !!f.destacado,
    orden: f.orden,
  };
}

export const SQL_PRODUCTOS = `
  SELECT p.*, c.nombre AS categoria_nombre
  FROM productos p LEFT JOIN categorias c ON c.id = p.categoria_id`;

export function idDeParams(params) {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}
