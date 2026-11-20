import { Skeleton } from "@/components/ui/skeleton"

export default function PageLoader() {
  return (
    <div className="min-w-0 space-y-4 p-4">
      {/* Page heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-56 max-w-full" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2 rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="size-7 rounded-md" />
            </div>
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Table container */}
      <div className="overflow-hidden rounded-lg border bg-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-4 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-full sm:w-48" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        {/* Table header */}
        <div className="hidden grid-cols-7 gap-4 border-b bg-muted/30 px-3 py-2.5 md:grid">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-14" />
          ))}
        </div>

        {/* Table rows */}
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 px-3 py-3 md:grid md:grid-cols-7 md:items-center md:gap-4"
            >
              <Skeleton className="h-3.5 w-32 max-w-full" />
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t p-3">
          <Skeleton className="h-3 w-28" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="size-8 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
