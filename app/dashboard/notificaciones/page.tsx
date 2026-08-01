"use client"

import { useEffect, useState } from "react"
import { CheckCheck } from "lucide-react"
import { NotificacionesList } from "@features/notificaciones/components/NotificacionesList"
import { useNotificaciones } from "@features/notificaciones/hooks/useNotificaciones"
import { Button } from "@shared/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"

/**
 * La bandeja.
 *
 * **No hay permiso que la proteja y es deliberado**: es de cada quien, y el
 * filtro por usuario lo impone la api. Tampoco hay forma de crear una: las
 * escribe el worker al consumir el evento del outbox, así que mientras ese
 * consumidor no exista la bandeja está vacía — que no es lo mismo que un error.
 */
export default function NotificacionesPage() {
  const {
    notificaciones,
    noLeidas,
    loadingNotificaciones,
    error,
    fetchNotificaciones,
    handleMarcarLeidaNotificacion,
    handleMarcarTodasLeidasNotificaciones,
  } = useNotificaciones()

  const [vista, setVista] = useState<"todas" | "sinLeer">("todas")

  useEffect(() => {
    void fetchNotificaciones({ soloNoLeidas: vista === "sinLeer", limit: 50 })
  }, [fetchNotificaciones, vista])

  const recargar = () => fetchNotificaciones({ soloNoLeidas: vista === "sinLeer", limit: 50 })

  const alAbrir = async (id: string) => {
    try {
      await handleMarcarLeidaNotificacion(id)
      void recargar()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const alMarcarTodas = async () => {
    try {
      const message = await handleMarcarTodasLeidasNotificaciones()
      notify.success(message)
      void recargar()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  return (
    <main className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={vista} onValueChange={(valor) => setVista(valor as typeof vista)}>
          <TabsList className="group-data-horizontal/tabs:h-9">
            <TabsTrigger value="todas" className="cursor-pointer px-3 text-xs">
              Todas
            </TabsTrigger>
            <TabsTrigger value="sinLeer" className="cursor-pointer px-3 text-xs">
              Sin leer{noLeidas > 0 && ` (${noLeidas})`}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {noLeidas > 0 && (
          <Button
            variant="outline"
            size="lg"
            className="cursor-pointer"
            onClick={() => void alMarcarTodas()}
          >
            <CheckCheck aria-hidden />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <NotificacionesList
        notificaciones={notificaciones}
        loading={loadingNotificaciones}
        onAbrir={alAbrir}
      />
    </main>
  )
}
