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
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>

          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>

      {children}
    </div>
  )
}
