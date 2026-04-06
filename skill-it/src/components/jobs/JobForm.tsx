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

const fieldClass =
  'rounded-xl border border-edge bg-high px-4 py-2.5 text-sm text-fg placeholder:text-muted/50 outline-none focus:ring-2 focus:ring-ember/50 focus:border-ember/60 transition-all duration-200'

export default function JobForm({ categories, skills, onSubmit }: JobFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<number>(0)
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function toggleSkill(name: string) {
    setSelectedNames((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    if (!description.trim()) { setError('Description is required'); return }
    setLoading(true)
    setError('')
    // Map selected names back to IDs, filtering out any without a valid ID
    const skillIds = skills
      .filter((s) => selectedNames.has(s.name) && s.id != null)
      .map((s) => Number(s.id))
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
      <Input
        label="Title"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Need help with React project"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-muted">Description</label>
        <textarea
          className={`${fieldClass} min-h-[120px] resize-none`}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the gig..."
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-muted">Category</label>
        <select
          className={fieldClass}
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
        >
          <option value={0}>Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted">Skills</label>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => toggleSkill(s.name)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer border ${
                  selectedNames.has(s.name)
                    ? 'bg-ember text-white border-ember shadow-sm shadow-ember/30'
                    : 'bg-high text-muted border-edge hover:border-ember/50 hover:text-fg'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="self-start px-8">
        {loading ? 'Posting...' : 'Post Gig'}
      </Button>
    </form>
  )
}
