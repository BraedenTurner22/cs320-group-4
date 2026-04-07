type CardProps = {
  children: React.ReactNode
  hover?: boolean
  className?: string
}

export default function Card({ children, hover = false, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-edge bg-raised p-5 ${
        hover
          ? 'transition-all duration-200 hover:border-ember/40 hover:shadow-lg hover:shadow-ember/5 hover:-translate-y-0.5'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
