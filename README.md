# El árbol de Salva

Sorpresa de Navidad: cada persona escanea el QR, se toma una selfie, deja un mensaje de agradecimiento y su foto aparece como adorno en un árbol compartido. Desde una página oculta (`/control`) se envía, a todas las personas con el sitio abierto, una nota de Andrés y Liz desde Madrid (cada dispositivo ve un mensaje al azar).

## Stack

- Next.js 16 (App Router, Cache Components) en Vercel
- Supabase: tabla `wishes` + bucket público `selfies` en Storage
- SWR para refrescar el árbol cada 4 s

La secret key de Supabase **solo se usa en el servidor** (`src/lib/supabase-server.ts`, protegido con `server-only`). El navegador habla únicamente con `/api/wishes`.

## Setup

1. Variables de entorno (`.env` en local, y en Vercel → Settings → Environment Variables):

   ```
   SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_SECRET_KEY=sb_secret_...
   ```

2. En Supabase → SQL Editor, ejecuta [`supabase/schema.sql`](supabase/schema.sql) y luego [`supabase/002_broadcasts.sql`](supabase/002_broadcasts.sql).
3. Comprueba que todo está listo:

   ```bash
   npm run check:supabase
   ```

4. Desarrollo: `npm run dev`. La cámara del navegador exige HTTPS (o `localhost`); para probar desde el móvil usa el deploy de Vercel o un túnel HTTPS. Si la cámara no está disponible, la app ofrece tomar o subir la foto con el selector nativo del teléfono.

## Dónde cambiar cosas

| Qué | Archivo |
| --- | --- |
| Mensajes de la notificación (y su firma) | `src/lib/greetings.ts` |
| Ventana en que la nota aún aparece a quien entra tarde (15 min) | `src/components/Greeting.tsx` (`FRESH_FOR_MS`) |
| Cada cuánto cambian las decoraciones (45 s) | `src/lib/tree-layout.ts` (`DECOR_EPOCH_MS`) |
| Frecuencia de refresco del árbol | `src/components/Tree.tsx` (`REFRESH_MS`) |
| Colores de marca | `src/app/globals.css` (`:root`) |
| Límites de nombre / mensaje / foto | `src/lib/wish.ts` |

## Reiniciar el árbol

1. Supabase → SQL Editor → ejecuta [`supabase/reset.sql`](supabase/reset.sql) (borra fotos de la tabla y envíos).
2. `npm run reset:photos` para vaciar el bucket `selfies` (Supabase no permite borrar archivos desde SQL).
3. En tu móvil, borra los datos del sitio si quieres volver a ver el flujo como alguien nuevo.

## Rutas

- `/` — selfie + nombre + mensaje
- `/arbol` — el árbol (sirve también para proyectarlo en una pantalla)
- `/control` — página oculta con el botón para enviar la nota a todos
- `GET /api/wishes` — lista de adornos · `POST /api/wishes` — multipart `photo`, `name`, `message`
- `GET /api/broadcast` — último envío · `POST /api/broadcast` — envía la nota
