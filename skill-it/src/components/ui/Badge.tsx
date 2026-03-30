type BadgeProps = {
  children: React.ReactNode
  color?: 'indigo' | 'violet' | 'amber' | 'green' | 'red' | 'gray'
}

const colorStyles: Record<string, string> = {
  indigo: 'bg-indigo-100 text-indigo-700',
  violet: 'bg-violet-100 text-violet-700',
  amber: 'bg-amber-100 text-amber-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
}

export default function Badge({ children, color = 'indigo' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorStyles[color]}`}
    >
      {children}
    </span>
  )
}
