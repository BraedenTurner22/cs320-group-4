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

  const [profileResult, myJobsResult, appliedJobsResult, acceptedJobsResult, myThreadsResult] =
    await Promise.allSettled([
      profile.getCurrent(),
      jobs.getByUser(),
      jobs.getAppliedJobs(),
      jobs.getAcceptedJobs(),
      threads.getAll(),
    ])

  if (profileResult.status === 'fulfilled') currentProfile = profileResult.value
  if (myJobsResult.status === 'fulfilled') myJobs = myJobsResult.value
  if (appliedJobsResult.status === 'fulfilled') appliedJobs = appliedJobsResult.value
  if (acceptedJobsResult.status === 'fulfilled') acceptedJobs = acceptedJobsResult.value
  if (myThreadsResult.status === 'fulfilled') myThreads = myThreadsResult.value

  // Resolve current user's avatar for "Your Posted Gigs"
  let currentAvatar: string | null = null
  if (currentProfile?.profile_picture) {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const { resolveProfilePictureSignedUrl } = await import('@/lib/profile-picture-signed-url')
    currentAvatar = await resolveProfilePictureSignedUrl(createAdminClient(), currentProfile.profile_picture)
  }

  // Fetch poster names + avatars for applied/accepted jobs in one batch query (admin bypasses RLS)
  const otherJobPosterIds = [
    ...new Set([...appliedJobs, ...acceptedJobs].map((j) => Number(j.posted_by)).filter(Boolean)),
  ]
  const posterNames: Record<string, string> = {}
  const posterAvatars: Record<string, string | null> = {}
  if (otherJobPosterIds.length > 0) {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const { resolveProfilePictureSignedUrl } = await import('@/lib/profile-picture-signed-url')
    const supabase = createAdminClient()
    const { data: posterProfiles } = await supabase
      .from('Profile')
      .select('id, Username, profile_picture')
      .in('id', otherJobPosterIds)
    await Promise.all(
      (posterProfiles ?? []).map(async (p) => {
        const key = String(p.id)
        posterNames[key] = p.Username
        posterAvatars[key] = await resolveProfilePictureSignedUrl(supabase, p.profile_picture)
      })
    )
  }

  return (
    <div className="flex flex-col gap-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-fg tracking-tight">Dashboard</h1>
          <p className="text-muted mt-1 text-sm">
            Welcome back{currentProfile ? `, ${currentProfile.Username}` : ''}
          </p>
        </div>
        <Link href="/jobs/new">
          <Button className="px-5 py-2.5">+ Post a Gig</Button>
        </Link>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Posted Gigs', value: myJobs.length },
          { label: 'Applied To', value: appliedJobs.length },
          { label: 'Accepted', value: acceptedJobs.length },
          { label: 'Threads', value: myThreads.length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-edge bg-raised px-4 py-3 flex flex-col gap-1">
            <span className="text-2xl font-extrabold text-fg">{value}</span>
            <span className="text-xs text-muted">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Main two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left: job sections (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Your Posted Gigs */}
          <section className="rounded-2xl border border-edge bg-raised/50 p-5">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Your Posted Gigs</h2>
            {myJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                {myJobs.map((job) => (
                  <JobCard key={job.id} job={job} posterName={currentProfile?.Username} posterAvatar={currentAvatar} showApplicantBadge />
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-muted/60 mb-3">You haven&apos;t posted any gigs yet.</p>
                <Link href="/jobs/new">
                  <Button variant="secondary" className="text-xs px-4 py-1.5">Post your first gig</Button>
                </Link>
              </div>
            )}
          </section>

          {/* Applied + Accepted side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="rounded-2xl border border-edge bg-raised/50 p-5">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Applied To</h2>
              {appliedJobs.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {appliedJobs.map((job) => (
                    <JobCard key={job.id} job={job} posterName={posterNames[String(job.posted_by)]} posterAvatar={posterAvatars[String(job.posted_by)]} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted/60 py-4 text-center">No applications yet.</p>
              )}
            </section>

            <section className="rounded-2xl border border-edge bg-raised/50 p-5">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Accepted</h2>
              {acceptedJobs.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {acceptedJobs.map((job) => (
                    <JobCard key={job.id} job={job} posterName={posterNames[String(job.posted_by)]} posterAvatar={posterAvatars[String(job.posted_by)]} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted/60 py-4 text-center">No accepted jobs yet.</p>
              )}
            </section>
          </div>
        </div>

        {/* Right: threads sidebar (1/3) */}
        <section className="rounded-2xl border border-edge bg-raised/50 p-5">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Active Threads</h2>
          <ThreadList threads={myThreads} />
        </section>

      </div>
    </div>
  )
}
