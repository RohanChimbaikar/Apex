import { createColumnHelper } from "@tanstack/react-table"

import { type DataTableFeatures } from "./data-table-features"
import type { PriorityEnum, Task } from "@/types/api"
import { formatDate } from "@/lib/utils"

import {
  CalendarArrowUpIcon,
  CalendarDays,
  UserRoundGroupIcon,
  ArrowUpDown,
  ArrowDownUp,
  Filter,
} from "lucide-react"

import TaskStatusBadge from "@/components/TaskStatusBadge"
import PriorityIndicator from "@/components/PriorityIndicator"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { isDueToday, isOverdue, isUpcoming } from "@/lib/date.utils"
import { Link } from "react-router"

export type TaskType = Task

const priorityOrder: Record<PriorityEnum, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
}

const statusOptions = [
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
]

const columnHelper = createColumnHelper<DataTableFeatures, TaskType>()

// Consistent compact sortable header
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SortableHeader = ({ column, title }: { column: any; title: string }) => (
  <Button
    variant="ghost"
    size="sm"

    className="-ml-3 h-7 gap-1 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  >
    {title}
    <ArrowUpDown className="size-3.5 shrink-0" />
  </Button>
)

export const columns = columnHelper.columns([
  // Row selection
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }),

  // Task name
  columnHelper.accessor("name", {
    header: "Task",

    enableGlobalFilter: true,
    cell: ({ row }) => (
      <Button
        nativeButton={false}
        variant="link"
        render={<Link to={`/tasks/${row.original.id}`} />}
        size="sm"
        className="h-auto p-0 text-left text-xs font-medium whitespace-normal text-foreground"
      >
        {row.original.name}
      </Button>
    ),
  }),

  // Priority
  columnHelper.accessor("priority", {
    header: ({ column }) => <SortableHeader column={column} title="Priority" />,

    sortFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue<PriorityEnum>(columnId)
      const b = rowB.getValue<PriorityEnum>(columnId)

      return (priorityOrder[a!] ?? 0) - (priorityOrder[b!] ?? 0)
    },

    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        <PriorityIndicator priority={row.original.priority} />
      </div>
    ),
  }),

  // Assigned to
  columnHelper.accessor("assigned_to_name", {
    header: "Assigned To",
    enableGlobalFilter: true,
    cell: ({ row }) => {
      const name = row.original.assigned_to_name

      return name ? (
        <span className="text-xs font-medium whitespace-nowrap">{name}</span>
      ) : (
        <span className="text-xs text-muted-foreground">Unassigned</span>
      )
    },
  }),

  // Status
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span>Status</span>

        <button
          type="button"
          onClick={() => column.toggleSorting()}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowDownUp className="size-3.5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              />
            }
          >
            <Filter className="size-3.5" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs">
                Filter status
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {statusOptions.map((status) => {
                const selected =
                  (column.getFilterValue() as string[] | undefined) ?? []

                return (
                  <DropdownMenuCheckboxItem
                    key={status.value}
                    checked={selected.includes(status.value)}
                    onCheckedChange={(checked) => {
                      const next = checked
                        ? [...selected, status.value]
                        : selected.filter((value) => value !== status.value)

                      column.setFilterValue(next.length ? next : undefined)
                    }}
                    className="text-xs"
                  >
                    {status.label}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),

    cell: ({ row }) => <TaskStatusBadge status={row.original.status} />,

    enableSorting: true,
    enableColumnFilter: true,

    filterFn: (row, columnId, filterValue: string[]) => {
      return filterValue.includes(row.getValue(columnId))
    },
  }),

  // Team
  columnHelper.accessor("team_name", {
    header: "Team",
    enableGlobalFilter: true,
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <UserRoundGroupIcon
          size={13}
          className="shrink-0 text-muted-foreground"
        />
        <span className="text-xs">{row.original.team_name}</span>
      </div>
    ),
  }),

  // Due date
  columnHelper.accessor("due_date", {
    header: ({ column }) => <SortableHeader column={column} title="Due Date" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <CalendarArrowUpIcon
          size={13}
          className="shrink-0 text-muted-foreground"
        />
        <span className="text-xs">{formatDate(row.original.due_date)}</span>
      </div>
    ),
    filterFn: (row, columnId, filterValue: string) => {
      const dueDate = row.getValue<string>(columnId)

      switch (filterValue) {
        case "overdue":
          return isOverdue(dueDate)

        case "due-today":
          return isDueToday(dueDate)

        case "upcoming":
          return isUpcoming(dueDate)

        default:
          return true
      }
    },
  }),

  // Date created
  columnHelper.accessor("created_at", {
    header: ({ column }) => (
      <SortableHeader column={column} title="Date Created" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <CalendarDays size={13} className="shrink-0 text-muted-foreground" />
        <span className="text-xs">{formatDate(row.original.created_at)}</span>
      </div>
    ),
  }),
])
