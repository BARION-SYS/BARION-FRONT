# CLAUDE.md — barion (front)

Frontend de Barion — SaaS multi-tenant para barberías (Colombia base; opera también en EE. UU. y España). Next.js App Router. **PWA — no existe app nativa.** Consume la API de `barion-api` (`/api/v1` — prefijo global + versión); los tipos de las respuestas son **propios de este repo**. Arquitectura diseñada para conectar la API real sin refactorizar estructura.

**Estado actual: mock de UI, EXCEPTO `auth`.** La data mock de cada feat vive en `constants/[feat].json`; el service es el ÚNICO que la importa y la sirve con la MISMA forma `ApiResult<T>` — al integrar solo cambia el cuerpo del service (JSON → `api.get/post/...`). Los íconos van en el JSON como nombre (string) y el service los mapea a componentes Lucide.

**`auth` ya es real** y marca el patrón para los demás:

- La sesión viaja en una **cookie httpOnly** que este código no puede leer. No hay token que guardar ni cabecera que poner: basta `withCredentials` en el `ApiClient`.
- El login **solo autentica** — identifica por correo, que es único; no se pide la barbería. Su respuesta se ignora a propósito.
- **`GET /auth/me` es la ÚNICA fuente de la sesión**, tras entrar y tras cada recarga. Dos orígenes para lo mismo acaban siendo dos verdades.
- El store **no persiste**: la verdad es la cookie, y una copia en localStorage le sobrevive — el panel seguiría pintándose autenticado mientras cada petición devuelve 401. `hidratada` distingue "no hay sesión" de "todavía no se sabe", para no expulsar a nadie en cada recarga.

Este archivo define arquitectura y convenciones. NO lista los features a propósito: en cada tarea, leer el código del feat afectado — el código es la fuente de verdad.

## Stack

| Herramienta             | Rol                                                |
| ----------------------- | -------------------------------------------------- |
| Next.js 16 (App Router) | Framework + routing                                |
| React 19                | UI runtime                                         |
| TypeScript              | Tipado estricto — `any` prohibido (usar `unknown`) |
| Tailwind CSS 4          | Estilos (tokens en `style/globals.css`)            |
| shadcn/ui               | Primitivos UI (`shared/components/ui/`)            |
| Zod                     | Validación de lo que el front envía a la API       |
| axios (`ApiClient`)     | HTTP (`lib/http/`)                                 |
| react-hook-form         | Formularios (+ `standardSchemaResolver`)           |
| next-themes             | Tema claro/oscuro                                  |
| motion                  | Animaciones (importar de `motion/react`)           |
| Recharts                | Gráficas                                           |

## Principio: feature-first

Cada feature agrupa todo su código. `shared/` solo para lo usado en 2+ features.

```text
/
├── app/        # Routing — la page.tsx ES el padre ('use client'): hooks + estado + props a hijos
├── features/   # Un folder por feature (dominio en español: citas, barberos, nomina…)
├── shared/     # Reutilizable — ver § Reutilización
├── store/      # Stores globales Zustand — solo estado (se crea cuando exista el primero)
├── lib/        # Infra técnica: http/ (ApiClient + instancias)
├── config/     # env.ts (vars de entorno) + regiones.ts (CO/COP, US/USD, ES/EUR)
├── routes/     # Fuente única de rutas (la barra lateral y el encabezado se generan de aquí)
└── style/      # globals.css — tema claro/oscuro, tokens
```

**Estos son los únicos directorios raíz.** Nunca un `components/` suelto en la raíz.

**Estructura de una feature:**

```text
features/[nombre]/
├── components/   # presentacionales (List/Toolbar/Form/Detalle…) — la página padre vive en app/
├── hooks/        # use[Nombre].ts — UN solo hook, toda la lógica de API
├── services/     # [nombre].service.ts — singleton, solo HTTP (hoy mock con forma ApiResult)
├── types/        # [nombre].types.ts — lo que la API devuelve + filtros
├── schemas/      # [nombre].schema.ts — Zod, lo que el front envía
├── utils/        # helpers de dominio (configEstadoCita…) — solo cuando hace falta
└── constants/    # constantes de dominio + [feat].json — la data mock del feat en JSON
```

Únicas subcarpetas válidas. Nunca un `.ts`/`.tsx` suelto en la raíz de la feature.

## Flujo de datos (obligatorio)

