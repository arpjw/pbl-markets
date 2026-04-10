function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-pbl-card-2 animate-pulse rounded-lg ${className ?? ''}`} />
}

export default function Loading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-10 w-16 rounded-xl" />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[1,2,3].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}
      </div>
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-pbl-border">
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="divide-y divide-pbl-border">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
