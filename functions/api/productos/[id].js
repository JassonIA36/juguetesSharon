import { borrarFotosKV, error, idDeParams, json, leerJSON, validarProducto } from '../../_lib/util.js';

function refsDe(fila) {
  try { return JSON.parse(fila.fotos); } catch (e) { return []; }
}

export async function onRequestPut({ request, env, params }) {
  const id = idDeParams(params);
  if (!id) return error('Producto no válido.');
  const actual = await env.DB.prepare('SELECT fotos FROM productos WHERE id = ?').bind(id).first();
  if (!actual) return error('Ese producto ya no existe.', 404);

  const d = await leerJSON(request);
  if (!d) return error('Solicitud inválida.');
  let p;
  try { p = await validarProducto(env, d); } catch (e) { return error(e.message); }

  await env.DB.prepare(
    `UPDATE productos SET nombre=?, descripcion=?, precio=?, precio_anterior=?, categoria_id=?, edad_rango=?, edad_texto=?,
       fotos=?, habilidades=?, nota=?, agotado=?, destacado=? WHERE id=?`
  ).bind(p.nombre, p.descripcion, p.precio, p.precio_anterior, p.categoria_id, p.edad_rango, p.edad_texto,
    JSON.stringify(p.fotos), JSON.stringify(p.habilidades), p.nota, p.agotado, p.destacado, id).run();

  // Borra de KV las fotos que se quitaron (las de assets/ se ignoran).
  const quitadas = refsDe(actual).filter((r) => !p.fotos.includes(r));
  await borrarFotosKV(env, quitadas);
  return json({ ok: true });
}

export async function onRequestDelete({ env, params }) {
  const id = idDeParams(params);
  if (!id) return error('Producto no válido.');
  const actual = await env.DB.prepare('SELECT fotos FROM productos WHERE id = ?').bind(id).first();
  if (!actual) return error('Ese producto ya no existe.', 404);
  await env.DB.prepare('DELETE FROM productos WHERE id = ?').bind(id).run();
  await borrarFotosKV(env, refsDe(actual));
  return json({ ok: true });
}
