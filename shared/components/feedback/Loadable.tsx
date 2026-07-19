import { DataSkeleton, type DataSkeletonVariant } from "@shared/components/feedback/DataSkeleton"

interface LoadableProps {
  loading: boolean
  /** Variante del skeleton mientras carga */
  variant?: DataSkeletonVariant
  count?: number
  /** Si true (y no está cargando) muestra el estado vacío */
  isEmpty?: boolean
  emptyState?: React.ReactNode
  className?: string
  children: React.ReactNode
}

// Compuerta de carga: loading → DataSkeleton, isEmpty → empty, si no → children.
export function Loadable({
  loading,
  variant = "text",
  count,
  isEmpty,
  emptyState,
  className,
  children,
}: LoadableProps) {
  if (loading) return <DataSkeleton variant={variant} count={count} className={className} />
  if (isEmpty)
    return (
      <>
        {emptyState ?? (
          <p className="py-8 text-center text-sm text-muted-foreground">Sin datos todavía</p>
        )}
      </>
    )
  return <>{children}</>
}
