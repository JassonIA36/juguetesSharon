import { error, esRefKV, json } from '../../_lib/util.js';

export async function onRequestGet({ env, params }) {
  if (!esRefKV(params.id)) return error('Foto no encontrada.', 404);
  const { value, metadata } = await env.FOTOS.getWithMetadata(params.id, 'arrayBuffer');
  if (!value) return error('Foto no encontrada.', 404);
  return new Response(value, {
    headers: {
      'Content-Type': (metadata && metadata.tipo) || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable', // el id nunca cambia de contenido
    },
  });
}

// Borra una foto subida que no se llegó a usar (ej. el usuario canceló el formulario).
// Si algún producto o el logo todavía la usa, se rechaza.
export async function onRequestDelete({ env, params }) {
  if (!esRefKV(params.id)) return error('Foto no válida.');
  const enUso = await env.DB.prepare(
    `SELECT (SELECT COUNT(*) FROM productos WHERE fotos LIKE ?1) + (SELECT COUNT(*) FROM config WHERE clave = 'logo' AND valor = ?2) AS n`
  ).bind(`%${params.id}%`, params.id).first();
  if (enUso.n > 0) return error('Esa foto está en uso. Quítala del producto primero.', 409);
  await env.FOTOS.delete(params.id);
  return json({ ok: true });
}
