'use client'

import { useState, useEffect, FormEvent, useRef } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { Category, Skill } from '@/types'

type JobFormProps = {
  categories: Category[]
  skills: Skill[]
  defCategory: number
  setDefCategory: (category:number)=>void
  onSubmit: (data: {
    title: string
    description: string
    categoryId: number
    skills: number[]
  }) => Promise<void>
  onCreateCategory: () => void
}

const fieldClass =
  'rounded-xl border border-edge bg-high px-4 py-2.5 text-sm text-fg placeholder:text-muted/50 outline-none focus:ring-2 focus:ring-ember/50 focus:border-ember/60 transition-all duration-200'

export default function JobForm({ categories, skills: initialSkills, defCategory, setDefCategory, onSubmit, onCreateCategory }: JobFormProps) {
  // title hook
  const [title, setTitle] = useState('')
  // description hook
  const [description, setDescription] = useState('')
  // category hook
  // Start with the default category if one is provided by the parent.
  const [categoryId, setCategoryId] = useState<number>(defCategory || 0)
  // skills hook
  const [skills, setSkills] = useState<Skill[]>(initialSkills)

  // Sync when parent finishes fetching skills (initialSkills arrives after async load).
  // Merge so any custom skills the user already added are preserved.
  useEffect(() => {
    if (initialSkills.length === 0) return
    setSkills((prev) => {
      const existingIds = new Set(initialSkills.map((s) => s.id))
      const customOnly = prev.filter((s) => !existingIds.has(s.id))
      return [...initialSkills, ...customOnly]
    })
  }, [initialSkills])
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set())
  // error hook
  const [error, setError] = useState('')
  // loading result hook
  const [loading, setLoading] = useState(false)

  // Custom skill state
  const [customSkillName, setCustomSkillName] = useState('')
  const [customSkillLoading, setCustomSkillLoading] = useState(false)
  const [customSkillError, setCustomSkillError] = useState('')
  const customSkillInputRef = useRef<HTMLInputElement>(null)

  // Sync the internal category state when the parent passes a new default category,
  // such as immediately after creating a new category.
  useEffect(() => {
    if (defCategory > 0) {
      setCategoryId(defCategory)
    }
  }, [defCategory])

  // when toggle skill, add the skill or remove the skill depending if skill is in hook
  function toggleSkill(name: string) {
    setSelectedNames((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  async function handleAddCustomSkill() {
    const trimmed = customSkillName.trim()
    if (!trimmed) return

    // Check if skill already exists (case-insensitive)
    const duplicate = skills.find(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase()
    )
    if (duplicate) {
      // Just select the existing one
      setSelectedNames((prev) => new Set(prev).add(duplicate.name))
      setCustomSkillName('')
      return
    }

    setCustomSkillLoading(true)
    setCustomSkillError('')
    try {
      const res = await fetch('/api/skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, explicit: false }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create skill')
      }
      const newSkill: Skill = await res.json()
      setSkills((prev) => [...prev, newSkill])
      setSelectedNames((prev) => new Set(prev).add(newSkill.name))
      setCustomSkillName('')
      customSkillInputRef.current?.focus()
    } catch (err: unknown) {
      setCustomSkillError(err instanceof Error ? err.message : 'Failed to add skill')
    } finally {
      setCustomSkillLoading(false)
    }
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
        skills: skillIds,
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
          onChange={(e) => {
            const value = Number(e.target.value)
            if (value === -1) {
              onCreateCategory()
              
              setCategoryId(0)
              return
            }
            setCategoryId(value)
          }}
        >
          <option value={0}>Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
          <option value={-1}>Create category</option>

        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted">Skills</label>

        {/* Existing skill chips */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <button
                key={s.id ?? s.name}
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
        )}

        {/* Add custom skill */}
        <div className="flex gap-2 mt-1">
          <input
            ref={customSkillInputRef}
            type="text"
            value={customSkillName}
            onChange={(e) => setCustomSkillName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddCustomSkill()
              }
            }}
            placeholder="Add a custom skill..."
            className={`${fieldClass} flex-1`}
            disabled={customSkillLoading}
          />
          <button
            type="button"
            onClick={handleAddCustomSkill}
            disabled={customSkillLoading || !customSkillName.trim()}
            className="rounded-xl border border-edge bg-high px-4 py-2.5 text-sm font-medium text-fg transition-all hover:border-ember/50 hover:text-ember disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {customSkillLoading ? '...' : '+ Add'}
          </button>
        </div>

        {customSkillError && (
          <p className="text-xs text-danger">{customSkillError}</p>
        )}
      </div>

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

