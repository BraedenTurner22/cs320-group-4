'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ReviewForm from "@/components/reviews/ReviewForm"
import { createClient } from '@/lib/supabase/client'

export default function NewReviewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const jobId = searchParams.get('jobId')
  const [profId, setProfId] = useState<number | null>(null)
  const [reviewedUsersId, setReviewedUsersId] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!jobId) {
        setError('Job ID is required')
        setLoading(false)
        return
      }
      try {
        // gets user authentication and associated profile id
        const supabase = createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error('Not authenticated')
        const { data: profile, error: profileError } = await supabase.from('Profile').select('*').eq('auth_uid', user.id).single()
        if (profileError || !profile) throw new Error('Profile not found')
        setProfId(profile.id)

        // gets associated jobs to get the other party they need to review
        const [jobRes] = await Promise.all([
          fetch(`/api/jobs/${jobId}`)
        ])
        if (!jobRes.ok) throw new Error('Failed to fetch job')
        const job = await jobRes.json()


        // the review button should not show up if there are no accepted workers
        const acceptedWorker = job.accepted_workers
        if (!acceptedWorker) {
          setError('No accepted worker for this job')
          setLoading(false)
          return
        }
        // If current user is owner, review the workers, else review the owner
        setReviewedUsersId(profile.id === job.posted_by ? acceptedWorker : [job.posted_by])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [jobId])

  async function handleSubmit(data: { rating: number; feedback: string }) {
    if (!jobId || !reviewedUsersId) return
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: profId,
        subjects: reviewedUsersId,
        jobId: parseInt(jobId),
        rating: data.rating,
        feedback: data.feedback
      })
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to submit review')
    }
    router.refresh()
    router.back()
  }

  // if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Leave a Review</h1>
      <ReviewForm onSubmit={handleSubmit} />
    </div>
  )
}