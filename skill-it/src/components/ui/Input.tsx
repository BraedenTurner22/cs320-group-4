'use client'

import { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-muted">{label}</label>
      <input
        className={`rounded-xl border bg-high px-4 py-2.5 text-sm text-fg placeholder:text-muted/50 outline-none transition-all duration-200 focus:ring-2 focus:ring-ember/50 focus:border-ember/60 ${
          error ? 'border-danger/50 focus:ring-danger/40 focus:border-danger/50' : 'border-edge'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
