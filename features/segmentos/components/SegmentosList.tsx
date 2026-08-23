"use client"

import { MoreHorizontal, Pencil, RotateCcw, Tags, Trash2 } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/ui/table"
import { Loadable } from "@shared/components/feedback/Loadable"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { useFormato } from "@shared/hooks/useFormato"
import { definicionDe, valorDelCriterio } from "@features/segmentos/constants/criterios"
import { textoCriterio } from "@features/segmentos/utils/textoCriterio"
import { useTextos } from "@shared/textos/useTextos"
import type { Segmento } from "@features/segmentos/types/segmentos.types"

interface SegmentosListProps {
  segmentos: Segmento[]
  loading: boolean
  onEditar: (segmento: Segmento) => void
  onDesactivar: (segmento: Segmento) => void
  onActivar: (segmento: Segmento) => void
}

/**
 * El catálogo de etiquetas, presentacional puro.
 *
 * ── Por qué se pinta la regla y no solo el nombre ───────────────────────────
 * Un nombre no dice a quién selecciona. «Inactivo» puede ser sesenta días o
 * ciento veinte, y la diferencia es a qué mitad de la clientela se le escribe.
 * Quien abre esta pantalla viene justamente a comprobarlo.
 */
export function SegmentosList({
  segmentos,
  loading,
  onEditar,
  onDesactivar,
  onActivar,
}: SegmentosListProps) {
  const t = useTextos("segmentos.lista")
  const tCriterios = useTextos("segmentos.criterios")
  const { dinero, fechaCorta } = useFormato()

  const describirRegla = (segmento: Segmento): string => {
    if (segmento.tipo === "estatico") return t("manual")

    const definicion = definicionDe(String(segmento.criterio?.tipo ?? ""))
    // Una regla que este panel no conoce se dice tal cual en vez de callarse: es
    // la señal de que la api sabe calcular algo que aquí todavía no se pinta.
    if (!definicion) return t("reglaDesconocida", { tipo: String(segmento.criterio?.tipo ?? "?") })

    const texto = textoCriterio(tCriterios, definicion.tipo)
    if (!definicion.parametro) return texto.etiqueta

    const valor = valorDelCriterio(segmento.criterio)
    if (valor === undefined) return texto.etiqueta
    return t("reglaCon", {
      etiqueta: texto.etiqueta,
      valor: definicion.esDinero ? dinero(valor) : String(valor),
    })
  }

  return (
    <Loadable
      loading={loading}
      variant="table"
      isEmpty={segmentos.length === 0}
      emptyState={<SinDatos titulo={t("sinDatos")} detalle={t("sinDatosDetalle")} icono={Tags} />}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("etiqueta")}</TableHead>
              <TableHead>{t("agrupa")}</TableHead>
              <TableHead className="text-right">{t("clientes")}</TableHead>
              <TableHead>{t("ultimaVez")}</TableHead>
              <TableHead>{t("estado")}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {segmentos.map((segmento) => (
              <TableRow key={segmento.id} className={segmento.activo ? "" : "opacity-60"}>
                <TableCell>
                  <span className="font-medium">{segmento.nombre}</span>
                  {segmento.descripcion && (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {segmento.descripcion}
                    </span>
                  )}
                  {!segmento.esEtiqueta && (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {t("noSePinta")}
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  {describirRegla(segmento)}
                </TableCell>

                <TableCell className="text-right tabular-nums">{segmento.miembros}</TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  {/*
                    Sin fecha y sin miembros no es una etiqueta vacía: es una que
                    el job todavía no ha tocado. Decir «0 clientes» a secas la
                    haría parecer rota el primer día.
                  */}
                  {segmento.calculadoEn
                    ? fechaCorta(segmento.calculadoEn)
                    : segmento.tipo === "dinamico"
                      ? t("pendienteDeCalculo")
                      : "—"}
                </TableCell>

                <TableCell>
                  <StatusBadge
                    tono={segmento.activo ? "exito" : "neutro"}
                    etiqueta={segmento.activo ? t("activa") : t("deBaja")}
                  />
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm" aria-label={t("acciones")}>
                          <MoreHorizontal className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditar(segmento)}>
                        <Pencil className="size-4" />
                        {t("editar")}
                      </DropdownMenuItem>
                      {segmento.activo ? (
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDesactivar(segmento)}
                        >
                          <Trash2 className="size-4" />
                          {t("darDeBaja")}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onActivar(segmento)}>
                          <RotateCcw className="size-4" />
                          {t("reactivar")}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Loadable>
  )
}
