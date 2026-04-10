function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-pbl-card-2 animate-pulse rounded-lg ${className ?? ''}`} />
}

function CardSkeleton() {
  return (
    <div className="card p-4 flex flex-col gap-3.5">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="space-y-2 mt-1">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-3 w-5 rounded" />
          <Skeleton className="h-[3px] flex-1 rounded-full" />
          <Skeleton className="h-5 w-9 rounded-full" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-3 w-5 rounded" />
          <Skeleton className="h-[3px] flex-1 rounded-full" />
          <Skeleton className="h-5 w-9 rounded-full" />
        </div>
      </div>
      <div className="flex justify-between pt-1 border-t border-pbl-border">
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div>
      {/* Hero skeleton */}
      <div className="card p-5 mb-6">
        <Skeleton className="h-3 w-24 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <div className="space-y-3 mt-4">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-[200px] rounded-xl" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-2 mb-5">
        {[60, 90, 60, 60, 80].map((w, i) => (
          <Skeleton key={i} className={`h-7 w-${w} rounded-full`} style={{ width: w }} />
        ))}
      </div>

      {/* Grid + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="hidden lg:block space-y-2">
          <Skeleton className="h-4 w-20 mb-3" />
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
        </div>
      </div>
    </div>
  )
}
