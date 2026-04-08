function SkeletonCard() {
  return (
    <div className="rounded-xl border border-edge bg-raised p-4 flex flex-col gap-3">
      <div className="h-5 w-3/4 bg-high rounded animate-pulse" />
      <div className="h-3 w-full bg-high rounded animate-pulse" />
      <div className="h-3 w-5/6 bg-high rounded animate-pulse" />
      <div className="flex gap-2 mt-1">
        <div className="h-5 w-20 bg-high rounded-full animate-pulse" />
        <div className="h-5 w-14 bg-high rounded-full animate-pulse" />
      </div>
      <div className="h-8 w-24 bg-high rounded-lg animate-pulse mt-auto" />
    </div>
  )
}

export default function JobsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <div className="h-9 w-36 bg-high rounded-lg animate-pulse" />
        <div className="h-9 w-36 bg-high rounded-lg animate-pulse" />
        <div className="h-9 w-28 bg-high rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  )
}
