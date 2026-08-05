import next from "eslint-config-next"
import tseslint from "typescript-eslint"
import prettier from "eslint-config-prettier/flat"

/**
 * Flat config. El orden importa: lo último gana.
 *
 * `prettier` va al final y apaga todo lo que sea formato — la única fuente de
 * formato es `.prettierrc`, y dos herramientas discutiendo comillas es ruido en
 * cada archivo que se toca.
 */
const config = [
  {
    ignores: [".next/**", "node_modules/**", "public/**", "next-env.d.ts", "tsconfig.tsbuildinfo"],
  },

  ...next,
  ...tseslint.configs.recommended,

  {
    rules: {
      // `any` está prohibido por convención del repo: lo que no se sabe es
      // `unknown` y se estrecha antes de usarlo.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Rutas relativas y barriles, prohibidos: se importa con el alias más
      // específico (`@features/*`, `@shared/*`…) y desde el archivo real.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["./*", "../*"],
              message: "Importar con alias (@features, @shared, @lib…), nunca con ruta relativa.",
            },
            {
              group: ["@features/*/index", "@shared/*/index", "@lib/*/index"],
              message: "Los barriles (index.ts) están prohibidos: importar del archivo real.",
            },
          ],
        },
      ],
    },
  },

  prettier,
]

export default config
