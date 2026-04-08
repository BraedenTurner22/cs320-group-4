export default function ThreadLoading() {
  return (
    <div className="flex flex-col h-full gap-4">
      <div className="h-6 w-48 bg-high rounded animate-pulse" />
      <div className="flex flex-col gap-3 flex-1">
        {[false, true, false, false, true, true, false].map((isRight, i) => (
          <div key={i} className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}>
            <div
              className="h-10 bg-high rounded-xl animate-pulse"
              style={{ width: `${30 + (i * 17) % 35}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-auto">
        <div className="h-10 flex-1 bg-high rounded-lg animate-pulse" />
        <div className="h-10 w-20 bg-high rounded-lg animate-pulse" />
      </div>
    </div>
  )
}
