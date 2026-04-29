import Link from 'next/link'
import { jobs } from '@/lib/services/jobs'
import { profile } from '@/lib/services/profile'
import type { UserProfile } from '@/types'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import JobDetailActions from './job-detail-actions'

type Params = { params: Promise<{ jobId: string }> }

export default async function JobDetailPage({ params }: Params) {
  const { jobId } = await params

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

  const [posterResult, acceptedProfilesResult, pendingReqsResult] = await Promise.allSettled([
    profile.getByID(job.posted_by),
    jobs.getAcceptedWorkerProfiles(Number(jobId)),
    isOwner ? jobs.getPendingRequests(Number(jobId)) : Promise.resolve([]),
  ])

  const poster: UserProfile | null = posterResult.status === 'fulfilled' ? posterResult.value : null
  const acceptedWorkerProfiles =
    acceptedProfilesResult.status === 'fulfilled'
      ? acceptedProfilesResult.value.map((p) => ({ id: p.id, Username: p.Username }))
      : []
  const pendingRequests =
    pendingReqsResult.status === 'fulfilled'
      ? pendingReqsResult.value.map((r) => ({ Username: r.Username, Email: r.Email, id: r.id }))
      : []

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <Link
        href="/jobs"
        className="text-sm text-muted hover:text-fg flex items-center gap-1 w-fit transition-colors duration-150"
      >
        ← Back to Jobs
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold text-ember-text leading-tight">{job.title}</h1>
          <Badge color={job.completed ? 'muted' : 'green'}>
            {job.completed ? 'Completed' : 'Open'}
          </Badge>
        </div>
        <p className="text-sm text-muted">
          Posted by{' '}
          <span className="text-fg font-medium">{poster?.Username ?? `#${job.posted_by}`}</span>
        </p>
        {job.category && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted shrink-0">Category:</span>
            <Badge color="orange">{job.category.name}</Badge>
          </div>
        )}
        {(job.associated_skills?.length ?? 0) > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-sm text-muted shrink-0 pt-0.5">Skills:</span>
            <div className="flex flex-wrap gap-2">
              {job.associated_skills?.map((s, i) => (
                <Badge key={s.id ?? `skill-${i}`} color="dim">{s.name}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">About this Job</p>
        <Card>
          <p className="text-fg/90 whitespace-pre-wrap leading-relaxed text-sm">{job.description}</p>
        </Card>
      </div>

      {/* Accepted Workers */}
      {acceptedWorkerProfiles.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Accepted Workers</p>
          <Card>
            <div className="flex flex-wrap gap-2">
              {acceptedWorkerProfiles.map((w) => (
                <Badge key={w.id} color="green">{w.Username}</Badge>
              ))}
            </div>
          </Card>
        </div>
      )}

      <div className="border-t border-edge" />

      <JobDetailActions
        jobId={Number(jobId)}
        isOwner={isOwner}
        isCompleted={job.completed}
        pendingRequests={pendingRequests}
        hasApplied={hasApplied}
      />
    </div>
  )
}
