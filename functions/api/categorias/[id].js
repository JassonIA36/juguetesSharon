import { error, idDeParams, json, leerJSON } from '../../_lib/util.js';
import { nombreCategoria } from './index.js';

export async function onRequestPut({ request, env, params }) {
  const id = idDeParams(params);
  if (!id) return error('Categoría no válida.');
  const d = await leerJSON(request);
  let nombre;
  try { nombre = nombreCategoria(d); } catch (e) { return error(e.message); }
  const dup = await env.DB.prepare('SELECT id FROM categorias WHERE lower(nombre) = lower(?) AND id != ?').bind(nombre, id).first();
  if (dup) return error('Ya existe una categoría con ese nombre.', 409);
  const r = await env.DB.prepare('UPDATE categorias SET nombre = ? WHERE id = ?').bind(nombre, id).run();
  if (!r.meta.changes) return error('Esa categoría ya no existe.', 404);
  return json({ ok: true });
}

// Al eliminar una categoría, sus productos quedan "sin categoría".
export async function onRequestDelete({ env, params }) {
  const id = idDeParams(params);
  if (!id) return error('Categoría no válida.');
  const [, r] = await env.DB.batch([
    env.DB.prepare('UPDATE productos SET categoria_id = NULL WHERE categoria_id = ?').bind(id),
    env.DB.prepare('DELETE FROM categorias WHERE id = ?').bind(id),
  ]);
  if (!r.meta.changes) return error('Esa categoría ya no existe.', 404);
  return json({ ok: true });
}
