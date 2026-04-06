type BadgeVariant = 'orange' | 'green' | 'dim' | 'muted' | 'danger'

type BadgeProps = {
  children: React.ReactNode
  color?: BadgeVariant
}

const colorStyles: Record<BadgeVariant, string> = {
  orange: 'bg-ember/15 text-ember border border-ember/25',
  green:  'bg-success/15 text-success border border-success/25',
  dim:    'bg-high text-muted border border-edge',
  muted:  'bg-high/60 text-muted border border-edge/60',
  danger: 'bg-danger/15 text-danger border border-danger/25',
}

export default function Badge({ children, color = 'dim' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorStyles[color]}`}
    >
      {children}
    </span>
  )
}
