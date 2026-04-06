'use client'

import { useState, FormEvent } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { Category, Skill } from '@/types'

type JobFormProps = {
  categories: Category[]
  skills: Skill[]
  onSubmit: (data: {
    title: string
    description: string
    categoryId: number
    skills: number[]
  }) => Promise<void>
}

export default function JobForm({ categories, skills, onSubmit }: JobFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<number>(0)
  const [selectedSkills, setSelectedSkills] = useState<number[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function toggleSkill(id: number) {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()){
      setError('Title is required')
      return
    }
    if (!description.trim()) {
      setError('Description is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onSubmit({
        title,
        description,
        categoryId,
        skills: selectedSkills,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Title</label>
        <textarea
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 min-h-[100px]"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short title for the gig..."
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 min-h-[100px]"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the gig..."
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Category</label>
        <select
          className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
        >
          <option value={0}>Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Skills</label>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <button
                key={s.skill_id}
                type="button"
                onClick={() => toggleSkill(s.skill_id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                  selectedSkills.includes(s.skill_id)
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Post Gig'}
      </Button>
    </form>
  )
}
