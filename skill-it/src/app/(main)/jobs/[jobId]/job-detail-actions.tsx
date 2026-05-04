'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import ReviewCard from '@/components/reviews/ReviewCard'
import Link from 'next/link'

type PendingRequest = { Username: string; Email: string; id: number }

type ReviewWithSubjectNames = {
  rating: number
  feedback: string
  subjects: { id: number; name: string }
}

type AcceptedWorker = { id: number; Username: string }

type Props = {
  jobId: number
  isOwner: boolean
  isCompleted: boolean
  pendingRequests: PendingRequest[]
  hasApplied: boolean
  reviews: ReviewWithSubjectNames[]
  acceptedWorkerProfiles: AcceptedWorker[]
}

export default function JobDetailActions({
  jobId,
  isOwner,
  isCompleted,
  pendingRequests: initialRequests,
  hasApplied: initialHasApplied,
  reviews,
  acceptedWorkerProfiles,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [hasApplied, setHasApplied] = useState(initialHasApplied)
  const [requests, setRequests] = useState(initialRequests)

  function notify(message: string, type: 'success' | 'error' = 'success') {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  async function handleApply() {
    setLoading(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}/request`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to apply')
      }
      setHasApplied(true)
      notify('Application submitted! The job owner will review it.')
      router.refresh()
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to apply', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleWithdraw() {
    setLoading(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}/request`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to withdraw')
      setHasApplied(false)
      notify('Application withdrawn.')
      router.refresh()
    } catch {
      notify('Failed to withdraw application', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleAccept(userId: number) {
    try {
      const res = await fetch(`/api/jobs/${jobId}/accept/${userId}`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to accept applicant')
      const data = await res.json()
      setRequests((prev) => prev.filter((r) => r.id !== userId))
      notify('Applicant accepted! Opening message thread...')
      router.refresh()
      if (data.threadId) {
        setTimeout(() => router.push(`/messages/${data.threadId}`), 1200)
      }
    } catch {
      notify('Failed to accept applicant', 'error')
    }
  }

  async function handleDeny(userId: number) {
    try {
      const res = await fetch(`/api/jobs/${jobId}/deny/${userId}`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to deny applicant')
      setRequests((prev) => prev.filter((r) => r.id !== userId))
      notify('Applicant declined.')
    } catch {
      notify('Failed to decline applicant', 'error')
    }
  }

  async function handleComplete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}/complete`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to mark complete')
      notify('Job marked as complete!')
      router.refresh()
    } catch {
      notify('Failed to mark job as complete', 'error')
    } finally {
      setLoading(false)
    }
  }

  // If review exists and job is completed, show review cards
  //console.log(acceptedWorkerProfiles)
  if (reviews.length > 0 && isCompleted && (!isOwner || acceptedWorkerProfiles.length > 0)) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="font-semibold text-fg text-sm">Your Review</h3>
        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.subjects.id}
              rating={review.rating}
              feedback={review.feedback}
              subject={review.subjects.name}
            />
          ))}
        </div>
      </div>
    )
  }

  // If job is completed but no review, show leave review button
  // Only show if: not owner OR (owner with accepted workers)
  if (isCompleted && reviews.length === 0 && (!isOwner || acceptedWorkerProfiles.length > 0)) {
    return (
      <div>
        <Button onClick={() => router.push(`/reviews/new?jobId=${jobId}`)}>
          Leave a Review
        </Button>
      </div>
    )
  }

  // If job is archived (completed with no accepted workers and user is owner)
  if (isCompleted && acceptedWorkerProfiles.length === 0 && isOwner) {
    return (
      <div className="px-4 py-3 rounded-xl text-sm font-medium border bg-muted/10 text-muted border-muted/25">
        <p className="font-semibold">Job Archived</p>
        <p className="text-xs mt-1">This job was archived with no accepted workers.</p>
      </div>
    )
  }

  // Default behavior for non-completed jobs
  return (
    <div className="flex flex-col gap-6">
      {notification && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium border ${
            notification.type === 'success'
              ? 'bg-success/10 text-success border-success/25'
              : 'bg-danger/10 text-danger border-danger/25'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Applicant view */}
      {!isOwner && (
        <div>
          {hasApplied ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted px-4 py-2.5 rounded-xl border border-edge bg-raised">
                Application pending review
              </span>
              <Button variant="ghost" onClick={handleWithdraw} disabled={loading} className="text-sm">
                Withdraw
              </Button>
            </div>
          ) : (
            <Button onClick={handleApply} disabled={loading}>
              {loading ? 'Applying...' : 'Apply to Work'}
            </Button>
          )}
        </div>
      )}

      {/* Owner view */}
      {isOwner && (
        <div className="flex flex-col gap-6">
          {/* Applicants section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Applicants</p>
              {requests.length > 0 && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-ember/15 text-ember-text border border-ember/25">
                  {requests.length}
                </span>
              )}
            </div>
            {requests.length > 0 ? (
              <div className="flex flex-col gap-2">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-edge bg-raised"
                  >
                    <Link 
                      href={`/user/${req.id}`} 
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-ember/10 border border-ember/20 flex items-center justify-center text-ember font-bold text-sm flex-shrink-0">
                        {req.Username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-fg text-sm">{req.Username}</p>
                        <p className="text-xs text-muted">{req.Email}</p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="danger"
                        onClick={() => handleDeny(req.id)}
                        className="text-xs px-3 py-1.5"
                      >
                        Deny
                      </Button>
                      <Button
                        onClick={() => handleAccept(req.id)}
                        className="text-xs px-3 py-1.5"
                      >
                        Accept
                      </Button>
                    </div>

                  </div>
                ))}         
              </div>
            ) : (
              <div className="py-8 text-center rounded-xl border border-dashed border-edge">
                <p className="text-sm font-medium text-muted">No applicants yet</p>
                <p className="text-xs text-muted/60 mt-1">Applicants will appear here when someone applies.</p>
              </div>
            )}
          </div>

          {/* Job management */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Job Management</p>
            {acceptedWorkerProfiles.length === 0 ? (
              <Button variant="secondary" onClick={handleComplete} disabled={loading} className="self-start">
                {loading ? 'Archiving...' : 'Archive'}
              </Button>
            ) : (
              <Button variant="secondary" onClick={handleComplete} disabled={loading} className="self-start">
                {loading ? 'Marking...' : 'Mark as Complete'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
