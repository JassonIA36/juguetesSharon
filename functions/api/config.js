import { borrarFotosKV, error, json, leerJSON, refValida } from '../_lib/util.js';

const CLAVES = ['nombre', 'eslogan', 'logo', 'whatsapp', 'bienvenida', 'direccion', 'instagram', 'facebook'];

async function leerConfig(env) {
  const { results } = await env.DB.prepare('SELECT clave, valor FROM config').all();
  const cfg = Object.fromEntries(CLAVES.map((k) => [k, '']));
  for (const r of results) if (r.clave in cfg) cfg[r.clave] = r.valor;
  return cfg;
}

export async function onRequestGet({ env }) {
  return json(await leerConfig(env));
}

export async function onRequestPut({ request, env }) {
  const d = await leerJSON(request);
  if (!d) return error('Solicitud inválida.');
  const t = (k, max) => (typeof d[k] === 'string' ? d[k].trim() : '').slice(0, max + 1);

  const nombre = t('nombre', 60);
  if (!nombre) return error('Escribe el nombre de la tienda.');
  if (nombre.length > 60) return error('El nombre de la tienda es demasiado largo (máximo 60 letras).');
  const eslogan = t('eslogan', 80);
  const bienvenida = t('bienvenida', 200);
  const direccion = t('direccion', 200);
  const instagram = t('instagram', 200);
  const facebook = t('facebook', 200);
  if ([eslogan, bienvenida, direccion, instagram, facebook].some((v, i) => v.length > [80, 200, 200, 200, 200][i])) {
    return error('Alguno de los textos es demasiado largo.');
  }
  const whatsapp = (typeof d.whatsapp === 'string' ? d.whatsapp : '').replace(/\D/g, '');
  if (whatsapp.length < 10 || whatsapp.length > 15) {
    return error('El número de WhatsApp debe incluir el indicativo del país, por ejemplo 573001234567.');
  }
  const logo = typeof d.logo === 'string' ? d.logo.trim() : '';
  if (logo && !refValida(logo)) return error('El logo no es válido. Súbelo de nuevo.');

  const anterior = await leerConfig(env);
  const nuevo = { nombre, eslogan, logo, whatsapp, bienvenida, direccion, instagram, facebook };
  const stmt = env.DB.prepare('INSERT INTO config (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor');
  await env.DB.batch(CLAVES.map((k) => stmt.bind(k, nuevo[k])));

  if (anterior.logo && anterior.logo !== logo) await borrarFotosKV(env, [anterior.logo]);
  return json({ ok: true });
}
