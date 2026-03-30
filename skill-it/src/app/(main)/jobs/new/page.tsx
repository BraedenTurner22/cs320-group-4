'use client'

import { useRouter } from 'next/navigation'
import JobForm from '@/components/jobs/JobForm'

export default function NewJobPage() {
  const router = useRouter()

  // TODO: Fetch categories and skills from API when tables exist
  const categories: { category_id: number; name: string; explicit: boolean }[] = []
  const skills: { skill_id: number; name: string; explicit: boolean }[] = []

  async function handleSubmit(data: {
    title: string
    description: string
    categoryId: number
    skills: number[]
    header?: string
  }) {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to create job')
    }
    const job = await res.json()
    router.push(`/jobs/${job.job_id}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-gray-900">Post a New Gig</h1>
      <JobForm categories={categories} skills={skills} onSubmit={handleSubmit} />
    </div>
  )
}
