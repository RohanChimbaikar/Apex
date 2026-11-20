import type { Task, TaskStats } from "@/types/api/types.gen"
import { columns } from "./table/columns"
import { DataTable } from "./table/data-table"

import {
  ClipboardCheck,
  ClockIcon,
  BanIcon,
  CalendarArrowUp,
} from "lucide-react"
import StatCard from "@/features/dashboard/components/StatCard"
import Stats from "@/features/dashboard/components/Stats"

interface ContentProps {
  taskStats: TaskStats
  tasksData: Task[]
}

export default function Content({ taskStats, tasksData }: ContentProps) {
  const stats = [
    {
      title: "Total Tasks",
      value: taskStats.total_tasks,
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
      title: "Pending Tasks",
      value: taskStats.pending_tasks,
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
      title: "OverDue Tasks",
      value: taskStats.overdue_tasks,
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
      title: "Cancelled Tasks",
      value: taskStats.cancelled_tasks,
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
      <div className="mx-auto w-full min-w-0  py-6">
        <DataTable columns={columns} data={tasksData} />
      </div>
    </div>
  )
}
