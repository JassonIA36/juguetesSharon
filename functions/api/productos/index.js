import { SQL_PRODUCTOS, error, json, leerJSON, productoDesdeFila, validarProducto } from '../../_lib/util.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(`${SQL_PRODUCTOS} ORDER BY p.orden, p.id`).all();
  return json(results.map(productoDesdeFila));
}

export async function onRequestPost({ request, env }) {
  const d = await leerJSON(request);
  if (!d) return error('Solicitud inválida.');
  let p;
  try { p = await validarProducto(env, d); } catch (e) { return error(e.message); }

  const { orden } = await env.DB.prepare('SELECT COALESCE(MAX(orden), 0) + 1 AS orden FROM productos').first();
  const r = await env.DB.prepare(
    `INSERT INTO productos (nombre, descripcion, precio, precio_anterior, categoria_id, edad_rango, edad_texto, fotos, habilidades, nota, agotado, destacado, orden)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(p.nombre, p.descripcion, p.precio, p.precio_anterior, p.categoria_id, p.edad_rango, p.edad_texto,
    JSON.stringify(p.fotos), JSON.stringify(p.habilidades), p.nota, p.agotado, p.destacado, orden).run();
  return json({ ok: true, id: r.meta.last_row_id }, 201);
}
