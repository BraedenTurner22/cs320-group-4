import { jobs } from '@/lib/services/jobs'
import { profile } from '@/lib/services/profile'
import type { UserProfile } from '@/types'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import JobDetailActions from './job-detail-actions'

type Params = { params: Promise<{ jobId: string }> }

export default async function JobDetailPage({ params }: Params) {
  const { jobId } = await params

  const job = await jobs.getOneByID(Number(jobId))

  let isOwner = false
  let hasApplied = false
  try {
    const currentProfile = await profile.getCurrent()
    isOwner = currentProfile.id === job.posted_by
    if (!isOwner) {
      hasApplied =
        (job.pending_requests ?? []).includes(currentProfile.id) ||
        (job.accepted_workers ?? []).includes(currentProfile.id)
    }
  } catch {
    // Not authenticated or no profile
  }

  let poster: UserProfile | null = null
  try { poster = await profile.getByID(job.posted_by) } catch { /* ignore */ }

  let acceptedWorkerProfiles: { id: number; Username: string }[] = []
  try {
    const profiles = await jobs.getAcceptedWorkerProfiles(Number(jobId))
    acceptedWorkerProfiles = profiles.map((p) => ({ id: p.id, Username: p.Username }))
  } catch { /* ignore */ }

  let pendingRequests: { Username: string; Email: string; id: number }[] = []
  if (isOwner) {
    try {
      const reqs = await jobs.getPendingRequests(Number(jobId))
      pendingRequests = reqs.map((r) => ({ Username: r.Username, Email: r.Email, id: r.id }))
    } catch { /* table may not exist */ }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-extrabold text-fg tracking-tight">
            {job.title || `Job #${job.id}`}
          </h1>
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
      />
    </div>
  )
}
