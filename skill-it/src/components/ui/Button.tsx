'use client'

import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-ember text-white hover:bg-ember-dark shadow-lg shadow-ember/20 hover:shadow-ember/30',
  secondary:
    'bg-raised border border-edge text-muted hover:text-fg hover:border-ember/50 hover:bg-high',
  ghost:
    'bg-transparent text-muted hover:text-fg hover:bg-high',
  danger:
    'bg-danger/15 text-danger border border-danger/30 hover:bg-danger hover:text-white hover:border-danger',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

export default function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-xl px-5 py-2.5 font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
