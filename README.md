# trimly (front)

Frontend de Trimly — SaaS multi-tenant para barberías. Next.js (App Router) + TypeScript + Tailwind 4 + shadcn. **PWA instalable — no hay app nativa.**

> **Estado: mock de UI.** Pantallas generadas con v0, sin integración con la API todavía. La arquitectura objetivo (features, hooks, singletons) está en [`CLAUDE.md`](./CLAUDE.md); el código migrará a ella al conectar la API.

Superficies previstas:

- `/` — landing del SaaS y registro de barberías.
- `/b/[slug]` — booking público por barbería (QR/link, SSR, sin login).
- `/app/admin` · `/app/barber` · `/app/front` · `/app/me` — paneles por rol (admin, barbero, recepción, cliente).

## Requisitos

- Node.js 22 + pnpm (vía corepack: `corepack enable pnpm`)
- Para integración: API corriendo (compose del repo padre, puerto 4000)

## Correr

### Con Docker (recomendado)

Desde el repo padre:

```bash
make dev        # levanta web + api + worker + postgres + redis
```

### Local (fuera de Docker)

```bash
cp .env.example .env    # NEXT_PUBLIC_API_URL=http://localhost:4000

pnpm install
pnpm dev                # http://localhost:3000
```

## Scripts

```
pnpm dev        # desarrollo con hot reload
pnpm build      # build de producción
pnpm start      # servir el build
pnpm lint       # eslint
```

## Variables de entorno

Definidas en `.env` (ver [`.env.example`](./.env.example)). Este repo no lee variables del padre.

| Variable              | Descripción                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | URL de la API vista desde el **navegador**. Se hornea en el build de producción (build ARG en Docker) |

## Docker

- `Dockerfile` — producción multi-stage con Next standalone. **Requiere `output: 'standalone'` en `next.config.mjs`** — pendiente de activar al pasar del mock a integración (no tocar código aún).
- `Dockerfile.dev` — desarrollo con hot reload; código montado por volumen desde el compose padre.

## PWA

- Instalable (manifest + service worker) con Web Push (VAPID) — se implementa al pasar del mock a integración.
- iOS ≥ 16.4: push solo con la PWA agregada a pantalla de inicio.
- Cambios en el service worker se prueban con build de producción (`pnpm build && pnpm start`) — `next dev` no lo registra igual.

## Deploy

Opción A — Vercel: conectar el repo; `NEXT_PUBLIC_API_URL` como variable de proyecto.
Opción B — contenedor: CI buildea imagen (pasando `NEXT_PUBLIC_API_URL`) → registry → tag `IMAGE_WEB` en la infra.
