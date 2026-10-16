import { error, json, leerJSON } from '../../_lib/util.js';

export function nombreCategoria(d) {
  const n = d && typeof d.nombre === 'string' ? d.nombre.trim() : '';
  if (!n) throw new Error('Escribe el nombre de la categoría.');
  if (n.length > 60) throw new Error('El nombre de la categoría es demasiado largo (máximo 60 letras).');
  return n;
}

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT c.id, c.nombre, c.orden, (SELECT COUNT(*) FROM productos p WHERE p.categoria_id = c.id) AS productos
     FROM categorias c ORDER BY c.orden, c.id`
  ).all();
  return json(results);
}

export async function onRequestPost({ request, env }) {
  const d = await leerJSON(request);
  let nombre;
  try { nombre = nombreCategoria(d); } catch (e) { return error(e.message); }
  const dup = await env.DB.prepare('SELECT id FROM categorias WHERE lower(nombre) = lower(?)').bind(nombre).first();
  if (dup) return error('Ya existe una categoría con ese nombre.', 409);
  const { orden } = await env.DB.prepare('SELECT COALESCE(MAX(orden), 0) + 1 AS orden FROM categorias').first();
  const r = await env.DB.prepare('INSERT INTO categorias (nombre, orden) VALUES (?, ?)').bind(nombre, orden).run();
  return json({ ok: true, id: r.meta.last_row_id }, 201);
}
