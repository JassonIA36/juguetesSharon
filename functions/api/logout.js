import { cookieSesion } from '../_lib/auth.js';
import { json } from '../_lib/util.js';

export async function onRequestPost({ request }) {
  return json({ ok: true }, 200, { 'Set-Cookie': cookieSesion(request, '', 0) });
}
