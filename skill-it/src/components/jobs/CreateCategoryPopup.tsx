'use client'

import { FormEvent, useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Category } from '@/types'

type CreateCategoryPopupProps = {
  open: boolean
  onClose: () => void
  onCreated: (category: Category) => void
}

export default function CreateCategoryPopup({ open, onClose, onCreated }: CreateCategoryPopupProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setName('')
      setError('')
    }
  }, [open])

  if (!open) return null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Category name is required')
      return
    }
    // may not be necessary
    if (name.trim().length > 50) {
      setError('Category name must be 50 characters or less')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), explicit: false }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result?.error || 'Failed to create category')
      }

      const createdCategory = (await response.json()) as Category
      onCreated(createdCategory)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg rounded-3xl bg-raised border border-edge p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-fg">Create a new category</h2>
            <p className="text-sm text-muted mt-1">Add a category for your gig so it can be selected while posting jobs.</p>
          </div>
        </div>

        <Input
          label="Category name"
          placeholder="e.g. Design, Tutoring, Tech Support"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={50}
        />

        {error ? (
          <p className="mt-4 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create Category'}
          </Button>
        </div>
      </form>
    </div>
  )
}
