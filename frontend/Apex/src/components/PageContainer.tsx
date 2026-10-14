import type { PropsWithChildren } from "react"

type PageContainerProps = PropsWithChildren<{
  className?: string
}>

export default function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col gap-6 px-6 py-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  )
}
