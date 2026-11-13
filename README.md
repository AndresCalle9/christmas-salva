# El árbol de Salva

Sorpresa de Navidad: cada persona escanea el QR, se toma una selfie, deja un mensaje de agradecimiento y su foto aparece como adorno en un árbol compartido. A los 30 segundos de abrir el sitio, cada persona recibe una nota (elegida al azar) de Andrés, Lizz y la sede Madrid.

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

2. En Supabase → SQL Editor, ejecuta [`supabase/schema.sql`](supabase/schema.sql).
3. Comprueba que todo está listo:

   ```bash
   npm run check:supabase
   ```

4. Desarrollo: `npm run dev`. La cámara del navegador exige HTTPS (o `localhost`); para probar desde el móvil usa el deploy de Vercel o un túnel HTTPS. Si la cámara no está disponible, la app ofrece tomar o subir la foto con el selector nativo del teléfono.

## Dónde cambiar cosas

| Qué | Archivo |
| --- | --- |
| Mensajes de la notificación (y su firma) | `src/lib/greetings.ts` |
| Retraso de la notificación (30 s) | `src/components/Greeting.tsx` (`DELAY_MS`) |
| Frecuencia de refresco del árbol | `src/components/Tree.tsx` (`REFRESH_MS`) |
| Colores de marca | `src/app/globals.css` (`:root`) |
| Límites de nombre / mensaje / foto | `src/lib/wish.ts` |

## Rutas

- `/` — selfie + nombre + mensaje
- `/arbol` — el árbol (sirve también para proyectarlo en una pantalla)
- `GET /api/wishes` — lista de adornos · `POST /api/wishes` — multipart `photo`, `name`, `message`
