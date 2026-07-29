# Plan de módulos — qué del mock sirve y qué hay que rehacer

> Plan de integración de este front para cubrir los cuatro actores: **staff de plataforma**, **admin de barbería**, **barbero** y **cliente final**.
>
> Contraparte en la api: `BARION-API/docs/api/plan-modulos.md`. Cambios de schema: `BARION-DB/PLAN-MODELO.md`. Orden entre repos: `BARION-SYS/docs/PLAN-MODULOS.md`.

---

## Veredicto del mock: se conserva casi todo, cambian los datos

El mock de UI de este repo **no es material desechable, es el diseño del producto ya resuelto**. Diez features con su estructura completa (página padre + hijos presentacionales + hook + service + tipos + zod), el layout, el tema por tenant y el flujo de reserva de seis pasos. Rehacer eso costaría semanas y no mejoraría nada.

Lo que sí cambia, y cambia **en todas partes a la vez**, es la forma de los datos. La arquitectura ya lo previó: `el service es el ÚNICO que importa el JSON`, así que al integrar solo cambia el cuerpo del service. Pero hay ocho supuestos del mock que la api no cumple, y esos sí tocan `types/`, `schemas/` y componentes.

### Los ocho supuestos que hay que corregir (Fase 0) ⬜ SIN EMPEZAR

| #   | El mock asume                                                | La api entrega                                                                                                                  | Alcance                                                                        |
| --- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1   | `id: number` autoincremental                                 | `id: string` (uuid)                                                                                                             | **Todos** los `types/` y los `key=` de listas                                  |
| 2   | Precio como número suelto (`110`, `1840`)                    | `precioCentavos: string` + `moneda: "COP"`                                                                                      | `barberos`, `clientes`, `nomina`, `configuracion`, `estadisticas`, `dashboard` |
| 3   | Fechas ya formateadas (`"Hoy"`, `"Hace 3 días"`, `"14 Jul"`) | Instante UTC ISO-8601                                                                                                           | `clientes`, `citas`, `qr`, `notificaciones`                                    |
| 4   | 5 estados de cita, en kebab (`"en-curso"`)                   | Enum de **8** en snake: `reservada, pendiente_confirmacion, confirmada, retrasada, en_curso, completada, cancelada, no_asistio` | `citas`, `portal`, `dashboard`                                                 |
| 5   | `color: "var(--chart-1)"` en el dato                         | `indiceColor: number`                                                                                                           | `barberos`, `citas`, `nomina`, `dashboard`                                     |
| 6   | Una cita = un servicio                                       | Line items: N servicios por cita, con precio y duración congelados por línea                                                    | `citas`, `portal`                                                              |
| 7   | Todo cuelga de "la barbería"                                 | Todo cuelga de una **sede** (timezone, moneda operativa, horarios, QR)                                                          | Transversal: falta el concepto entero                                          |
| 8   | `barbero.rol: "Barbero Senior"`                              | `titulo` (vitrina) ≠ rol de autorización (`membresias.rol`)                                                                     | `barberos`, `equipo`                                                           |

Ninguno es difícil por separado. Juntos son el trabajo de la Fase 0, y hacerlos **antes** de conectar el primer endpoint evita corregir diez features dos veces.

---

## Feature por feature

