import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

// Reusable skeleton components for different content types

function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 lg:px-6">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-12 w-36 rounded-xl" />
    </div>
  )
}

function FilterTabsSkeleton() {
  return (
    <div className="px-6 py-6 border-b border-gray-100">
      <div className="flex gap-2">
        <Skeleton className="h-12 w-32 rounded-[24px]" />
        <Skeleton className="h-12 w-28 rounded-[24px]" />
      </div>
    </div>
  )
}

function TableHeaderSkeleton({ columns = 7 }: { columns?: number }) {
  return (
    <div className="border-b border-[#E9E7E4] pb-4 mb-4">
      <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
    </div>
  )
}

function TableRowSkeleton({ 
  rows = 5, 
  columns = 7,
  hasAvatar = false 
}: { 
  rows?: number
  columns?: number 
  hasAvatar?: boolean
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-[#E9E7E4] py-4">
          <div className={`grid gap-4 items-center`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j}>
                {j === 0 && hasAvatar ? (
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ) : j === columns - 2 && hasAvatar ? (
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ) : j === columns - 1 && hasAvatar ? (
                  <div className="flex gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                ) : (
                  <Skeleton className="h-4 w-full max-w-32" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="mx-4 lg:mx-6">
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  )
}

function TablePageSkeleton({ 
  hasFilters = false,
  columns = 7,
  rows = 5,
  hasAvatar = false 
}: {
  hasFilters?: boolean
  columns?: number
  rows?: number
  hasAvatar?: boolean
}) {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeaderSkeleton />
      
      <div className="mx-4 lg:mx-6 bg-white rounded-xl shadow-sm border border-gray-100">
        {hasFilters && <FilterTabsSkeleton />}
        
        <div className="px-6 py-6">
          <TableHeaderSkeleton columns={columns} />
          <TableRowSkeleton rows={rows} columns={columns} hasAvatar={hasAvatar} />
        </div>
      </div>
    </div>
  )
}

export { 
  Skeleton,
  PageHeaderSkeleton,
  FilterTabsSkeleton,
  TableHeaderSkeleton,
  TableRowSkeleton,
  CardSkeleton,
  DashboardSkeleton,
  TablePageSkeleton
}
