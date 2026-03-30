import { createClient } from '@/lib/supabase/server'
import { jobs } from '@/lib/services/jobs'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import JobDetailActions from './job-detail-actions'

type Params = { params: Promise<{ jobId: string }> }

export default async function JobDetailPage({ params }: Params) {
  const { jobId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const job = await jobs.getOneByID(Number(jobId))
  const isOwner = user?.id === job.posted_by

  let pendingRequests: { username: string; email: string; uid?: string }[] = []
  if (isOwner) {
    try {
      const reqs = await jobs.getPendingRequests(Number(jobId))
      pendingRequests = reqs.map((r) => ({
        username: r.username,
        email: r.email,
        uid: (r as unknown as { uid: string }).uid,
      }))
    } catch {
      // Table may not exist
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {job.header && (
        <img
          src={job.header}
          alt={job.title}
          className="w-full h-48 object-cover rounded-2xl"
        />
      )}

      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-extrabold text-gray-900">{job.title}</h1>
          <Badge color={job.completed ? 'gray' : 'green'}>
            {job.completed ? 'Completed' : 'Open'}
          </Badge>
        </div>
        <p className="text-sm text-gray-400">Posted by {job.posted_by}</p>
      </div>

      {job.category && (
        <Badge color="violet">{job.category.name}</Badge>
      )}

      {job.associated_skills && job.associated_skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {job.associated_skills.map((s) => (
            <Badge key={s.skill_id} color="amber">{s.name}</Badge>
          ))}
        </div>
      )}

      <Card>
        <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
      </Card>

      {job.accepted_workers && job.accepted_workers.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Accepted Workers</h3>
          <div className="flex flex-wrap gap-2">
            {job.accepted_workers.map((w) => (
              <Badge key={w} color="indigo">{w}</Badge>
            ))}
          </div>
        </div>
      )}

      <JobDetailActions
        jobId={Number(jobId)}
        isOwner={isOwner}
        isCompleted={job.completed}
        pendingRequests={pendingRequests}
      />
    </div>
  )
}
