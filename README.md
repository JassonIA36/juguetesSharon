# Tienda virtual de juguetes y materiales Montessori

Tienda en español hecha con HTML, CSS y JavaScript puro, lista para **Cloudflare Pages**.
Los productos, categorías y la configuración viven en **D1**; las fotos nuevas, en **KV**.
Los pedidos llegan por **WhatsApp**. Incluye un panel de administración en `/admin`.

## Estructura

```
public/            Lo único que se publica en internet
  index.html, style.css, app.js     Tienda
  admin/                            Panel (/admin)
  assets/img/                       Fotos de los productos de ejemplo
functions/         Backend (Pages Functions) -> /api/*
schema.sql         Tablas + 6 productos de ejemplo
wrangler.toml      Configuración de Cloudflare (bindings DB y FOTOS)
.dev.vars.example  Modelo para la contraseña en pruebas locales
```

`schema.sql`, `wrangler.toml` y este README **no** se publican: solo se publica la carpeta `public/`.

---

## 1. Probar en tu computador

Necesitas [Node.js](https://nodejs.org) 18 o superior.

```bash
# 1) Contraseña local (el archivo .dev.vars no se sube a GitHub)
cp .dev.vars.example .dev.vars        # luego edita .dev.vars y cambia la clave

# 2) Crear las tablas y los datos de ejemplo en la base D1 local
npx wrangler d1 execute DB --local --file=schema.sql

# 3) Iniciar la tienda
npx wrangler pages dev
```

O, con un solo comando (crea las tablas y arranca): `npm install` y luego `npm run dev`.

Abre <http://localhost:8788> (tienda) y <http://localhost:8788/admin> (panel).
En local, D1 y KV se simulan en la carpeta `.wrangler/` y no tocan tu cuenta de Cloudflare.

### Si no abre en local

- **No abras `index.html` con doble clic ni con Live Server:** la tienda necesita el API, que solo existe con `npx wrangler pages dev` (o `npm run dev`). Entra por <http://localhost:8788>.
- Ejecuta los comandos **dentro de la carpeta del proyecto** (donde está `wrangler.toml`).
- Si dice «No pudimos cargar los productos», faltó crear las tablas: ejecuta el paso 2.
- Si el puerto 8788 está ocupado por una ejecución anterior, ciérrala (Ctrl+C) o usa `npx wrangler pages dev --port 8790`.
- Si el panel no te deja entrar, revisa que exista `.dev.vars` con `ADMIN_PASSWORD=...` y reinicia el comando.

---

## 2. Publicar en Cloudflare, paso a paso desde cero

### 2.1 Crear la cuenta y entrar desde la terminal
1. Crea una cuenta gratuita en <https://dash.cloudflare.com/sign-up>.
2. En la terminal, dentro de esta carpeta:
   ```bash
   npx wrangler login
   ```
   Se abre el navegador; acepta el permiso.

### 2.2 Crear la base de datos D1
```bash
npx wrangler d1 create tienda-db
```
Al terminar muestra un `database_id` (un código largo). **Cópialo**.

### 2.3 Crear el KV para las fotos
```bash
npx wrangler kv namespace create FOTOS
```
Muestra un `id`. **Cópialo**.

### 2.4 Poner los códigos en `wrangler.toml`
Abre [wrangler.toml](wrangler.toml) y reemplaza:
- `REEMPLAZA-CON-EL-ID-DE-TU-BASE-D1` por el `database_id` de D1.
- `REEMPLAZA-CON-EL-ID-DE-TU-KV` por el `id` del KV.

Estos códigos no son secretos; es normal guardarlos en el repositorio.

### 2.5 Crear las tablas en la base D1 real
```bash
npx wrangler d1 execute tienda-db --remote --file=schema.sql
```
(Puedes ejecutarlo de nuevo sin miedo: no borra datos existentes.)

### 2.6 Subir los cambios a GitHub
```bash
git add -A
git commit -m "Configurar bindings de Cloudflare"
git push
```

### 2.7 Conectar el repositorio a Cloudflare Pages
1. En <https://dash.cloudflare.com> ve a **Workers & Pages** → **Create** → pestaña **Pages** → **Connect to Git**.
2. Autoriza GitHub y elige el repositorio `juguetesSharon`. Pulsa **Begin setup**.
3. Configuración de compilación:
   - **Framework preset:** `None`
   - **Build command:** déjalo vacío
   - **Build output directory:** `public`
4. Pulsa **Save and Deploy**. Espera a que termine; tendrás una dirección como `https://tu-proyecto.pages.dev`.

### 2.8 Enlazar DB y FOTOS
Como `wrangler.toml` ya declara los bindings **DB** (D1) y **FOTOS** (KV), Cloudflare los toma de ese archivo
al desplegar. Para comprobarlo: proyecto → **Settings** → **Bindings**: deben aparecer `DB` y `FOTOS`.

> Si prefieres enlazarlos a mano, o no aparecen: en **Settings → Bindings → Add**, elige
> **D1 database** (nombre de variable `DB`, base `tienda-db`) y **KV namespace** (nombre de variable `FOTOS`,
> el KV que creaste). Hazlo para **Production** y, si quieres, también para **Preview**.

### 2.9 Agregar ADMIN_PASSWORD (nunca en el código)
1. Proyecto → **Settings** → **Variables and Secrets** → **Add**.
2. **Type:** `Secret` · **Variable name:** `ADMIN_PASSWORD` · **Value:** la contraseña que quieras (larga y difícil de adivinar).
3. Guarda y haz un nuevo despliegue (**Deployments** → los tres puntos del último → **Retry deployment**) para que la use.

Para cambiar la contraseña más adelante: edita el secreto y vuelve a desplegar. Todas las sesiones abiertas se cerrarán.

### 2.10 Probar
- Tienda: `https://tu-proyecto.pages.dev`
- Panel: `https://tu-proyecto.pages.dev/admin`

---

## 3. Conectar un dominio propio

1. Proyecto → **Custom domains** → **Set up a custom domain**.
2. Escribe tu dominio (por ejemplo `www.mitienda.com`) y pulsa **Continue**.
3. Si el dominio ya está en Cloudflare, el registro DNS se crea solo: pulsa **Activate domain**.
4. Si el dominio está en otro proveedor (GoDaddy, Hostinger, etc.), en su panel de DNS crea un registro
   **CNAME** con nombre `www` (o el subdominio que elijas) y valor `tu-proyecto.pages.dev`.
   Para usar el dominio sin `www` es más fácil [pasar el DNS a Cloudflare](https://developers.cloudflare.com/dns/zone-setups/full-setup/).
5. Espera unos minutos a que el certificado HTTPS se active (el estado cambia a **Active**).

---

## 4. Cómo se usa el panel (`/admin`)

- **Productos:** crear, editar, eliminar, marcar agotado/disponible, destacar y cambiar el orden con las flechas.
  Cada producto admite hasta 4 fotos; se pueden subir desde el celular y se reducen solas (máx. 1200 px, JPG).
  «Habilidades» y «Nota de la pedagoga» son opcionales y solo se ven en la tienda si tienen contenido.
- **Categorías:** crear, renombrar y eliminar (los productos de una categoría eliminada quedan «Sin categoría»).
- **Mi tienda:** nombre, logo, WhatsApp (con indicativo 57), mensaje de bienvenida, dirección, Instagram y Facebook.
- La sesión dura 7 días. Usa **Cerrar sesión** en computadores compartidos.

Las fotos de ejemplo (`assets/img/...`) se pueden cambiar o quitar desde el panel como cualquier otra;
quitarlas nunca da error porque no están en KV. Al borrar un producto o una foto subida, la imagen también se borra de KV.

## 5. API (referencia rápida)

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/productos`, `/api/categorias`, `/api/config`, `/api/fotos/:id` | Público (las fotos con caché de 1 año) |
| POST | `/api/login`, `/api/logout` | Público / sesión |
| POST, PUT, DELETE | `/api/productos`, `/api/productos/:id`, `/api/productos/orden`, `/api/categorias[/:id]`, `/api/fotos[/:id]`; PUT `/api/config` | **Requieren sesión** |

La verificación de sesión está en un único lugar, [functions/api/_middleware.js](functions/api/_middleware.js),
que protege todo método que no sea de lectura. Los errores se devuelven siempre como JSON `{ "error": "mensaje" }`.
