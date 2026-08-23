# Los mensajes del panel

Un archivo por idioma, en JSON y en formato **ICU**.

## Por qué JSON y no TypeScript

Porque un mensaje es contenido, no código. En JSON lo puede abrir una agencia de
traducción o un TMS (Crowdin, Lokalise, Phrase) sin tocar el repositorio; en un
`.ts` con funciones y comentarios, no. Es el mismo formato que usa
`BARION-WEB`, así que quien sepa uno sabe el otro.

Perder el chequeo de claves no es el precio: lo repone `completitud.ts` con una
línea, y los argumentos de cada mensaje los infiere `createTranslator` del propio
JSON.

## Los tres archivos, y por qué uno es corto

| Archivo      | Qué es                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------- |
| `es-CO.json` | **El BASE.** Aquí se escribe primero y de aquí sale el tipo                              |
| `en-US.json` | Completo. Se declara con el tipo del base, así que **una clave sin traducir no compila** |
| `es-ES.json` | **Solo las DIFERENCIAS** sobre `es-CO`, fusionadas en `fusionar.ts`                      |

España no es otro idioma: es el mismo con un puñado de palabras distintas
—«celular» y «móvil», «carro» y «coche»—. Copiarlo entero para cambiar seis
frases sería garantizar que las otras trescientas se separen: la que se corrige
en un archivo no se corrige en el otro, y el que se queda viejo es siempre el que
menos se abre.

## Frases con datos adentro: ICU, no concatenación

```json
"sedeActiva": "Sede activa: {nombre}"
"total": "{cuantas, plural, one {cita total} other {citas totales}}"
```

El orden de las palabras cambia entre idiomas, así que una frase partida en
trozos no se puede recolocar. Y los plurales los resuelve ICU y no un `if`: el
español y el inglés tienen dos formas, pero el polaco tiene tres y el árabe seis
— escribirlo a mano funciona hasta el día que deja de funcionar.

## Lo que NO va aquí

Nada que salga de la api: nombres de servicios, de sedes o de personas son datos
de la barbería y se enseñan tal cual llegan. Traducir un dato es inventárselo.
Tampoco los mensajes de error de la api, que llegan ya redactados.
