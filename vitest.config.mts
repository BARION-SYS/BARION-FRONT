import { defineConfig } from "vitest/config"

/**
 * Las pruebas de este repo, que hasta ahora eran cero.
 *
 * ── Por qué se empieza por `shared/utils` y por los `utils` de feature ──────
 * Porque es donde un fallo se multiplica por todas las pantallas a la vez. El
 * caso que lo demostró: `currency.ts` usaba «cuántos decimales se ENSEÑAN» como
 * si fuera «en qué unidad se GUARDA», y como el peso colombiano se enseña sin
 * decimales el importe no se dividía nunca — todo el panel leía cien veces más
 * grande, y guardar un plan de $89.000 lo habría escrito como $890. `tsc` no ve
 * nada de eso: los dos son `number`.
 *
 * ── Entorno `node` y no `jsdom` ─────────────────────────────────────────────
 * Lo que se prueba aquí son funciones puras. Montar un DOM para comprobar una
 * división es pagar el arranque de jsdom en cada corrida sin ganar nada; el día
 * que se prueben componentes se añade `@testing-library/react` y se declara el
 * entorno **por archivo**, no para todos.
 *
 * ── `.mts`, y los alias del `tsconfig` ──────────────────────────────────────
 * La extensión es explícita porque este `package.json` no declara módulos ES y
 * el archivo sí los usa. Y los alias se resuelven leyendo `tsconfig.json` en vez
 * de repetirse aquí: dos listas de rutas son dos verdades, y la que se
 * desincroniza es siempre la de pruebas.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**"],
  },
})
