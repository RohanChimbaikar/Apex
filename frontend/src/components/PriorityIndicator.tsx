import type { PriorityEnum } from "@/types/api"

const priorityDotStyles: Record<PriorityEnum, string> = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-emerald-500",
}

const priorityTextStyles: Record<PriorityEnum, string> = {
  HIGH: "text-rose-500",
  MEDIUM: "text-yellow-500",
  LOW: "text-green-500",
}

const priorityLabels: Record<PriorityEnum, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
}

export default function PriorityIndicator({
  priority,
}: {
  priority?: PriorityEnum
}) {
  if (!priority) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`size-2 rounded-full ${priorityDotStyles[priority]}`} />
      <span className={`text-xs ${priorityTextStyles[priority]}`}>
        {priorityLabels[priority]}
      </span>
    </div>
  )
}
