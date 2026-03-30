import { jobs } from '@/lib/services/jobs'
import JobsClient from './jobs-client'

export default async function JobsPage() {
  let allJobs: Awaited<ReturnType<typeof jobs.getAll>> = []
  try {
    allJobs = await jobs.getAll()
  } catch {
    // Table may not exist yet
  }

  // Extract unique categories and skills for filters
  const categories = [
    ...new Set(allJobs.map((j) => j.category?.name).filter(Boolean) as string[]),
  ]
  const skills = [
    ...new Set(
      allJobs.flatMap((j) => j.associated_skills?.map((s) => s.name) ?? [])
    ),
  ]

  return <JobsClient initialJobs={allJobs} categories={categories} skills={skills} />
}
