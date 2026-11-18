"use client"

import { useId } from "react"
import { cn } from "@shared/utils/cn"

/*
 * Logo de Barion: la tijera de barbero que es una B (hoja = asta, anillo del
 * pulgar y anillo de los dedos = los dos lóbulos, espuela abajo) y el nombre en
 * Bodoni Moda convertido a trazos.
 *
 * Cuatro versiones, y cuál usar lo decide el espacio, no la página:
 * - `completo`: tijera + nombre en línea. Menú de escritorio, documentos.
 * - `apilado`: tijera arriba, nombre debajo. Pantallas de acceso, pie, cuadrados.
 * - `icono`: solo la tijera. Menú en el teléfono, barra plegada. Desde 16 px.
 * - `nombre`: solo BARION, cuando la tijera ya está al lado.
 *
 * SVG en línea en `currentColor`: un solo dibujo sirve a los dos temas sin
 * preguntar cuál está activo. El tornillo va en `--marca-acento` (terracota en
 * claro, salvia en oscuro). Sale de `docs/marca/` del repo padre: si el dibujo
 * cambia se regenera este archivo, no se toca el trazado a mano.
 *
 * El tamaño lo da la altura en la clase; el ancho sale de la proporción.
 */
const HOJA = "M19 2.5C20.3 2.5 21.7 6.5 22.1 12.5L23 55.5C23.05 58 21.3 60 19 60C16.7 60 14.95 58 15 55.5L15.9 12.5C16.3 6.5 17.7 2.5 19 2.5Z"
const CORTE = "M19 9V51"
const PALABRA = "M45.5 1500.0V1461.0H706Q787 1461 850.25 1415.5Q913.5 1370.0 949.75 1284.5Q986 1199 986 1080Q986 961 949.75 888.25Q913.5 815.5 850.25 782.5Q787.0 749.5 706.0 749.5H486.0V724H766.5Q922.5 724.0 1049.25 759.75Q1176.0 795.5 1251.0 877.75Q1326 960 1326 1100Q1326.0 1317.5 1178.5 1408.75Q1031 1500 766.5 1500.0ZM226 1482V18H536.5V1482.0ZM486 736V710H686Q757 710 816.25 680.0Q875.5 650.0 911.0 580.0Q946.5 510.0 946.5 391.0Q946.5 272.0 911.0 194.0Q875.5 116.0 816.25 77.5Q757 39 686 39H45.5V0.0H726.5Q975.5 0.0 1121.0 87.5Q1266.5 175.0 1266.5 370.0Q1266.5 557.0 1128.75 646.5Q991 736 726.5 736.0Z M2028.0 1034.5V995.5H2643.0V1034.5ZM2505.0 -29 3021.5 1461.0H3176.0V1500H2487.5V1461.0H2662.5L2293.5 322.0L1894.5 1461.0H2106.5V1500.0H1665.5V1461.0H1849.147100424328L2375.0 -29Z M3827.5 740.0V716.5H4117.0Q4213.0 716.5 4277.75 681.0Q4342.5 645.5 4375.0 570.5Q4407.5 495.5 4407.5 376.5Q4407.5 257.5 4375.0 183.0Q4342.5 108.5 4277.75 73.75Q4213.0 39 4117.0 39H3466.5V0.0H4167.0Q4333.0 0 4459.25 40.0Q4585.5 80.0 4656.5 163.25Q4727.5 246.5 4727.5 376.5Q4727.5 506.5 4660.75 586.5Q4594.0 666.5 4468.5 703.25Q4343.0 740 4167.0 740ZM3466.5 1500.0V1461.0H4177.5V1500.0ZM3667.0 1479V21.5H3977.0V1479ZM4657.0 1515Q4555.0 1515 4496.75 1483.0Q4438.5 1451.0 4411.0 1396.75Q4383.5 1342.5 4375.5 1275.0Q4367.5 1207.5 4366.75 1135.5Q4366.0 1063.5 4360.5 996.0Q4355.0 928.5 4333.0 874.25Q4311.0 820 4260.0 788.0Q4209.0 756 4117.0 756H3827.5V735.0H4277.0Q4415.5 735.0 4496.5 774.25Q4577.5 813.5 4617.5 878.5Q4657.5 943.5 4670.5 1020.75Q4683.5 1098.0 4683.75 1175.25Q4684.0 1252.5 4686.75 1317.5Q4689.5 1382.5 4708.5 1421.75Q4727.5 1461.0 4779.0 1461Q4811.0 1461 4837.0 1454.25Q4863.0 1447.5 4883.5 1437.5L4897.0 1475Q4873.0 1488 4808.5 1501.5Q4744.0 1515 4657.0 1515Z M5177.5 1500.0V1461.0H5398.0V39H5177.5V0.0H5948.0V39H5708.0V1461H5948.0V1500Z M6968.5 1520.0Q6809.0 1520 6683.0 1461.75Q6557.0 1403.5 6468.75 1298.5Q6380.5 1193.5 6334.5 1053.5Q6288.5 913.5 6288.5 750.0Q6288.5 586.5 6337.25 446.5Q6386.0 306.5 6476.0 201.5Q6566.0 96.5 6691.0 38.25Q6816.0 -20 6968.5 -20.0Q7121.0 -20 7245.75 38.25Q7370.5 96.5 7460.75 201.5Q7551.0 306.5 7599.5 446.5Q7648.0 586.5 7648.0 750Q7648.0 913.5 7602.0 1053.5Q7556.0 1193.5 7468.0 1298.5Q7380.0 1403.5 7254.0 1461.75Q7128.0 1520 6968.5 1520.0ZM6968.5 1483.5Q7073.0 1483.5 7137.75 1427.75Q7202.5 1372.0 7237.75 1272.0Q7273.0 1172 7285.75 1038.5Q7298.5 905.0 7298.5 750.0Q7298.5 595.0 7282.75 461.5Q7267.0 328 7230.25 228.0Q7193.5 128.0 7129.5 72.25Q7065.5 16.5 6968.5 16.5Q6872.0 16.5 6807.75 72.25Q6743.5 128.0 6706.5 228.0Q6669.5 328.0 6653.75 461.5Q6638.0 595 6638.0 750Q6638.0 905 6651.0 1038.5Q6664.0 1172 6699.0 1272.0Q6734.0 1372 6799.25 1427.75Q6864.5 1483.5 6968.5 1483.5Z M8233.5 0.0V1461.0H8465.0V1500H7987.5V1461.0H8192.5V39.0H7987.5V0.0ZM9462.0 0V39H9251.5V1520.0H9197.0L8205.0 0H8574.5L9211.0 988.5V39H8985.5V0.0Z"

