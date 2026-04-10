function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-pbl-card-2 animate-pulse rounded-lg ${className ?? ''}`} />
}

export default function Loading() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-3 rounded" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          <div className="space-y-2 mb-5">
            <Skeleton className="h-7 w-4/5" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="card p-4">
            <div className="flex gap-5 mb-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-[260px] w-full rounded-xl" />
          </div>
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-pbl-border"><Skeleton className="h-3 w-32" /></div>
            {[1,2].map(i => (
              <div key={i} className="px-4 py-4 border-b border-pbl-border last:border-0 flex items-center gap-3">
                <Skeleton className="h-3 w-3 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-[3px] w-full rounded-full" />
                </div>
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
        <div className="hidden lg:block space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