```text
API → Service → Hook → Página (padre) → Hijos
                 ↕
               Store (estado global)
```

- **Service**: objeto literal singleton, `async` puro sobre `api` (`@lib/http/instances`). Sin estado, sin hooks. Todo método que recibe datos de formulario **parsea con su schema zod antes de enviar** (`schema.parse(payload)`): descarta claves ajenas, transforma (`''`→`undefined`, `trim`) y valida. Queries con `omitEmpty`. Multipart: el schema incluye el `File`; el service arma el FormData con `toFormData` (`@shared/utils/formData`).
- **Hook**: `use[Feature].ts` — ÚNICO que llama al service. Solo estado de API: data del dominio, `loading[Qué]` (`loadingLista`, `loadingAction`…), `error`. **Sin `useEffect`, sin `useRef`, sin UI state** (modales, selección, filtros — van en el padre). Ops con `useCallback`; mutaciones `handle[Accion][Feature]` que devuelven `Promise<string>` (el `message` de la API); siempre `const res = await service.op(); return res.message`. Errores con `getErrorMessage`.
- **Página (padre)**: `app/.../page.tsx` (`'use client'`, default export) orquesta: consume el hook de SU feature, UI state (filtros, modales, selección), `useEffect` que dispara el fetch, handlers de crear/editar/eliminar que re-ejecutan el fetch. Compone hijos y pasa datos + callbacks por props.
- **Hijos**: presentacionales — props tipadas (`interface [Componente]Props`), sin hooks de datos. Pueden llamar el hook de OTRA feature solo para leer catálogos read-only de sus selects. **La mutación vive SIEMPRE en el padre** — un hijo que muta con hook propio crea otra instancia de estado y la lista no se refresca; el hijo dispara por `onSubmit`.

**Hijos por rol** (nombres fijos — ver § Convenciones de nombrado):

- **`[Feat]List`** = presentacional puro: `items` + `loading` + callbacks → lista/tabla + estados (`Loadable`/`DataSkeleton`). Sin hooks, sin estado.
- **`[Feat]Toolbar`** = filtros/búsqueda actuales + callbacks por props.
- **`[Feat]Form`** = RHF + schema zod + `Field`; recibe `onSubmit` (la mutación del padre) por props.
- **`[Feat]Detail`** = panel/vista de detalle del ítem seleccionado.
- **`[Feat]Card`** = ítem individual de una lista. **`[Feat]Chart`** = una gráfica (con sufijo descriptivo si hay varias: `NominaProduccionChart`).
- La página NO es un `*List` intermedio: la página es el padre y el `*List` solo la tabla.
- **Store** (`store/`): Zustand, solo `set`/`get`. Un store por dominio global (`auth.store.ts`); las features de negocio no tienen store.

## HTTP (`lib/http/`)

- `client.ts`: SOLO la clase `ApiClient` (axios + interceptores). Desempaca el envelope de la API.
- `instances.ts`: todas las instancias nombradas (`api` con `env.apiUrl`). **Los services importan de aquí.**
- **Contrato de la API: el body SIEMPRE llega `{ data, message?, pagination? }`** — el payload directo en `data` (nunca `data.usuarios`). `ApiClient` normaliza a `ApiResult<T> = { data, status, message, pagination? }`.
- Tipos del cliente → `shared/types/api.types.ts`, NUNCA dentro de `lib/http/`.
- `config/env.ts` es la fuente única de `process.env` (validado con zod); ningún otro archivo lo toca.

## Formularios — zod define lo que se envía

- Schema en `schemas/[feat].schema.ts`; el tipo enviado **se deriva con `z.infer<>`**, nunca a mano. Mensajes en español.
- Lo **recibido** de la API se tipa en `types/` — los filtros de listado también son types, no schemas.
- RHF + `standardSchemaResolver` (`@hookform/resolvers/standard-schema`) + componentes `Field` de shadcn (ver `features/auth/components/Login.tsx`).
- Errores de validación = inline junto al campo, NUNCA toast.
- **Notificaciones**: toasts SOLO vía `notify` (`shared/services/notify.ts`, wrapper de sonner) — nunca `toast` directo. El padre captura el `message` de la mutación y dispara `notify.success(message)`; errores de API con `notify.error(getErrorMessage(err))`.
- Mutaciones mock: el service mantiene una copia en memoria del JSON (módulo-scope) y la modifica — el padre refetchea tras mutar y el cambio SE VE, mismo flujo que con la API real.

