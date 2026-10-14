import { createColumnHelper } from "@tanstack/react-table"

//Components
import { type DataTableFeatures } from "./data-table-features"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"

//Icons
import {
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  Equal,
  ArrowDown,
  Clock,
  LoaderCircle,
  CheckCircle2,
  CircleDashed,
  PauseCircle,
  XCircle,
} from "lucide-react"

//Types and Utils
import type { Task } from "../types"
import { formatDate } from "@/lib/utils/date-utils"
import { formatName } from "@/lib/utils/helpers"
type TaskTableHeaders = Pick<
  Task,
  | "id"
  | "name"
  | "status"
  | "priority"
  | "deadline"
  | "team_name"
  | "assigned_to_name"
>

const priorityConfig = {
  HIGH: {
    label: "High",
    icon: ArrowUp,
    className: "text-red-600 dark:text-red-400",
  },
  MEDIUM: {
    label: "Medium",
    icon: Equal,
    className: "text-amber-600 dark:text-amber-400",
  },
  LOW: {
    label: "Low",
    icon: ArrowDown,
    className: "text-emerald-600 dark:text-emerald-400",
  },
}

const statusConfig = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  IN_PROGRESS: {
    label: "In progress",
    icon: LoaderCircle,
    className: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  COMPLETE: {
    label: "Complete",
    icon: CheckCircle2,
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  PARTIALLY_COMPLETE: {
    label: "Partially complete",
    icon: CircleDashed,
    className:
      "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  ON_HOLD: {
    label: "On hold",
    icon: PauseCircle,
    className:
      "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  },
}

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, TaskTableHeaders>()

export const columns = columnHelper.columns([
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
  columnHelper.accessor("id", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  }),
  columnHelper.accessor("team_name", {
    header: "Team",
  }),
  columnHelper.accessor("assigned_to_name", {
    header: "Assigned To",
    cell: ({ row }) =>
      formatName(row.original.assigned_to_name) || "Unassigned",
  }),

  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ row }) => {
      const config = statusConfig[row.original.status]
      const Icon = config.icon

      return (
        <Badge
          variant="outline"
          className={`gap-1.5 font-medium ${config.className}`}
        >
          <Icon className="size-3.5" />
          {config.label}
        </Badge>
      )
    },
  }),
  columnHelper.accessor("priority", {
    header: "Priority",
    cell: ({ row }) => {
      const config = priorityConfig[row.original.priority]
      const Icon = config.icon

      return (
        <div className={`flex items-center gap-2 ${config.className}`}>
          <Icon className="size-4" />
          <span>{config.label}</span>
        </div>
      )
    },
  }),
  columnHelper.accessor("deadline", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Deadline
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => formatDate(row.original.deadline),
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="h-8 w-8 p-0" />}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(String(row.original.id))
                }
              >
                Copy payment ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View customer</DropdownMenuItem>
              <DropdownMenuItem>View payment details</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }),
])
