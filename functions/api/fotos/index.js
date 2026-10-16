import { error, json } from '../../_lib/util.js';

const MAX_BYTES = 3 * 1024 * 1024;

// Sube una foto (el navegador la envía ya comprimida como JPG). Devuelve su referencia.
export async function onRequestPost({ request, env }) {
  const bytes = await request.arrayBuffer();
  if (!bytes.byteLength) return error('No llegó ninguna imagen.');
  if (bytes.byteLength > MAX_BYTES) return error('La foto pesa demasiado (máximo 3 MB).', 413);
  const h = new Uint8Array(bytes, 0, 3);
  if (!(h[0] === 0xff && h[1] === 0xd8 && h[2] === 0xff)) return error('La imagen debe ser JPG.', 415);

  const id = crypto.randomUUID();
  await env.FOTOS.put(id, bytes, { metadata: { tipo: 'image/jpeg' } });
  return json({ ok: true, ref: id }, 201);
}
