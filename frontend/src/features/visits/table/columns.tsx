import { createColumnHelper } from "@tanstack/react-table"

import { type DataTableFeatures } from "./data-table-features"
// import type { PriorityEnum, Visit } from "@/types/api"

import { Checkbox } from "@/components/ui/checkbox"
import type { Visit } from "@/types/api"

// export type TaskType = Pick<
//   Task,
//   | "name"
//   | "assigned_to"
//   | "priority"
//   | "status"
//   | "team"
//   | "due_date"
//   | "created_at"
// >

export type VisitType = Visit
// const priorityOrder: Record<PriorityEnum, number> = {
//   HIGH: 3,
//   MEDIUM: 2,
//   LOW: 1,
// }

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, VisitType>()

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
  columnHelper.display({
    header: "task",
  }),
  columnHelper.display({
    header: "agent",
  }),
])
