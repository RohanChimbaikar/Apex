import { Badge } from "@/components/ui/badge"
import type { TaskStatusEnum } from "@/types/api"

const statusStyles: Record<TaskStatusEnum, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800",

  IN_PROGRESS:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",

  COMPLETED:
    "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900",

  CANCELLED:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
}

const statusLabels: Record<TaskStatusEnum, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

interface TaskStatusBadgeProps {
  status?: TaskStatusEnum
}

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  if (!status) {
    return (
      <Badge
        variant="outline"
        className="h-5 rounded-xl px-1.5 text-xs leading-none font-medium"
      >
        Unknown
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className={`${statusStyles[status]} h-5 rounded-xl px-1.5 text-xs leading-none font-medium`}
    >
      {statusLabels[status]}
    </Badge>
  )
}
