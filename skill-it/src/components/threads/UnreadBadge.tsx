type UnreadBadgeProps = {
  count: number
  className?: string
}

export default function UnreadBadge({ count, className = '' }: UnreadBadgeProps) {
  if (count <= 0) return null
  const label = count > 99 ? '99+' : String(count)
  return (
    <span
      className={`pointer-events-none inline-flex min-h-[1.125rem] min-w-[1.125rem] shrink-0 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ${className}`}
      aria-label={`${count} unread`}
    >
      {label}
    </span>
  )
}