| Feature            | Veredicto          | Qué se conserva                                                                                                                                                   | Qué se rehace                                                                                                                                                                              |
| ------------------ | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **auth**           | ✅ Ya es real      | Todo — es el patrón para los demás                                                                                                                                | Nada                                                                                                                                                                                       |
| **portal**         | 🟢 El mejor insumo | El flujo completo `servicio → barbero → agenda → datos → codigo → listo`, y `DiaAgenda`/`FranjaAgenda`, que son **la salida literal del motor de disponibilidad** | `id: 0` = "cualquier barbero" pasa a `barberoId: null`; `aceptaPromos` deja de ser un check de UI y pasa a ser un **consentimiento** con origen y versión de política                      |
| **barberos**       | 🟢 Alto valor      | Tarjeta, sparkline semanal, formulario, filtros                                                                                                                   | `horario: string` plano → jornadas reales; `servicios: string[]` → oferta con precio y duración; `estado: "vacaciones"` → derivado de ausencia vigente; añadir sede base y comisión en bps |
| **clientes**       | 🟢 Alto valor      | Lista, filtro por etiqueta, ficha, historial                                                                                                                      | `gastadoTotal` → centavos + moneda; `ultimaVisita` → ISO; `etiqueta` deja de ser un enum de 4 y pasa a ser el segmento mostrable que la api resuelve                                       |
| **nomina**         | 🟢 Alto valor      | Tabla por barbero, chart de producción diaria, selector de período                                                                                                | Solo unidades y moneda. **El mock encaja mejor con el modelo actual que la documentación vieja**: no hay períodos con estado abierto/cerrado, un período es un filtro de fechas            |
| **citas**          | 🟡 Parcial         | Grilla semanal, vistas semana/día/lista, código de color por barbero                                                                                              | `dia`/`horaInicio` como índices de grilla → instantes UTC + timezone de la sede; cubrir los 8 estados; soportar cita multi-servicio                                                        |
| **configuracion**  | 🟡 Parcial         | Secciones, formularios, Apariencia (ya real vía marca)                                                                                                            | **Horarios están a nivel barbería y van por sede**; servicios sin moneda, sin buffer, sin ámbito; falta la sección de plan/suscripción por completo                                        |
| **dashboard**      | 🟡 Estructura sí   | Composición de KPIs y charts — correcto que el título y el ícono los ponga el front                                                                               | Todas las series; separar "hoy" (transaccional) de "tendencia" (agregado nocturno)                                                                                                         |
| **estadisticas**   | 🟡 Estructura sí   | Charts                                                                                                                                                            | Todas las series; `meta` sale de `metas_ingresos`, no de una constante                                                                                                                     |
| **qr**             | 🟢 Sirve           | Enlace, stats, feed de escaneos                                                                                                                                   | `url` sale de `sedes.slug_qr` (por **sede**, no por barbería); el feed es derivado                                                                                                         |
| **notificaciones** | 🟢 Sirve           | Bandeja, marcar leída / todas                                                                                                                                     | `hace` → `creadoEn` ISO                                                                                                                                                                    |

---

## Tres puertas, un panel: el slug no reestructura nada ✅ HECHO

Cada barbería tiene su propia entrada, y el cliente final puede tener sesión. Suena a mover todo bajo `/b/[slug]/`. **No hace falta, y no se va a hacer.**

El slug vive **solo en la puerta**. Una vez dentro, la cookie ya sabe de qué barbería es la sesión:

```
/b/el-corte/entrar     → login con la marca de El Corte   ┐
/b/cuts-co/entrar      → login con la marca de Cuts & Co  ├─ cookie
/entrar                → puerta global (rescate + staff)  ┘
                                    ↓
/dashboard  ·  /dashboard/citas  ·  /dashboard/barberos   ← MISMO código de hoy
```

**Cero archivos movidos, cero routing tocado.** `app/dashboard/*` y `routes/rutasDashboard.ts` se quedan exactamente donde están. Lo que se añade son dos rutas nuevas y nada más.

| Superficie           | Ruta                                               | Quién entra                                   |
| -------------------- | -------------------------------------------------- | --------------------------------------------- |
| Panel de barbería    | `/b/[slug]/entrar` → `/dashboard`                  | Staff: propietario, admin, recepción, barbero |
| Rescate + plataforma | `/entrar` → `/dashboard` o `/admin`                | Quien no se sabe el slug · staff de Barion    |
| Cliente              | `/b/[slug]/entrar-cliente` → `/b/[slug]/mis-citas` | Cliente final, por OTP                        |

