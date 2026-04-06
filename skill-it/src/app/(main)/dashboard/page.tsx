import { jobs } from '@/lib/services/jobs'
import { threads } from '@/lib/services/threads'
import { profile } from '@/lib/services/profile'
import JobCard from '@/components/jobs/JobCard'
import ThreadList from '@/components/threads/ThreadList'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default async function DashboardPage() {
  let currentProfile: Awaited<ReturnType<typeof profile.getCurrent>> | null = null
  let myJobs: Awaited<ReturnType<typeof jobs.getByUser>> = []
  let appliedJobs: Awaited<ReturnType<typeof jobs.getAppliedJobs>> = []
  let acceptedJobs: Awaited<ReturnType<typeof jobs.getAcceptedJobs>> = []
  let myThreads: Awaited<ReturnType<typeof threads.getAll>> = []

  try { currentProfile = await profile.getCurrent() } catch { /* no profile yet */ }
  try { myJobs = await jobs.getByUser() } catch { /* table may not exist */ }
  try { appliedJobs = await jobs.getAppliedJobs() } catch { /* table may not exist */ }
  try { acceptedJobs = await jobs.getAcceptedJobs() } catch { /* table may not exist */ }
  try { myThreads = await threads.getAll() } catch { /* table may not exist */ }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-extrabold text-fg tracking-tight">Dashboard</h1>
        <p className="text-muted mt-1">
          Welcome back{currentProfile ? `, ${currentProfile.Username}` : ''}
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-fg">Your Posted Gigs</h2>
          <Link href="/jobs/new">
            <Button className="text-sm px-4 py-2">Post a Gig</Button>
          </Link>
        </div>
        {myJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {myJobs.map((job) => <JobCard key={job.id} job={job} showApplicantBadge />)}
          </div>
        ) : (
          <p className="text-sm text-muted/60">You haven&apos;t posted any gigs yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-fg mb-4">Jobs You Applied To</h2>
        {appliedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {appliedJobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        ) : (
          <p className="text-sm text-muted/60">You haven&apos;t applied to any jobs yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-fg mb-4">Accepted Jobs</h2>
        {acceptedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {acceptedJobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        ) : (
          <p className="text-sm text-muted/60">You haven&apos;t been accepted to any jobs yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-fg mb-4">Active Threads</h2>
        <ThreadList threads={myThreads} />
      </section>

      <Link href="/jobs" className="self-start">
        <Button variant="secondary">Browse All Jobs</Button>
      </Link>
    </div>
  )
}
