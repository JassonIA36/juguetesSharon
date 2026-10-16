import { error, json, leerJSON } from '../../_lib/util.js';

// Recibe { ids: [3, 1, 2, ...] } con TODOS los productos en el orden deseado.
export async function onRequestPost({ request, env }) {
  const d = await leerJSON(request);
  if (!d || !Array.isArray(d.ids) || !d.ids.every((n) => Number.isInteger(n) && n > 0)) {
    return error('Lista de orden inválida.');
  }
  if (new Set(d.ids).size !== d.ids.length) return error('Lista de orden inválida.');
  const { results } = await env.DB.prepare('SELECT id FROM productos').all();
  const existentes = new Set(results.map((r) => r.id));
  if (d.ids.length !== existentes.size || !d.ids.every((n) => existentes.has(n))) {
    return error('La lista cambió. Recarga la página e inténtalo otra vez.', 409);
  }
  const stmt = env.DB.prepare('UPDATE productos SET orden = ? WHERE id = ?');
  await env.DB.batch(d.ids.map((id, i) => stmt.bind(i + 1, id)));
  return json({ ok: true });
}
