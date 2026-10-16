import { crearToken, cookieSesion, passwordCorrecta } from '../_lib/auth.js';
import { error, json, leerJSON } from '../_lib/util.js';

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) return error('El servidor no tiene configurada la contraseña de administración.', 500);
  const d = await leerJSON(request);
  if (!d) return error('Solicitud inválida.');
  if (!(await passwordCorrecta(env, d.password))) {
    await new Promise((r) => setTimeout(r, 600)); // frena intentos repetidos
    return error('La contraseña no es correcta.', 401);
  }
  const token = await crearToken(env);
  return json({ ok: true }, 200, { 'Set-Cookie': cookieSesion(request, token) });
}