## Rutas (`routes/`)

Fuente única (`rutasDashboard.ts` + `types/routes.types.ts`): la barra lateral y el encabezado iteran `rutasDashboard` — nada hardcodeado. Agregar sección = agregar una entrada.

## UI y tema (`style/globals.css`)

**Fuente única de la paleta.** `:root` = claro · `.dark` = oscuro. Un color nuevo va a AMBOS bloques. Tokens de estado propios: `--exito`, `--info`, `--advertencia`.

- En componentes SOLO tokens semánticos: `bg-card`, `text-muted-foreground`, `text-(--exito)`, `var(--chart-1)`.
- **Color dinámico (que llega por dato/prop): SIEMPRE como variable CSS + clase** — `style={{ "--tono": color }}` y `className="text-(--tono) bg-[color-mix(in_srgb,var(--tono)_12%,transparent)]"`. PROHIBIDO `style={{ backgroundColor, color }}` directo (ver `StatusBadge`, `InitialsAvatar`, `BrandStudio`).
- **Colores del tenant (primario + fondo), editables SOLO por el admin y ADAPTATIVOS**: se eligen en el `BrandStudio` (botón de paleta del navbar → Modal con preview del diseño) (presets en `config/marca.ts` + libre), con preview y botón Aplicar — nada cambia hasta aplicar. Viven en `store/marca.store.ts`; `TenantProvider` inyecta un `<style>` con `cssDeMarca` (`shared/utils/color`): un bloque `:root` y otro `.dark` usando **variantes adaptativas** del color elegido (`variantesPrimario`/`variantesFondo` ajustan luminosidad por tema, foreground por contraste) — la estética se conserva en claro y oscuro, panel Y portal. Los clientes del portal SOLO los ven, jamás los modifican. Sin elección mandan los defaults de globals.css. Configuración → Apariencia NO configura colores: es logotipo + vista previa del portal.
- **El color de fondo del tenant tiñe TODA la escala de superficies, en ambos temas** (`varsFondo` en `shared/utils/color.ts`): fondo, card, secondary/muted y bordes salen del matiz elegido con pasos de luminosidad que conservan jerarquía (claro: fondo l:87 → card l:96; oscuro: fondo l:10 → card l:14 → secondary l:19 → borde l:25). La card NUNCA es blanco/negro puro con color elegido — **Sidebar y Navbar se adaptan solos porque pintan con `bg-card`**, no llevan color propio. Cualquier ajuste de la escala se hace SOLO en `shared/utils/color.ts` (la preview del BrandStudio usa las mismas funciones vía `tokensDeTema`).
- **PROHIBIDO**: color hardcodeado (`#fff`, `text-gray-700`, `text-emerald-400`) y el variant **`dark:`** — cada token ya define claro y oscuro.
- Tema vía **next-themes**: `shared/providers/ThemeProvider` (attribute="class", default dark) + `shared/layout/ThemeToggle` (único control, no duplicar). Lógica de tema solo con `useTheme()`; guard de `mounted`.
- **Logo de marca = SIEMPRE `LogoBarion`** (`shared/components/brand/LogoBarion.tsx`): variantes `completo`/`icono`, resuelve el asset webp según tema (`public/barion-{logo,icon}-{light,dark}.webp`) con dimensiones intrínsecas correctas. PROHIBIDO `<Image>` directo a esos assets o duplicar la lógica de tema del logo. Favicon/apple-icon se declaran en `app/layout.tsx` (`apple-icon.png` es PNG porque iOS no soporta webp).
- **Animaciones con `motion`** (`motion/react`): todo árbol animado va bajo un `MotionConfig reducedMotion="user"` (ya existe en el login y en `LayoutDashboard` — no anidar otro). Lenguaje de movimiento: entradas con springs suaves (stiffness ~140, damping ~22) y cascadas (`staggerChildren`), micro-interacciones 150-300ms, salidas más cortas que entradas vía `AnimatePresence`. El colapso del sidebar NO usa motion en el `<aside>` (su transform es del drawer móvil): ancho por transición CSS y contenido con transiciones CSS coordinadas (misma duración/curva). `.cinta-barberia` (globals.css) es la franja diagonal animada de marca — usarla como acento, no decorar cada vista.
- **Primitivos UI → shadcn** (`shared/components/ui/`, instalados con `pnpm dlx shadcn@latest add x`). Nunca construir botones/inputs/dialogs desde cero. Nativos solo sin pieza shadcn (grilla de calendario, svg del QR).
- **Los primitivos están AFINADOS para Barion** (única edición permitida sobre ellos — solo clases, nunca lógica/API): alturas de formulario h-9, padding px-3, jerarquía tipográfica (labels `text-sm font-medium`, CardTitle `text-base font-semibold`, DialogTitle `text-lg`), tabla con `TableHead` uppercase muted y celdas `py-3`, sombras por escala (popover `shadow-md`, dialog `shadow-lg`). Al instalar una pieza nueva con el CLI, re-afinarla con estos mismos criterios.

