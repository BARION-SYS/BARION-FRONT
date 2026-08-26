# barion (front) — PRODUCCIÓN (multi-stage, Next.js standalone)
# Requiere `output: 'standalone'` en next.config.mjs — activarlo al pasar del mock a producción.

# ---------- Stage 1: dependencias ----------
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---------- Stage 2: build ----------
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Variables NEXT_PUBLIC_* se hornean en el build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Dirección del sitio público (repo BARION-WEB): el 404 y el final del registro
# salen hacia allá. `config/env.ts` la exige sin reserva, y al ser NEXT_PUBLIC_*
# se hornea aquí: si falta, el bundle llega al navegador sin ella y la validación
# del entorno revienta en la primera pantalla, no en el build.
ARG NEXT_PUBLIC_LANDING_URL
ENV NEXT_PUBLIC_LANDING_URL=$NEXT_PUBLIC_LANDING_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---------- Stage 3: runner ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S barion && adduser -S barion -G barion

COPY --from=build --chown=barion:barion /app/.next/standalone ./
COPY --from=build --chown=barion:barion /app/.next/static ./.next/static
COPY --from=build --chown=barion:barion /app/public ./public

USER barion
EXPOSE 3003
ENV PORT=3003 HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
