import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconBg?: string
  iconColor?: string
  trend?: {
    value: string
    label: string
    isPositive: boolean
  }
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBg = "bg-muted",
  iconColor = "text-muted-foreground",
  trend,
}: StatCardProps) {
  // const TrendIcon = trend?.isPositive ? ArrowUpRight : ArrowDownRight

  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-lg border bg-card p-3 text-card-foreground">
      {/* Header */}
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-muted-foreground">
          {title}
        </span>

        <div
          className={`flex size-7 shrink-0 items-center justify-center rounded-md ${iconBg} ${iconColor}`}
        >
          <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
        </div>
      </div>

      {/* Value */}
      <div className="text-xl leading-tight font-semibold tracking-tight break-words tabular-nums">
        {value}
      </div>

      {/* Trend */}
      {/* {trend && (
        <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5 text-xs">
          <span
            className={`inline-flex shrink-0 items-center gap-0.5 font-medium ${
              trend.isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            <TrendIcon size={13} aria-hidden="true" />
            {trend.value}
          </span>

          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )} */}
    </div>
  )
}
