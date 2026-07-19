# CLAUDE.md — trimly (front)

Frontend de Trimly — SaaS multi-tenant para barberías. Next.js (App Router) + TypeScript + Tailwind + shadcn. **PWA — no existe app nativa.** Consume la API de `trimly-api` (`/v1`); los tipos de las respuestas son **propios de este repo** (espejo del OpenAPI de la api). Cada repo maneja sus dependencias de forma independiente — jamás compartir código con el back.

**Estado actual: mock de UI** (generado con v0: `app/`, `components/`, `lib/` en raíz). Al integrar con la API, el código migra a la arquitectura por features descrita abajo — toda pantalla nueva nace ya en `features/`.

Este archivo define arquitectura y convenciones. NO lista los features existentes a propósito: en cada tarea, leer el código del feat afectado — el código es la fuente de verdad.

## Arquitectura por features (objetivo)

```
trimly/
├── app/          # SOLO rutas y layouts — cáscaras que componen features. Cero lógica de negocio.
├── features/     # un feat por módulo de producto — autocontenido
│   └── <feat>/
│       ├── components/   # contenedor (página) + presentacionales
│       ├── hooks/        # hooks de datos/estado del dominio de este feat
│       ├── services/     # llamadas API del feat (usa el api-client de lib)
│       ├── types/        # tipos del feat: espejo de las respuestas de la API
│       └── utils/        # helpers exclusivos del feat
├── shared/       # React reutilizable ENTRE features
│   ├── components/   # composiciones propias sobre la base de shadcn
│   ├── hooks/        # useDebounce, useMediaQuery... (genéricos, sin dominio)
│   └── providers/    # AuthProvider, TenantProvider, QueryProvider
├── components/   # ui base generada por shadcn (no escribir lógica aquí)
└── lib/          # funciones puras y clientes — NO conoce React
    ├── api-client.ts, datetime.ts, currency.ts, i18n.ts, validators.ts
    └── utils.ts      # cn() y helpers de shadcn
```

Reglas de ubicación:

- **Cada dominio tiene UN feat dueño; los demás importan de él.** Un feat SÍ importa de otro feat cuando necesita su dominio (ej.: `features/barbers` usa `useClients` de `features/clients`). PROHIBIDO duplicar el mismo hook/servicio en dos feats — dos copias = dos fuentes de verdad.
- Lo genérico sin dominio (un Button, un useDebounce, formatear moneda) NO vive en un feat → `shared/` o `lib/`.
- `components/` (raíz) es exclusivo de la ui generada por shadcn; las composiciones propias van en `shared/components/`.
- `app/` importa de `features/`; nunca al revés.

## Imports — reglas duras

- **Alias SIEMPRE, rutas relativas NUNCA**: `import { useClients } from '@/features/clients/hooks/useClients'` — jamás `../../clients/...`.
- **Barrels NUNCA**: prohibido `index.ts` re-exportando. Import directo al archivo que define la cosa. (Rompen tree-shaking, crean ciclos, esconden el origen.)

## Regla de hooks: el padre instancia, los hijos reciben (crítica)

**Un hook con estado se instancia UNA sola vez, en el contenedor padre de la pantalla. Los hijos JAMÁS importan el mismo hook que usa su padre.** Cada llamada a un hook crea una instancia nueva de estado: dos llamadas = dos estados desincronizados = pérdida de información.

```tsx
// ✅ El contenedor instancia una vez y reparte por props
export function AgendaPage() {
  const agenda = useAgenda()   // ÚNICA instancia
  return (
    <>
      <AgendaHeader date={agenda.date} onDateChange={agenda.setDate} />
      <AgendaGrid appointments={agenda.appointments} onMove={agenda.move} />
    </>
  )
}

// ❌ PROHIBIDO — hijo re-llama el hook del padre: segunda instancia, estado duplicado
function AgendaGrid() {
  const { appointments } = useAgenda()
}
```

- Contenedor (página del feat) = orquesta hooks, pasa **datos + callbacks por props**.
- Hijos = presentacionales: props tipadas, sin hooks de datos, reutilizables.
- Prop-drilling > ~3 niveles → el feat expone un context propio (`<X>Provider` creado en el padre) — sigue siendo UNA instancia, consumida con `use<X>Context()`.

## Singletons — una instancia, nunca re-crear

| Instancia | Se crea | Regla |
|---|---|---|
| `api-client` | nivel de módulo en `lib/api-client.ts` | importar la instancia; PROHIBIDO `new`/fetch wrappers por componente |
| `QueryClient` | una vez en `shared/providers/QueryProvider` | un solo cache para toda la app |
| i18n | nivel de módulo en `lib/i18n.ts` | formateadores `Intl.*` memoizados por locale — no crear por render |
| Stores | `create()` a nivel de módulo del feat dueño | módulo-scope: todos los consumidores ven el mismo estado |
| Config de tenant (timezone/moneda/locale) | `TenantProvider` la carga una vez | `lib/datetime` y `lib/currency` la reciben por parámetro — funciones puras |

## Datos, formato y regiones

- La API entrega datos crudos: **centavos + moneda ISO, timestamps UTC, códigos**. TODO formateo ocurre aquí:
  - Fechas/horas: `lib/datetime` SIEMPRE en la timezone de la **sede** (no la del navegador).
  - Moneda: `lib/currency` según moneda/locale del tenant (COP sin decimales, EUR con coma...).
- Textos SOLO por claves i18n (diccionarios `es-CO`, `es-ES`, `en-US` propios del repo). Cero strings embebidos en JSX.
- Estado de servidor con cache y revalidación (TanStack Query al integrar la API); stores solo para UI transitoria. La verdad vive en la API — no duplicar server-state en stores.
- Server Components por defecto; `'use client'` solo donde hay interactividad.

## PWA

- Booking público (`/b/[slug]`) es SSR sin login — la conversión manda: rápido en gama baja, reserva con teléfono + OTP.
- Service worker: precache del shell, cache-first assets, network-first datos, Web Push (VAPID). Offline básico: agenda del barbero desde el último snapshot.
- iOS ≥ 16.4: push solo con la PWA agregada a pantalla de inicio.
- Tema por tenant vía CSS variables inyectadas en el layout (logo, color primario) — no hardcodear marca.

## Comandos

```bash
pnpm dev        # desarrollo (API local: docker compose del repo padre)
pnpm build      # build de producción
pnpm start      # servir el build
pnpm lint       # eslint
```
