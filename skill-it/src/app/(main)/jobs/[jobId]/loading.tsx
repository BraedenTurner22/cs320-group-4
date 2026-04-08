export default function JobDetailLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-64 bg-high rounded animate-pulse" />
          <div className="h-6 w-16 bg-high rounded-full animate-pulse" />
        </div>
        <div className="h-3 w-32 bg-high rounded animate-pulse mb-3" />
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-high rounded-full animate-pulse" />
          <div className="h-5 w-16 bg-high rounded-full animate-pulse" />
        </div>
      </div>

      <div className="rounded-xl border border-edge bg-raised p-4 flex flex-col gap-2">
        <div className="h-3 w-full bg-high rounded animate-pulse" />
        <div className="h-3 w-full bg-high rounded animate-pulse" />
        <div className="h-3 w-5/6 bg-high rounded animate-pulse" />
        <div className="h-3 w-4/5 bg-high rounded animate-pulse" />
        <div className="h-3 w-full bg-high rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-high rounded animate-pulse" />
      </div>

      <div className="flex gap-3">
        <div className="h-9 w-28 bg-high rounded-lg animate-pulse" />
        <div className="h-9 w-28 bg-high rounded-lg animate-pulse" />
      </div>
    </div>
  )
}