## Datos, formato y regiones

- La API entrega crudo: **centavos + ISO 4217, timestamps UTC, códigos**. **TODO formateo vive en `shared/utils`** — prohibido `Intl.*`/`toLocaleString`/`toFixed` en componentes:
  - `datetime.ts` (timezone de la SEDE por parámetro), `currency.ts` (`formatMoney`), `numbers.ts`, `i18n.ts` (formateadores Intl memoizados).
- Multi-región: `config/regiones.ts` (CO/COP, US/USD, ES/EUR — agregar país = una entrada) → `TenantProvider` carga la config del tenant UNA vez → componentes usan `useFormato()` (`@shared/hooks`) que inyecta moneda/locale/timezone.
- Barion no procesa pagos de clientes finales ni asume costos de mensajería (BYO por barbería).

## Reutilización (`shared/`)

```text
shared/
├── components/
│   ├── ui/          # Primitivos shadcn — SOLO shadcn, nunca editar a mano
│   ├── brand/       # LogoBarion — logo adaptativo al tema, única fuente de marca
│   ├── modals/      # Modal — shell agnóstico sobre Dialog (open, titulo, children, footer, size)
│   ├── feedback/    # DataSkeleton, Loadable
│   ├── charts/      # ChartTooltip
│   ├── forms/       # composiciones de formulario reutilizables
│   └── (raíz)       # composiciones propias en carpeta por tipo: stats/StatCard, cards/SectionCard, status/StatusBadge, avatar/InitialsAvatar
├── layout/          # App shell: LayoutDashboard, Sidebar, Navbar, ThemeToggle — nombres de estructura SIEMPRE en inglés
├── providers/       # ThemeProvider, TenantProvider (+ AuthProvider, QueryProvider al integrar)
├── hooks/           # useFormato + genéricos sin dominio
├── types/           # api.types.ts (ApiEnvelope, ApiResult, HttpError, PaginationInfo), ui.types.ts
└── utils/           # Puras: cn, error (getErrorMessage), params (omitEmpty), formData, datetime, currency, numbers, i18n
```

Reutilizar SIEMPRE los compartidos antes de construir: `SectionCard` (tarjeta con header), `StatCard` (indicador), `StatusBadge` (píldora por `tono` con ícono — estado nunca solo color), `InitialsAvatar`, `ChartTooltip` (todo Tooltip de recharts), `DataSkeleton`/`Loadable` (carga), `InfoTooltip` (`shared/components/tooltips/` — tooltip genérico condicional para cualquier componente).

**Modales = SIEMPRE el `Modal` compartido (`shared/components/modals/Modal.tsx`), presentacional puro.** Un modal NO sabe nada de lo que ocurre dentro: sin estado, sin lógica, sin hooks/services. La lógica (submit, `loading`, validación, cierre tras éxito) vive en el padre, que arma el contenido y lo pasa por `children`/`footer`. PROHIBIDO componer `Dialog` a mano en un feature.

**Estados de carga = skeleton, NUNCA spinner ni texto "Cargando…" (regla dura).** Todo loading de datos usa `DataSkeleton` (`shared/components/feedback/`, sobre el Skeleton de shadcn) con la variante de lo que va a aparecer (`text|list|card|table|form|stats|chart`), directo o vía la compuerta `Loadable` (`loading` → skeleton, `isEmpty` → vacío, si no → children). Única excepción: el estado de submit de un botón.

- Función igual en 2+ features → `shared/utils`. Constante/tipo usado por 2+ features → sube a `shared/`.
- Cada dominio tiene UN feat dueño; los demás importan de él (ej.: `dashboard` usa `configEstadoCita` de `citas`). PROHIBIDO duplicar.

