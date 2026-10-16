// Se ejecuta antes de TODAS las rutas /api:
//  - exige sesión en cualquier método que escriba (POST, PUT, PATCH, DELETE), salvo el login;
//  - convierte cualquier error inesperado en una respuesta JSON.
import { haySesion } from '../_lib/auth.js';
import { error } from '../_lib/util.js';

const LECTURA = new Set(['GET', 'HEAD', 'OPTIONS']);

export async function onRequest(context) {
  const { request, env, next } = context;
  try {
    const ruta = new URL(request.url).pathname.replace(/\/+$/, '');
    if (!LECTURA.has(request.method) && ruta !== '/api/login') {
      if (!env.ADMIN_PASSWORD) return error('El servidor no tiene configurada la contraseña de administración.', 500);
      if (!(await haySesion(request, env))) return error('Tu sesión terminó. Vuelve a entrar.', 401);
    }
    return await next();
  } catch (e) {
    console.error(e);
    return error('Ocurrió un error en el servidor. Intenta de nuevo.', 500);
  }
}