### La puerta global tiene un paso más

`/entrar` sin slug puede devolver **varias barberías** (la misma persona trabajando en dos). La api responde `200` con `{ requiereSeleccion: true, barberias: [...] }` — no es un error, es un paso. El front pinta un selector y reenvía con el slug elegido.

Es el único caso donde el login no es de un solo golpe, y solo le pasa a quien tiene más de un empleo.

### El cliente no tiene contraseña

Nunca. Su login **es** el OTP que ya hace para reservar:

- **Reserva**: teléfono/correo + nombre → código de 6 dígitos → al verificar recibe la cookie. Queda registrado sin un formulario de registro.
- **Vuelve**: un campo + código. Sesión de 30 días, así que en la práctica se le pide poco.

Consecuencia para este repo: **no se construyen** pantallas de registro, contraseña, recuperar contraseña ni verificar correo del cliente. El paso `codigo` del flujo de reserva que el mock ya tiene **es** toda la autenticación.

**Invitado = solo mira.** Ficha, servicios, barberos, horarios y disponibilidad se ven sin identificarse. El botón de reservar lleva al OTP. Eso es un cambio de una pantalla en `features/portal`, no del flujo.

### Gating por tipo de actor

`sesion.tipo` (`staff | cliente | plataforma`) decide qué app se pinta; `sesion.permisos` decide qué acciones se ven dentro del panel. El cliente llega con `permisos: []` a propósito: lo que lo habilita es su tipo, no un permiso.

`AuthProvider` ya distingue la sesión de plataforma por `barberia: null`; ahora lo hace por el claim explícito, que no se equivoca cuando el cliente **sí** tiene barbería y **no** tiene membresía.

---

### Lo que el mock **no** tiene y hay que construir de cero

1. ~~**Panel de staff de plataforma.**~~ ✅ Hecho: `/admin`, dentro de la misma aplicación. Es un área nueva (`/admin`), con su propio layout y su propia fuente de rutas: esa sesión llega con `barberia: null` y `esStaffPlataforma: true`, y `AuthProvider` ya distingue el caso.
2. **Concepto de sede.** No aparece en ninguna parte del front. Es transversal: selector en el `Navbar`, `sedeId` en filtros de listados, y la timezone de la sede como parámetro de todo formateo de fecha (`shared/utils/datetime.ts` ya la recibe por parámetro — la pieza está, falta quién se la pase).
3. **Vistas propias del barbero.** El dashboard actual es del admin. El barbero necesita su agenda del día, su jornada editable y su "cuánto llevo ganado" — con permisos `*_propia`.
4. **Permisos por persona.** 🟡 La pestaña existe en `/dashboard/equipo`. **No hay creación de roles y no la habrá**: los define Barion y son iguales en todas las barberías, así que la pestaña Roles es de consulta (qué trae cada uno) y toda la edición vive en el modal de permisos de cada miembro — dar o quitar capacidades sin cambiarle el rol a nadie. Falta cablearla contra la api real.
5. **Plan y suscripción.** Estado, uso vs límites, y el modo `solo_lectura` (trial vencido: se consulta la agenda, no se escribe) — que la UI tiene que saber pintar.
6. **Gating por permiso.** 🟡 El MENÚ ya se construye con `sesion.permisos`, y `/dashboard/sedes` es la primera pantalla que además lo aplica **por acción** (`sedes.ver` consulta, `sedes.gestionar` edita). Falta hacer lo mismo en el resto.

---

## Fases

Cada fase espera a que su contraparte de la api esté publicada en `docs/frontend/api-barion/`. **El contrato va primero en la api, siempre.**

### Fase 0 — Normalización (no depende de la api) 🟡

