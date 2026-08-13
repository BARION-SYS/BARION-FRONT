import { esCO, type Diccionario } from "@shared/textos/diccionarios/es-CO"
import { fusionar } from "@shared/textos/fusionar"

/**
 * España: el colombiano con lo que allí se dice de otra forma.
 *
 * **Es una lista de diferencias, no una copia** (ver `fusionar.ts`): lo que no
 * aparezca aquí sale del base, así que corregir una frase la corrige en los dos
 * mercados. Lo contrario —dos archivos completos— es como se separan.
 *
 * Hoy la lista es corta a propósito. Las palabras que de verdad cambian entre
 * los dos —«celular» y «móvil» la primera— viven en pantallas que todavía no se
 * han traducido; irán entrando aquí a medida que cada una pase por el
 * diccionario. Que hoy esté casi vacío no significa que sobre: significa que el
 * sitio donde escribirlas ya existe y nadie tendrá que inventárselo con prisa.
 */
export const esES: Diccionario = fusionar(esCO, {
  navegacion: {
    rutas: {
      // En España la «sede» de una cadena se lee antes como local que como sede
      // social, y es lo que se ve en el sidebar todo el día.
      sedes: {
        etiqueta: "Locales",
        titulo: "Locales",
        subtitulo: "Dónde opera la barbería, con su horario y sus cierres",
      },
    },
  },
  navbar: {
    sedeActiva: (nombre: string) => `Local activo: ${nombre}`,
  },
})