const CAJAS = {
  completo: "0 0 247.13 64",
  apilado: "0 0 114.09 92.0",
  icono: "0 0 64 64",
  nombre: "0 0 171.13 27.0",
} as const

interface LogoBarionProps {
  variante?: keyof typeof CAJAS
  className?: string
}

function Tijera({ mascara, x = 0 }: { mascara: string; x?: number }) {
  return (
    <g transform={x ? `translate(${x} 0)` : undefined}>
      {/* El filo entre las dos hojas es un hueco de verdad (máscara), no una
          raya del color del fondo: se ve igual sobre cualquier superficie */}
      <mask id={mascara} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
        <rect width="64" height="64" fill="#fff" />
        <path d={CORTE} stroke="#000" strokeWidth="1.1" strokeLinecap="round" />
      </mask>
      <path d={HOJA} fill="currentColor" mask={`url(#${mascara})`} />
      <path d="M22.4 20.2 26.6 19.4M22.8 42.6 25.4 42.8" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" />
      <circle cx={34.4} cy={18.4} r={8.4} fill="none" stroke="currentColor" strokeWidth="4.4" />
      <ellipse cx={37} cy={43.2} rx={11.4} ry={10.2} fill="none" stroke="currentColor" strokeWidth="4.4" />
      <path d="M30.6 53.2C29.2 56.9 26.9 59.3 24.4 60.1" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx={19} cy={31} r={2.5} fill="var(--marca-acento)" />
    </g>
  )
}

// Única fuente del logo en la UI.
export function LogoBarion({ variante = "completo", className }: LogoBarionProps) {
  const mascara = `filo-${useId().replace(/:/g, "")}`

  return (
    <svg
      viewBox={CAJAS[variante]}
      role="img"
      aria-label="Barion"
      className={cn("h-8 w-auto shrink-0 text-foreground", className)}
    >
      {variante === "completo" && (
        <>
          <Tijera mascara={mascara} />
          <path transform="translate(76 18.5) scale(0.018)" d={PALABRA} fill="currentColor" />
        </>
      )}
      {variante === "apilado" && (
        <>
          <Tijera mascara={mascara} x={25.04} />
          <path transform="translate(0.0 74) scale(0.012)" d={PALABRA} fill="currentColor" />
        </>
      )}
      {variante === "icono" && <Tijera mascara={mascara} />}
      {variante === "nombre" && <path transform="scale(0.018)" d={PALABRA} fill="currentColor" />}
    </svg>
  )
}
