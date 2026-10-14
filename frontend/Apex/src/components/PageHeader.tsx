import type { ReactNode } from "react"

type PageHeaderProps = {
  title: string
  description: string
  children?: ReactNode
}

export default function PageHeader({
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between gap-4 px-8">
      <div className="min-w-0 flex-1 space-y-2">
        <h1 className="font-heading text-2xl font-bold">{title}</h1>
        <p className="font-sans text-sm font-light">{description}</p>
      </div>

      {children && <div className="flex shrink-0 items-center">{children}</div>}
    </div>
  )
}
