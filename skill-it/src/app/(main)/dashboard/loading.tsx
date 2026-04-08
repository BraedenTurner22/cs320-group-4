function SkeletonCard() {
  return (
    <div className="rounded-xl border border-edge bg-raised p-4 flex flex-col gap-3">
      <div className="h-4 w-2/3 bg-high rounded animate-pulse" />
      <div className="h-3 w-full bg-high rounded animate-pulse" />
      <div className="h-3 w-4/5 bg-high rounded animate-pulse" />
      <div className="flex gap-2 mt-1">
        <div className="h-5 w-16 bg-high rounded-full animate-pulse" />
        <div className="h-5 w-12 bg-high rounded-full animate-pulse" />
      </div>
    </div>
  )
}

function SkeletonSection({ title }: { title: string }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-bold text-fg">{title}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </section>
  )
}

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="h-8 w-40 bg-high rounded animate-pulse mb-2" />
        <div className="h-4 w-32 bg-high rounded animate-pulse" />
      </div>
      <SkeletonSection title="Your Posted Gigs" />
      <SkeletonSection title="Jobs You Applied To" />
      <SkeletonSection title="Accepted Jobs" />
      <section>
        <span className="text-lg font-bold text-fg">Active Threads</span>
        <div className="mt-4 flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-edge bg-raised p-3 flex items-center gap-3">
              <div className="h-4 w-1/3 bg-high rounded animate-pulse" />
              <div className="h-3 w-1/4 bg-high rounded animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
