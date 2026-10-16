// Sesión con token firmado (HMAC-SHA256) guardado en cookie HttpOnly.

const COOKIE = 'cf_sesion';
export const DURACION_SEG = 7 * 24 * 60 * 60; // 7 días

const enc = new TextEncoder();

function b64url(bytes) {
  let s = '';
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function desdeB64url(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

// La clave de firma se deriva de ADMIN_PASSWORD: si cambias la contraseña,
// todas las sesiones anteriores dejan de valer.
function clave(env, usos) {
  return crypto.subtle.importKey('raw', enc.encode('cf-sesion:' + env.ADMIN_PASSWORD), { name: 'HMAC', hash: 'SHA-256' }, false, usos);
}

async function firmar(env, datos) {
  const k = await clave(env, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', k, enc.encode(datos)));
}

export async function crearToken(env) {
  const exp = Math.floor(Date.now() / 1000) + DURACION_SEG;
  const datos = String(exp);
  return `${datos}.${await firmar(env, datos)}`;
}

export async function tokenValido(env, token) {
  if (!env.ADMIN_PASSWORD || typeof token !== 'string') return false;
  const [datos, firma] = token.split('.');
  if (!datos || !firma || !/^\d+$/.test(datos)) return false;
  if (Number(datos) < Math.floor(Date.now() / 1000)) return false;
  try {
    const k = await clave(env, ['verify']); // verify es de tiempo constante
    return await crypto.subtle.verify('HMAC', k, desdeB64url(firma), enc.encode(datos));
  } catch (e) {
    return false;
  }
}

// Compara contraseñas sin filtrar información por tiempo.
export async function passwordCorrecta(env, intento) {
  if (!env.ADMIN_PASSWORD || typeof intento !== 'string') return false;
  const k = await crypto.subtle.importKey('raw', enc.encode('cf-login'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  const esperado = await crypto.subtle.sign('HMAC', k, enc.encode(env.ADMIN_PASSWORD));
  return crypto.subtle.verify('HMAC', k, esperado, enc.encode(intento));
}

export function leerCookie(request) {
  const header = request.headers.get('Cookie') || '';
  for (const parte of header.split(';')) {
    const [n, ...v] = parte.trim().split('=');
    if (n === COOKIE) return v.join('=');
  }
  return null;
}

export async function haySesion(request, env) {
  return tokenValido(env, leerCookie(request));
}

export function cookieSesion(request, token, maxAge = DURACION_SEG) {
  const seguro = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${seguro}`;
}
