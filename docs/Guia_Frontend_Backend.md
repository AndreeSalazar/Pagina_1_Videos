# Guía de desarrollo: Frontend Next.js + Backend Express

Esta guía documenta cómo está montado el proyecto para ejecutar el Frontend (Next.js) y el Backend (Express) como dos procesos Node.js separados, cómo se comunican, y cómo resolver los problemas típicos al trabajar en desarrollo.

## Concepto
- Dos servidores en paralelo:
  - Backend Express en `http://localhost:5000`.
  - Frontend Next.js en `http://localhost:3000` (o `3001/3002` en desarrollo).
- El Frontend llama al Backend usando `fetch` contra `NEXT_PUBLIC_API_BASE` o, por defecto, `http://localhost:5000`.

## Estructura
- `server/`: API Express.
- `apps/next/`: aplicación Next.js.

## Puertos y CORS
- Backend escucha en `process.env.PORT || 5000` (`server/src/index.js:14–16`).
- CORS permite orígenes de desarrollo: `http://localhost:3000`, `3001`, `3002`, `5173`, `4200` (`server/src/app.js:15`).

## Variables de entorno
- Frontend puede fijar la base del backend con `NEXT_PUBLIC_API_BASE`:
  - Crear `apps/next/.env.local` y poner:
    ```
    NEXT_PUBLIC_API_BASE=http://localhost:5000
    ```
- Si no se define, el código usa `http://localhost:5000` por defecto.

## Arranque en desarrollo
- Backend:
  - `pnpm -C server dev`
  - Ver `server listening on 5000` en la consola.
- Frontend (puerto por defecto 3000):
  - `pnpm -C apps/next run dev`
- Frontend en otro puerto (ej. 3001/3002):
  - `pnpm -C apps/next exec next dev -p 3001`
  - `pnpm -C apps/next exec next dev -p 3002`

## Flujo funcional (tipo YouTube + Discord)
- Hub y Watch:
  - Abrir `http://localhost:3000/hub` para el feed, canales y chat.
  - Al pulsar un video se navega a `watch/[id]` y se incrementa la vista.
  - El chat se reutiliza entre Hub y Watch.
- Endpoints clave del Backend (`server/src/routes/hub.js`):
  - `GET /api/hub/videos` y `GET /api/hub/videos/:id`.
  - `POST /api/hub/videos/:id/view` incrementa vistas (`server/src/routes/hub.js:24–29`).
  - `POST /api/hub/videos/:id/like` incrementa likes (`server/src/routes/hub.js:30–35`).
  - `GET/POST /api/hub/messages` mensajes del chat.

## Componentes clave del Frontend
- `AppHeader` (header, búsqueda y alias):
  - Envía la búsqueda hacia `/hub?q=...`.
  - Muestra alias y permite cambiarlo (se guarda en `localStorage`).
  - Referencia: `apps/next/src/app/components/AppHeader.tsx:13–16` (búsqueda) y `apps/next/src/app/components/AppHeader.tsx:18–31` (UI del header).
- `HubClient` (feed, canales, chat y alta de videos):
  - Carga canales y videos.
  - `play(id)` incrementa vista y navega a `/watch/[id]` (`apps/next/src/app/hub/HubClient.tsx:133–137`).
  - `HubChat` envía mensajes con alias y muestra hora (`apps/next/src/app/hub/HubClient.tsx:54–94`).
- `WatchClient` (página de reproducción):
  - Carga el video, incrementa vista al abrir y permite “Me gusta”.
  - Reutiliza `HubChat` con el `channelId` del video (`apps/next/src/app/watch/[id]/WatchClient.tsx:45–47`).
  - Referencias: vista (`apps/next/src/app/watch/[id]/WatchClient.tsx:13–20`), like (`apps/next/src/app/watch/[id]/WatchClient.tsx:21–27`).
- `Projects` (ejemplo de fetch a API):
  - `fetch(`${base}/api/projects`)` (`apps/next/src/app/Projects.tsx:8`).
- Layout y estilos:
  - Header + estilos globales integrados (`apps/next/src/app/layout.tsx:7–10`).
  - Estilos del chat y perfil en `apps/next/src/app/globals.css`.

## Verificación rápida
- Backend:
  - `http://localhost:5000/api/health` debe responder `{ ok: true }`.
  - `http://localhost:5000/api/projects` devuelve el demo.
- Frontend:
  - `http://localhost:3000/` carga la app.
  - `http://localhost:3000/hub` muestra feed, canales y chat.

## Problemas comunes y soluciones
- `Failed to fetch` / `ERR_CONNECTION_REFUSED`:
  - El backend no está corriendo; arranca `pnpm -C server dev` y refresca.
- `Unable to acquire lock ... .next/dev/lock`:
  - Ya hay un `next dev` activo. Usa un solo servidor o borra el lock si el proceso colgó.
- `EADDRINUSE: 3001` ocupado:
  - El puerto ya está en uso; usa `-p 3002` o cierra el proceso que ocupa `3001`.
- CORS bloquea llamadas:
  - Verifica que el origen del frontend esté en la lista (`server/src/app.js:15`).

## Buenas prácticas
- Mantén backend y frontend en terminales separados, no ejecutes otros comandos en el terminal del servidor activo.
- Usa `NEXT_PUBLIC_API_BASE` para apuntar explícitamente al backend si cambias puertos.
- Evita arrancar múltiples `next dev` sobre el mismo proyecto.

## Reutilizar la idea en otro proyecto
- Crear backend Express con endpoints REST y habilitar CORS para los orígenes de tu frontend.
- Crear frontend Next.js que consuma esos endpoints (idealmente con `NEXT_PUBLIC_API_BASE`).
- Mantener dos procesos Node.js separados durante desarrollo.
- Replicar patrones:
  - Página de feed con navegación a página de detalle.
  - Endpoints de vista/like.
  - Chat con `GET/POST /messages` y control de canal.

## Comandos útiles
- Backend dev: `pnpm -C server dev`
- Frontend dev (3000): `pnpm -C apps/next run dev`
- Frontend dev (3001/3002): `pnpm -C apps/next exec next dev -p 3001`
- Health check: `curl http://localhost:5000/api/health`
- Proyectos: `curl http://localhost:5000/api/projects`

