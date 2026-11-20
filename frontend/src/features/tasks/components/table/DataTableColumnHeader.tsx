import type { Column, RowData } from "@tanstack/react-table"
import type { HTMLAttributes } from "react"

import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { DataTableFeatures } from "./data-table-features"
import { cn } from "cn"

interface DataTableColumnHeaderProps<
  TData extends RowData,
  TValue,
> extends HTMLAttributes<HTMLDivElement> {
  column: Column<DataTableFeatures, TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn("flex items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-7 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground data-[state=open]:bg-accent"
            />
          }
        >
          <span>{title}</span>

          {column.getIsSorted() === "desc" ? (
            <ArrowDown className="size-3.5 shrink-0" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUp className="size-3.5 shrink-0" />
          ) : (
            <ChevronsUpDown className="size-3.5 shrink-0" />
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          {column.getCanSort() && (
            <>
              <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                <ArrowUp className="mr-2 size-4" />
                Ascending
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                <ArrowDown className="mr-2 size-4" />
                Descending
              </DropdownMenuItem>
            </>
          )}

          {column.getCanSort() && column.getCanHide() && (
            <DropdownMenuSeparator />
          )}

          {column.getCanHide() && (
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeOff className="mr-2 size-4" />
              Hide column
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
