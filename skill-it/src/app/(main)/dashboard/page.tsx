import { createClient } from '@/lib/supabase/server'
import { jobs } from '@/lib/services/jobs'
import { threads } from '@/lib/services/threads'
import JobCard from '@/components/jobs/JobCard'
import ThreadList from '@/components/threads/ThreadList'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let myJobs: Awaited<ReturnType<typeof jobs.getByUser>> = []
  let myThreads: Awaited<ReturnType<typeof threads.getAll>> = []

  try {
    myJobs = await jobs.getByUser(user!.id)
  } catch {
    // Supabase table may not exist yet
  }

  try {
    myThreads = await threads.getAll()
  } catch {
    // Supabase table may not exist yet
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user!.email}</p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Your Posted Gigs</h2>
          <Link href="/jobs/new">
            <Button>Post a Gig</Button>
          </Link>
        </div>
        {myJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myJobs.map((job) => (
              <JobCard key={job.job_id} job={job} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">You haven&apos;t posted any gigs yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Active Threads</h2>
        <ThreadList threads={myThreads} />
      </section>

      <Link href="/jobs">
        <Button variant="secondary" className="w-fit">
          Browse All Jobs
        </Button>
      </Link>
    </div>
  )
}
