'use client'

import { useState } from 'react'
import type { Job, JobFilters as Filters } from '@/types'
import JobCard from '@/components/jobs/JobCard'
import JobFilters from '@/components/jobs/JobFilters'
import Button from '@/components/ui/Button'
import Link from 'next/link'

type Props = {
  initialJobs: Job[]
  categories: string[]
  skills: string[]
}

export default function JobsClient({ initialJobs, categories, skills }: Props) {
  const [filters, setFilters] = useState<Filters>({})

  const filtered = initialJobs.filter((job) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (
        !job.title.toLowerCase().includes(q) &&
        !(job.description ?? '').toLowerCase().includes(q)
      )
        return false
    }
    if (filters.category && job.category?.name !== filters.category) return false
    if (filters.completed !== undefined && job.completed !== filters.completed) return false
    if (filters.skills && filters.skills.length > 0) {
      const jobSkillNames = job.associated_skills?.map((s) => s.name) ?? []
      if (!filters.skills.some((s) => jobSkillNames.includes(s))) return false
    }
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900">Browse Jobs</h1>
        <Link href="/jobs/new">
          <Button>Post a Gig</Button>
        </Link>
      </div>

      <JobFilters categories={categories} skills={skills} onChange={setFilters} />

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((job) => (
            <JobCard key={job.job_id} job={job} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 py-8 text-center">No jobs found.</p>
      )}
    </div>
  )
}
