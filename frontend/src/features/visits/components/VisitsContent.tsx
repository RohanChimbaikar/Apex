import type { Visit, VisitStats } from "@/types/api/types.gen"

import {
  ClipboardCheck,
  ClockIcon,
  BanIcon,
  CalendarArrowUp,
} from "lucide-react"
import StatCard from "@/features/dashboard/components/StatCard"
import Stats from "@/features/dashboard/components/Stats"

interface ContentProps {
  visitStats: VisitStats
  visitsData?: Visit[]
}

export default function VisitsContent({ visitStats }: ContentProps) {
  const stats = [
    {
      title: "Total Tasks",
      value: visitStats.total_visits,
      icon: ClipboardCheck,
      iconBg: "bg-blue-100 dark:bg-blue-950",
      iconColor: "text-blue-700 dark:text-blue-300",
      trend: {
        value: "+20%",
        label: "from last month",
        isPositive: true,
      },
    },
    {
      title: "Pending Visits",
      value: visitStats.pending_visits,
      icon: ClockIcon,
      iconBg: "bg-amber-100 dark:bg-amber-950",
      iconColor: "text-yellow-700 dark:text-yellow-300",
      trend: {
        value: "+20%",
        label: "from last month",
        isPositive: true,
      },
    },
    {
      title: "Visits In-Progress",
      value: visitStats.in_progress_visits,
      icon: CalendarArrowUp,
      iconBg: "bg-red-100 dark:bg-red-950",
      iconColor: "text-red-700 dark:text-red-300",
      trend: {
        value: "+20%",
        label: "from last month",
        isPositive: true,
      },
    },
    {
      title: "Cancelled Visits",
      value: visitStats.cancelled_visits,
      icon: BanIcon,
      iconBg: "bg-purple-100 dark:bg-purple-950",
      iconColor: "text-purple-700 dark:text-purple-300",
      trend: {
        value: "+20%",
        label: "from last month",
        isPositive: true,
      },
    },
  ]

  return (
    <div>
      <Stats>
        {stats.map((stat) => {
          return (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconBg={stat.iconBg}
              iconColor={stat.iconColor}
              trend={stat.trend}
            />
          )
        })}
      </Stats>
      {/* <div className="container mx-auto py-10">
        <DataTable columns={columns} data={tasksData} />
      </div> */}
    </div>
  )
}
