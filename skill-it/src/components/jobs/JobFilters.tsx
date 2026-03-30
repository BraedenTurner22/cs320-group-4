'use client'

import { useState } from 'react'
import type { JobFilters as Filters } from '@/types'
import Input from '@/components/ui/Input'

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

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-gray-50 p-5 border border-gray-200">
      <Input
        label="Search"
        placeholder="Search jobs..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          emit({ search: e.target.value })
        }}
      />

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
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
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
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
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Skills</label>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <button
                key={s}
                onClick={() => toggleSkill(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                  selectedSkills.includes(s)
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
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
