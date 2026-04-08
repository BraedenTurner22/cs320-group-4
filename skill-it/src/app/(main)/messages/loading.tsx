export default function MessagesLoading() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-7 w-36 bg-high rounded animate-pulse mb-2" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-edge bg-raised p-4 flex items-center gap-3">
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-4 w-1/3 bg-high rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-high rounded animate-pulse" />
          </div>
          <div className="h-3 w-16 bg-high rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}
