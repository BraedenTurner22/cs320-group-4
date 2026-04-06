'use client'

import { useState } from 'react'
import type { JobFilters as Filters } from '@/types'

type JobFiltersProps = {
  categories: string[]
  skills: string[]
  onChange: (filters: Filters) => void
}

export default function JobFilters({ categories, skills, onChange }: JobFiltersProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [completed, setCompleted] = useState<boolean | undefined>(undefined)
  const [searchFocused, setSearchFocused] = useState(false)

  function emit(overrides: Partial<Filters> = {}) {
    onChange({
      search: overrides.search ?? search,
      category: overrides.category ?? category,
      skills: overrides.skills ?? selectedSkills,
      completed: overrides.completed ?? completed,
    })
  }

  function toggleSkill(s: string) {
    const next = selectedSkills.includes(s)
      ? selectedSkills.filter((x) => x !== s)
      : [...selectedSkills, s]
    setSelectedSkills(next)
    emit({ skills: next })
  }

  const selectClass =
    'rounded-xl border border-edge bg-high px-3 py-2 text-sm text-fg outline-none focus:ring-2 focus:ring-ember/50 focus:border-ember/60 transition-all duration-200'

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-raised border border-edge p-5">
      {/* Search with glow */}
      <div className="relative">
        {searchFocused && (
          <div
            className="absolute -inset-1 rounded-2xl opacity-100 blur-xl pointer-events-none transition-opacity duration-500"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(236,108,4,0.25) 0%, transparent 70%)',
            }}
          />
        )}
        <div className="relative flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted">Search</label>
          <input
            className="rounded-xl border border-edge bg-high px-4 py-2.5 text-sm text-fg placeholder:text-muted/50 outline-none focus:ring-2 focus:ring-ember/50 focus:border-ember/60 transition-all duration-200"
            placeholder="Search jobs..."
            value={search}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onChange={(e) => {
              setSearch(e.target.value)
              emit({ search: e.target.value })
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted">Category</label>
          <select
            className={selectClass}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              emit({ category: e.target.value })
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted">Status</label>
          <select
            className={selectClass}
            value={completed === undefined ? '' : String(completed)}
            onChange={(e) => {
              const val = e.target.value === '' ? undefined : e.target.value === 'true'
              setCompleted(val)
              emit({ completed: val })
            }}
          >
            <option value="">All</option>
            <option value="false">Open</option>
            <option value="true">Completed</option>
          </select>
        </div>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted">Skills</label>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <button
                key={s}
                onClick={() => toggleSkill(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer border ${
                  selectedSkills.includes(s)
                    ? 'bg-ember text-white border-ember shadow-sm shadow-ember/30'
                    : 'bg-high text-muted border-edge hover:border-ember/50 hover:text-fg'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
