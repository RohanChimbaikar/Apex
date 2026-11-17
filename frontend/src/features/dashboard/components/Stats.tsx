import type { ReactNode } from "react"

interface StatsProps {
  children: ReactNode
}

export default function Stats({ children }: StatsProps) {
  return <div className="grid h-24 grid-cols-5 gap-2">{children}</div>
}
