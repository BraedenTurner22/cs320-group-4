'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

type Props = {
  jobId: number
  isOwner: boolean
  isCompleted: boolean
  pendingRequests: { username: string; email: string; uid?: string }[]
}

export default function JobDetailActions({
  jobId,
  isOwner,
  isCompleted,
  pendingRequests,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleApply() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/jobs/${jobId}/request`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to apply')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to apply')
    } finally {
      setLoading(false)
    }
  }

  async function handleAccept(userId: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}/accept/${userId}`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to accept worker')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to accept')
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}/complete`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to mark complete')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to complete')
    } finally {
      setLoading(false)
    }
  }

  if (isCompleted) return null

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!isOwner && (
        <Button onClick={handleApply} disabled={loading}>
          {loading ? 'Applying...' : 'Apply to Work'}
        </Button>
      )}

      {isOwner && (
        <>
          <Button variant="secondary" onClick={handleComplete} disabled={loading}>
            Mark as Completed
          </Button>

          {pendingRequests.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Pending Requests</h3>
              <div className="flex flex-col gap-2">
                {pendingRequests.map((req) => (
                  <Card key={req.uid ?? req.email}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{req.username}</p>
                        <p className="text-sm text-gray-500">{req.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => req.uid && handleAccept(req.uid)}
                          disabled={loading}
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
