import { jobs } from '@/lib/services/jobs'
import { profile } from '@/lib/services/profile'
import { reviews } from '@/lib/services/reviews'
import type { UserProfile } from '@/types'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import JobDetailActions from './job-detail-actions'

type Params = { params: Promise<{ jobId: string }> }

type ReviewWithSubjectNames = {
  rating: number
  feedback: string
  subjects: Array<{ id: number; name: string }>
}

export default async function JobDetailPage({ params }: Params) {
  const { jobId } = await params

  // Fetch job and current user in parallel — neither depends on the other
  const [job, currentProfileResult] = await Promise.all([
    jobs.getOneByID(Number(jobId)),
    profile.getCurrent().catch(() => null),
  ])

  let isOwner = false
  let hasApplied = false
  if (currentProfileResult) {
    isOwner = currentProfileResult.id === job.posted_by
    if (!isOwner) {
      hasApplied =
        (job.pending_requests ?? []).includes(currentProfileResult.id) ||
        (job.accepted_workers ?? []).includes(currentProfileResult.id)
    }
  }

  // Now fetch poster, accepted workers, and (if owner) pending requests in parallel
  const [posterResult, acceptedProfilesResult, pendingReqsResult] = await Promise.allSettled([
    profile.getByID(job.posted_by),
    jobs.getAcceptedWorkerProfiles(Number(jobId)),
    isOwner ? jobs.getPendingRequests(Number(jobId)) : Promise.resolve([]),
  ])

  // console.log(pendingReqsResult)

  const poster: UserProfile | null = posterResult.status === 'fulfilled' ? posterResult.value : null
  const acceptedWorkerProfiles =
    acceptedProfilesResult.status === 'fulfilled'
      ? acceptedProfilesResult.value.map((p) => ({ id: p.id, Username: p.Username }))
      : []
  const pendingRequests =
    pendingReqsResult.status === 'fulfilled'
      ? pendingReqsResult.value.map((r) => ({ Username: r.Username, Email: r.Email, id: r.id }))
      : []

  // Fetch review if job is completed and user is logged in
  let reviewWithSubjectNames: ReviewWithSubjectNames | null = null
  if (job.completed && currentProfileResult) {
    const review = await reviews.getReviewByJobID(Number(jobId), currentProfileResult.id).catch(() => null)
    // console.log(review)
    if (review) {
      const subjectProfiles = await Promise.all(
        review.subject.map(subjectId => profile.getByID(subjectId).catch(() => null))
      )

      reviewWithSubjectNames = {
        rating: review.rating,
        feedback: review.feedback,
        subjects: subjectProfiles
          .filter((p) => p !== null)
          .map((p) => ({ id: p.id, name: p.Username }))
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-extrabold text-ember">{job.title}</h1>
          <Badge color={job.completed ? 'muted' : 'green'}>
            {job.completed ? 'Completed' : 'Open'}
          </Badge>
        </div>
        <p className="text-xs text-muted/60">
          Posted by <span className="text-muted">{poster?.Username ?? `#${job.posted_by}`}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {job.category && <Badge color="orange">{job.category.name}</Badge>}
          {job.associated_skills?.map((s, i) => (
            <Badge key={s.id ?? `skill-${i}`} color="dim">{s.name}</Badge>
          ))}
        </div>
      </div>

      <Card>
        <p className="text-fg/90 whitespace-pre-wrap leading-relaxed text-sm">{job.description}</p>
      </Card>

      {acceptedWorkerProfiles.length > 0 && (
        <div>
          <h3 className="font-semibold text-fg mb-2 text-sm">Accepted Workers</h3>
          <div className="flex flex-wrap gap-2">
            {acceptedWorkerProfiles.map((w) => (
              <Badge key={w.id} color="green">{w.Username}</Badge>
            ))}
          </div>
        </div>
      )}

      <JobDetailActions
        jobId={Number(jobId)}
        isOwner={isOwner}
        isCompleted={job.completed}
        pendingRequests={pendingRequests}
        hasApplied={hasApplied}
        review={reviewWithSubjectNames}
      />
    </div>
  )
}
