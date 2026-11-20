import type { ReactNode } from "react"

interface PageContainerProps {
  title: string
  description?: string
  actions?: ReactNode
  children?: ReactNode
}

export default function PageContainer({
  title,
  description,
  actions,
  children,
}: PageContainerProps) {
  return (
    <div className="min-w-0 flex-1 space-y-4 p-4">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3">
        <div className="min-w-0 space-y-0.5">
          <h1 className="truncate text-lg font-semibold tracking-tight">
            {title}
          </h1>

          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>

      {/* Page content */}
      {children}
    </div>
  )
}
