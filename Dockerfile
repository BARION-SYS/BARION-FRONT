# trimly (front) — PRODUCCIÓN (multi-stage, Next.js standalone)
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
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---------- Stage 3: runner ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S trimly && adduser -S trimly -G trimly

COPY --from=build --chown=trimly:trimly /app/.next/standalone ./
COPY --from=build --chown=trimly:trimly /app/.next/static ./.next/static
COPY --from=build --chown=trimly:trimly /app/public ./public

USER trimly
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
