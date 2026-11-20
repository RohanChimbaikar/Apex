import {
  useTable,
  type ColumnDef,
  type RowData,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"

import * as React from "react"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { DataTableViewOptions } from "./DataTableViewOptions"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { features, type DataTableFeatures } from "./data-table-features"
import { DataTablePagination } from "./DataTablePagination"
import { FilterTabs } from "./FilterTabs"
import { isDueToday, isOverdue, isUpcoming } from "@/lib/date.utils"
import type { Task } from "@/types/api"

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
}

export function DataTable({ columns, data }: DataTableProps<Task>) {
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const filterCounts = React.useMemo(() => {
    return {
      all: data.length,
      overdue: data.filter((task: Task) => isOverdue(task.due_date)).length,
      "due-today": data.filter((task: Task) => isDueToday(task.due_date))
        .length,
      upcoming: data.filter((task: Task) => isUpcoming(task.due_date)).length,
    }
  }, [data])

  const table = useTable({
    features,
    data,
    columns,
    globalFilterFn: "includesString",
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
  })

  // Adjust individual column widths here
  const columnWidths: Record<string, string> = {
    select: "28px",
    name: "220px",
    priority: "105px",
    assigned_to_name: "155px",
    status: "110px",
    team_name: "165px",
    due_date: "125px",
    created_at: "125px",
  }

  return (
    <div className="w-full min-w-0 space-y-3">
      {/* Search */}
      {/* Search & Filters */}
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        {/* Search + Columns button on the same row on mobile, separated on desktop */}
        <div className="flex items-center gap-2 lg:flex-1">
          <div className="relative flex-1 lg:max-w-xs">
            <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={table.state.globalFilter ?? ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="h-8 pl-9 text-xs"
            />
          </div>

          {/* Show Columns button next to Search on mobile */}
          <div className="shrink-0 lg:hidden">
            <DataTableViewOptions table={table} />
          </div>
        </div>

        {/* FilterTabs: scrolls horizontally on small screens without breaking layout */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:ml-auto lg:overflow-visible lg:pb-0">
          <FilterTabs
            counts={filterCounts}
            value={
              (table.getColumn("due_date")?.getFilterValue() as string) ?? "all"
            }
            onValueChange={(value) => {
              table
                .getColumn("due_date")
                ?.setFilterValue(value === "all" ? undefined : value)
            }}
          />

          {/* Show Columns button on the right on desktop */}
          <div className="hidden shrink-0 lg:block">
            <DataTableViewOptions table={table} />
          </div>
        </div>
      </div>

      {/* Table container */}
      <div className="w-full min-w-0 overflow-hidden rounded-lg border">
        {/* Scrollable table */}
        <div className="table-scroll-area w-full min-w-0 overflow-x-auto">
          <Table className="w-full min-w-261.25 table-fixed">
            {/* Column widths */}
            <colgroup>
              {table.getVisibleLeafColumns().map((column) => (
                <col
                  key={column.id}
                  style={{
                    width: columnWidths[column.id] ?? "auto",
                  }}
                />
              ))}
            </colgroup>

            {/* Header */}
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="h-9 hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-9 overflow-hidden px-3 py-0 text-xs font-medium whitespace-nowrap text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            {/* Body */}
            <TableBody className="bg-card">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="transition-colors hover:bg-muted/40"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="overflow-hidden px-3 py-2 align-middle text-xs"
                      >
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getVisibleLeafColumns().length}
                    className="h-20 text-center text-xs text-muted-foreground"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />

        {/* Pagination - outside horizontal scrolling */}
        {/* <div className="flex items-center justify-between gap-3 border-t bg-muted/30 px-3 py-2.5">
          <span className="text-xs text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} rows selected
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div> */}
      </div>
    </div>
  )
}
