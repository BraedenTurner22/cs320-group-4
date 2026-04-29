'use client'

import { FormEvent, useState } from 'react'
import Button from '@/components/ui/Button'

type ReviewFormProps = {
  onSubmit: (data: { rating: number; feedback: string }) => Promise<void>
}

const fieldClass =
  'rounded-xl border border-edge bg-high px-4 py-2.5 text-sm text-fg placeholder:text-muted/50 outline-none focus:ring-2 focus:ring-ember/50 focus:border-ember/60 transition-all duration-200'

export default function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (rating < 1 || rating > 5) {
      setError('Please select a rating before submitting.')
      return
    }
    if (!feedback.trim()) {
      setError('Feedback is required.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onSubmit({ rating, feedback: feedback.trim() })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-muted">Rating</label>
        <select
          className={fieldClass}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          aria-label="Rating"
        >
          <option value={0}>None</option>
          <option value={1}>1 - Poor</option>
          <option value={2}>2 - Fair</option>
          <option value={3}>3 - Good</option>
          <option value={4}>4 - Very Good</option>
          <option value={5}>5 - Excellent</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-muted">Feedback</label>
        <textarea
          className={`${fieldClass} min-h-[140px] resize-none`}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Describe your experience working with this person..."
          required
        />
      </div>

      {error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="self-start px-8"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  )
}
