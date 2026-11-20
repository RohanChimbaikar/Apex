import type { ReactNode } from "react"

interface StatsProps {
  children: ReactNode
}

export default function Stats({ children }: StatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  )
}
