type CardProps = {
  children: React.ReactNode
  hover?: boolean
  className?: string
}

export default function Card({ children, hover = false, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${
        hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
