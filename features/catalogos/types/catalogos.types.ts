// Tipos ESPEJO del contrato de la API (`/catalogos`).

export interface OpcionCatalogo {
  codigo: string
  etiqueta: string
}

export interface Catalogos {
  estadosCita: OpcionCatalogo[]
  tiposAusencia: OpcionCatalogo[]
  canalesNotificacion: OpcionCatalogo[]
}