## Convenciones de nombrado

Mismo esquema que GORA-ADMIN: **componente = feature primero + rol en inglés**, PascalCase.

| Artefacto                   | Convención                                                   | Ejemplo                                                                     |
| --------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Feature folder              | dominio en español, minúscula                                | `features/citas/`                                                           |
| Componente de feature       | PascalCase, **feature primero + rol**                        | `CitasList.tsx`, `CitasToolbar.tsx`, `BarberosDetail.tsx`, `NominaForm.tsx` |
| Componente único de dominio | PascalCase, conciso, sin prefijos de tipo                    | `Login.tsx` (nunca `FormularioLogin`)                                       |
| Página                      | `app/.../page.tsx` default export `[Feat]Page` — ES el padre | `CitasPage`                                                                 |
| Componente de layout        | inglés, PascalCase                                           | `Sidebar.tsx`, `Navbar.tsx`, `ThemeToggle.tsx`                              |
| Componente shared           | PascalCase descriptivo                                       | `StatCard`, `DataSkeleton`, `Loadable`, `ChartTooltip`                      |
| Hook                        | `use` + feature (UNO por feature)                            | `useCitas.ts`                                                               |
| Service                     | `.service`                                                   | `citas.service.ts`                                                          |
| Types                       | `.types`                                                     | `citas.types.ts`                                                            |
| Schema                      | `.schema`                                                    | `citas.schema.ts`                                                           |
| Store                       | `.store`                                                     | `auth.store.ts`                                                             |
| Mock JSON                   | `constants/[feat].json`                                      | `constants/citas.json`                                                      |
| Props                       | `[Componente]Props`                                          | `CitasListProps`                                                            |

- Roles válidos de componente de feature: `List`, `Toolbar`, `Form`, `Detail`, `Card`, `Chart`, `Nav` (+ sufijo descriptivo si hay varios del mismo rol: `NominaProduccionChart`). Piezas que no encajan en un rol usan nombre conciso del dominio (`GrillaSemana` del calendario) — la excepción, no la regla.
- Dominio en español entendible; inglés donde el término se identifica así (`auth`, `dashboard`, `qr`, los roles `List/Form/...`, capas técnicas: `api`, `toFormData`, `ApiResult`). No forzar español donde el nombre natural es inglés.
- Estado de hook con nombre del dominio (`citas`, no `items`); loading `loading[Qué]` (`loadingLista`, `loadingAction`), nunca `loading` a secas; ops `handle[Accion][Feature]` (`handleCreateCita`), nunca `handleCreate`; fetch `fetch[Qué]`.
- Named exports en componentes de feature (solo las páginas son default). `any` prohibido.
- Comentarios: cortos, en español, solo donde una lógica complicada lo amerite.
- Código existente con nombres previos a esta regla: se renombra al rol correcto **cuando se toque ese feature**, no en masa.

## Aliases de importación

Usar siempre el más específico; rutas relativas y barriles (`index.ts`) PROHIBIDOS.

| Alias         | Resuelve a                  |
| ------------- | --------------------------- |
| `@features/*` | `./features/*`              |
| `@shared/*`   | `./shared/*`                |
| `@store/*`    | `./store/*`                 |
| `@lib/*`      | `./lib/*`                   |
| `@config/*`   | `./config/*`                |
| `@routes/*`   | `./routes/*`                |
| `@public/*`   | `./public/*`                |
| `@/*`         | fallback (`app/`, `style/`) |

## Formato de código (Prettier)

**Prettier es la única fuente de formato** — nadie discute tabulación/comillas a mano. Config en `.prettierrc`: 2 espacios (nunca tabs), sin semicolons, comillas dobles, `printWidth` 100, `prettier-plugin-tailwindcss` (ordena clases Tailwind leyendo tokens de `style/globals.css`). Ignorados en `.prettierignore` (`.next`, `node_modules`, `pnpm-lock.yaml`, `public`).

- `pnpm format` — formatea todo el repo. Correr antes de commitear.
- `pnpm format:check` — solo verifica (CI / pre-merge).
- No cambiar reglas de `.prettierrc` por preferencia personal; un cambio de formato = PR propio que reformatea todo el repo en un solo commit.

## Responsividad (obligatorio)