Hecho ✅ — las dos puertas (`/b/[slug]/entrar` con la marca del tenant y la
global con selector), el tipo de sesión en los tipos espejo, el `slug` hacia el
acceso con Google, y las lecturas de capacidad y de tipo de actor
(`features/auth/utils/permisos.ts`). Estas últimas están **escritas pero sin
cablear**: se conectan cuando cada pantalla aplique su gating.

Pendiente ⬜ — todo lo demás de esta lista, que es el grueso.

Se puede hacer entera contra el mock, y conviene: deja los servicios listos para que integrar sea cambiar el cuerpo del método.

- Los ocho supuestos de arriba, feature por feature.
- `shared/utils/color.ts`: helper `tokenDeColor(indice: number)` — el índice de la api al token `--chart-N`.
- `shared/types/api.types.ts`: dinero como `{ centavos: string, moneda: string }`; nunca `number` (en COP se desborda).
- `store/sede.store.ts` + selector de sede en el `Navbar`; `useFormato()` toma la timezone de la sede activa.
- `features/citas/utils/`: mapa de los 8 estados → `StatusBadge` (tono + ícono). El estado **nunca** se distingue solo por color.
- Gating: helper `puede(permiso)` sobre `sesion.permisos`, y `sesion.tipo` para decidir qué app se pinta.
- **Las puertas**: `app/b/[slug]/entrar/page.tsx` (marca del tenant, reusa el `Login` que ya es real) y `app/entrar/page.tsx` (global, con el selector de barbería para el caso `requiereSeleccion`). `app/page.tsx` decide a dónde mandar según haya sesión o no. `app/dashboard/*` **no se toca**.

### Fase 1 — Panel de plataforma (`/admin`) ✅

Hecho: área `/admin` dentro de la misma aplicación —misma puerta, misma barra
lateral, otra navegación resuelta por la dirección— con inventario, alta y
cambio de estado, y la pantalla de entrega que da al cliente sus enlaces listos
para copiar.

Hecho también, y no estaba en esta lista: **el menú se construye con las
capacidades de la sesión**, tanto en la barra lateral como contra la dirección
escrita a mano.

Pendiente: la ficha individual de barbería y el formulario de registro abierto
(`/registro`), cuya api ya existe.

Área nueva. `routes/rutasAdmin.ts` como fuente única, layout propio reusando `LayoutDashboard`.

`features/plataforma/`: listado de barberías, ficha, alta (el formulario más importante del sistema: crea barbería + sede inicial + propietario), cambio de estado, planes y suscripciones.

### Fase 2 — Admin de barbería: estructura 🟡

- ✅ `features/sedes/` (nueva, **contra la api real**): listado, alta y edición, activar/desactivar, el
  horario comercial de la semana y los cierres. Ruta `/dashboard/sedes`, con su entrada en el menú
  bajo `sedes.ver`.
  - El horario se envía **entero**: es lo único que permite quitar un tramo, así que el formulario
    mantiene los siete días en estado y un día sin tramos es un día cerrado.
  - Los días se ordenan según el `inicioSemana` de la sede — verlos empezando en domingo desorienta a
    quien configura su semana en Bogotá.
  - Primera pantalla con **gating por acción cableado**: con `sedes.ver` se consulta, con
    `sedes.gestionar` se edita. Ocultar el botón no es seguridad; evita ofrecer lo que va a dar 403.
- ✅ `features/configuracion/`: la sección **Horarios desaparece** — el horario es de la SEDE, no de
  la barbería, y una cadena que abre en dos ciudades no cabe en un único formulario.
- ✅ `features/roles/`: roles en **solo lectura** (`RolesList` + `RolesDetail`) y la matriz de
  excepciones por persona (`RolesExcepcionesForm`), que es lo único que escribe. Sin formulario de
  rol: no hay endpoint para crearlos.
- ✅ `features/equipo/`: ya es real contra `/equipo` — invitar, cambiar de rol, revocar acceso y el
  reparto de permisos por persona. Queda ⬜ el gating por acción (`equipo.gestionar`,
  `roles.gestionar`), que hoy solo tiene el menú.
