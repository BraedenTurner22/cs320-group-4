'use client'

import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg',
  secondary:
    'bg-violet-100 text-violet-700 hover:bg-violet-200 shadow-sm',
  ghost:
    'bg-transparent text-indigo-600 hover:bg-indigo-50',
  danger:
    'bg-red-500 text-white hover:bg-red-600 shadow-md',
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
      className={`rounded-xl px-5 py-2.5 font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
