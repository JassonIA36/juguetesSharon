import { haySesion } from '../_lib/auth.js';
import { error, json } from '../_lib/util.js';

export async function onRequestGet({ request, env }) {
  return (await haySesion(request, env)) ? json({ ok: true }) : error('Sin sesión.', 401);
}
