import { type ReactTable, type RowData } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { type DataTableFeatures } from "./data-table-features"

interface DataTablePaginationProps<TData extends RowData> {
  table: ReactTable<DataTableFeatures, TData>
}

export function DataTablePagination<TData extends RowData>({
  table,
}: DataTablePaginationProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows.length
  const filteredRows = table.getFilteredRowModel().rows.length

  return (
    <div className="flex flex-col gap-3 border-t px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      {/* Selected rows */}
      <div className="text-xs text-muted-foreground">
        {selectedRows} of {filteredRows} row(s) selected
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium whitespace-nowrap text-muted-foreground">
            Rows per page
          </p>

          <Select
            value={`${table.state.pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-7 w-15 text-xs">
              <SelectValue />
            </SelectTrigger>

            <SelectContent side="top">
              {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                <SelectItem
                  key={pageSize}
                  value={`${pageSize}`}
                  className="text-xs"
                >
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page information */}
        <div className="min-w-[75px] text-center text-xs font-medium tabular-nums">
          Page{" "}
          {table.getPageCount() === 0
            ? 0
            : table.state.pagination.pageIndex + 1}{" "}
          of {table.getPageCount()}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-7 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="size-3.5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="size-3.5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="size-3.5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="hidden size-7 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