- ⬜ La separación con **barberos** sigue pendiente, pero está del lado de `features/barberos/`, que
  aún es mock: equipo es **quién entra**, barberos es **quién atiende** y puede no tener cuenta.
- ⬜ `features/configuracion/`: General todavía escribe contra el mock; le falta pasar a la ficha
  pública real (`PATCH /barberias/mi/ficha`: eslogan, descripción, ventajas).
- ⛔ La sección **Plan** no se puede hacer todavía: los endpoints de planes y suscripciones siguen
  pendientes en la api (fase 1).

### Fase 3 — Barberos ⬜

`features/barberos/` real: perfil operativo, jornada semanal editable, excepciones, ausencias, oferta de servicios, comisión.

### Fase 4 — Catálogo ⬜

Servicios de la barbería (con moneda y buffer, que hoy faltan) y oferta por barbero — que es **lo que se reserva de verdad**.

### Fase 5 — Clientes ⬜

`features/clientes/` real: listado con etiqueta resuelta por la api, ficha, historial, consentimientos, anonimizar (irreversible: confirmación explícita).

### Fase 6 — Agenda ⬜

La fase más grande del front. `features/citas/` sobre instantes UTC y timezone de sede, cita multi-servicio, los 8 estados, y disponibilidad real al crear.

Aquí entra también la **vista del barbero**: su agenda del día y sus transiciones (`agenda.gestionar_propia`).

### Fase 7 — Portal público y área del cliente ⬜

`app/b/[slug]` sobre la api real: ficha, disponibilidad del motor, reserva, seguimiento por código. SSR sin login — es la superficie de conversión y tiene que ser rápida en gama baja.

Dos añadidos sobre lo que el mock ya tiene:

- **`/b/[slug]/entrar-cliente`** — un campo + OTP. Reusa el paso `codigo` que el flujo de reserva ya implementa; no es una pantalla nueva, es la misma extraída a su ruta.
- **`/b/[slug]/mis-citas` deja de pedir teléfono en un formulario** y pasa a leer la sesión: citas, puntos de fidelidad, premios y promociones vigentes. `features/portal` crece con esas vistas; `features/fidelidad` puede esperar a que haya programa configurado.

El botón "Reservar" del invitado lleva al OTP en vez de al formulario de datos. Un cambio de destino, no de flujo.

### Fase 8 — Nómina ⬜

`features/nomina/` sobre `ganancias_barbero`, y la vista propia del barbero ("cuánto llevo esta semana").

### Fase 9 — Dashboard y estadísticas ⬜

Series reales. Depende del job nocturno del worker: sin agregados no hay tendencia, solo el día de hoy.

### Fase 10 — Notificaciones ⬜

Bandeja in-app real. Push (VAPID) queda para después: en iOS solo funciona con la PWA en pantalla de inicio.

---

## Reglas que no cambian al integrar

- El **service** sigue siendo la única frontera: `schema.parse(payload)` antes de enviar, `omitEmpty` en queries, `ApiResult<T>` de vuelta.
- El **hook** sigue sin `useEffect`, sin `useRef` y sin UI state. La página es el padre.
- La sesión sigue viviendo en la cookie httpOnly y `GET /auth/me` sigue siendo su única fuente. El store no persiste.
- Los tipos de este repo son **espejo** del contrato, mantenidos a mano contra el Swagger de la api. No se comparte código entre repos.
- Cargando datos = `DataSkeleton`/`Loadable`, nunca spinner ni texto. Errores de validación inline, nunca toast.
- `paginar=false` para catálogos y selects; nunca `limit=100` como sustituto.

## Antes de dar por cerrada una fase

`./node_modules/.bin/tsc --noEmit` y `pnpm format`. (`pnpm lint` falla hoy: eslint no está en devDependencies.) Las pruebas de ejecución las hace el desarrollador.
