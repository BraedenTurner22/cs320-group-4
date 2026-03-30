'use client'

import { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        className={`rounded-xl border px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 ${
          error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