Mobile-first: clases base = móvil; `sm: md: lg: xl:` añaden. Sin scroll horizontal (probar 375/768/1024/1440). `min-h-dvh`/`h-dvh`, nunca `100vh`. Touch targets ≥ 44px. Texto base ≥ 16px en móvil. Layouts fluidos (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`), nada de anchos fijos en px. Tablas con `overflow-x-auto` o tarjetas en móvil. Sidebar colapsable en desktop + drawer en móvil. Respetar `prefers-reduced-motion` (`motion-reduce:transition-none`).

## Skills de frontend

Para trabajo de UI/UX apoyarse en las skills, no improvisar: `frontend-design` (dirección visual) y `ui-ux-pro-max` (patrones UX, accesibilidad, estados). Implementar respetando esta arquitectura.

## PWA

- Booking público (`/b/[slug]`) SSR sin login — conversión: rápido en gama baja, reserva con teléfono + OTP.
- Service worker: precache del shell, cache-first assets, network-first datos, Web Push (VAPID). Offline básico: agenda del barbero desde el último snapshot.
- iOS ≥ 16.4: push solo con la PWA en pantalla de inicio.
- Tema por tenant vía CSS variables inyectadas en el layout — no hardcodear marca.

## Prohibido

**Estructura**: `any` · barriles · default exports fuera de páginas · directorio raíz fuera de la lista · archivo suelto en la raíz de una feature · tipos/funciones duplicados entre features · más de un hook por feature · componentes > ~150 líneas sin dividir.

**Flujo**: lógica en stores/services · HTTP fuera del service o fuera de `ApiClient` · `useEffect`/`useRef`/UI state en hooks · mutación en un hijo con hook propio · página que solo hace `return <X/>` (la página ES el padre) · importar el service de otra feature en un componente (llamar al hook dueño).

**Tipos/schemas**: filtros en `schemas/` (van en `types/`) · `z.infer<>` sustituido por type manual · service que recibe datos de form sin `schema.parse` · hook limpiando payload a mano o armando `new FormData()` (schema + `toFormData` en el service) · `process.env` fuera de `config/env.ts` (única excepción: `next.config.mjs`, corre en Node antes del app y no puede importar TS — sus valores configurables entran por env vars, ej. `ALLOWED_DEV_ORIGINS`).

**UI**: errores sin `getErrorMessage` · toast para error de validación de campo (va inline) · primitivos UI a mano · color hardcodeado o `dark:` · formateo inline (`toLocaleString`/`toFixed`/`Intl.*`) fuera de `shared/utils` · lógica de tema fuera de `useTheme()` · UI no responsive (`100vh`, anchos fijos, scroll horizontal) · **spinner o texto "Cargando…" para cargar datos — SIEMPRE `DataSkeleton`/`Loadable`**.

**Rutas**: rutas hardcodeadas en el sidebar — vienen de `routes/`.

## Checklist nuevo feature

1. `features/[nombre]/` con `components/`, `hooks/`, `services/`, `types/`, `schemas/`.
2. `types/` — lo que la API devuelve + filtros. 3. `schemas/` — zod de lo que se envía (`z.infer<>`).
3. `services/[nombre].service.ts` — singleton sobre `api`; `schema.parse` antes de enviar; `omitEmpty` en queries (mock: misma forma `ApiResult`).
4. `hooks/use[Nombre].ts` — un solo hook, solo API state + `useCallback` ops.
5. `app/dashboard/[nombre]/page.tsx` — el padre (`'use client'`): hook + UI state + `useEffect` fetch + handlers.
6. Hijos presentacionales por props. 8. Entrada en `routes/rutasDashboard.ts`.

## Comandos

Las dependencias se instalan SIEMPRE desde el host (`pnpm add` en este repo): el contenedor de dev del repo padre monta el proyecto completo (incluido `node_modules`) y las ve al instante — jamás instalar dentro del contenedor ni rebuildear la imagen por una dependencia.

```bash
pnpm dev        # desarrollo (API local: docker compose del repo padre)
pnpm build      # build de producción
pnpm start      # servir el build
pnpm lint       # OJO: eslint NO está en devDependencies — este script falla hoy.
                # Lo que sí verifica tipos: ./node_modules/.bin/tsc --noEmit
pnpm format     # prettier --write (todo el repo)
pnpm format:check # prettier --check (verifica sin modificar)
```
