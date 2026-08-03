"use client"

import { Search } from "lucide-react"
import { Input } from "@shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select"
import type { Segmento } from "@features/clientes/types/clientes.types"

interface ClientesToolbarProps {
  buscar: string
  segmentoId: string
  /** Las etiquetas que existen hoy, no una lista fija: las define la barbería. */
  segmentos: Segmento[]
  total: number
  onBuscar: (valor: string) => void
  onSegmento: (valor: string) => void
}

const TODOS = "todos"

export function ClientesToolbar({
  buscar,
  segmentoId,
  segmentos,
  total,
  onBuscar,
  onSegmento,
}: ClientesToolbarProps) {
  // Las dinámicas las rehace el job nocturno desde las citas; las estáticas las
  // mantiene alguien a mano. Se distingue porque una etiqueta que nadie sabe de
  // dónde sale se lee como un juicio del sistema sobre el cliente.
  const hayManuales = segmentos.some((segmento) => segmento.tipo === "estatico")

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={buscar}
          onChange={(e) => onBuscar(e.target.value)}
          placeholder="Nombre, teléfono o correo"
          aria-label="Buscar cliente"
          className="pl-9"
        />
      </div>

      {/*
        Sin etiquetas no se pinta el filtro. Pasa en dos casos y en los dos
        sobra: una barbería que todavía no tiene ninguna, y el barbero, que no
        alcanza el catálogo de segmentos —clasificar la clientela entera no es
        suyo— y por eso la página no se lo pide. Un desplegable con una sola
        opción que dice «todas» no filtra nada: es un hueco que se lee como algo
        a medio cargar.

        La insignia de cada cliente NO depende de esto: viaja resuelta en su
        propia fila, así que se sigue viendo.
      */}
      {segmentos.length > 0 && (
        <>
          <Select
            value={segmentoId || TODOS}
            onValueChange={(valor) => onSegmento(!valor || valor === TODOS ? "" : valor)}
          >
            <SelectTrigger aria-label="Etiqueta" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas las etiquetas</SelectItem>
              {segmentos.map((segmento) => (
                <SelectItem key={segmento.id} value={segmento.id}>
                  {segmento.nombre}
                  {segmento.tipo === "estatico" && (
                    <span className="text-xs text-muted-foreground">· a mano</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="px-1 text-xs text-muted-foreground">
            Las etiquetas salen de las citas y se rehacen cada noche.
            {hayManuales && " Las marcadas «a mano» las mantiene el equipo."}
          </p>
        </>
      )}

      <p
        className="px-1 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/80 uppercase"
        aria-live="polite"
      >
        {total} {total === 1 ? "cliente" : "clientes"}
      </p>
    </div>
  )
}
