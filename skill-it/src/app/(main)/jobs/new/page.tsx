'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import JobForm from '@/components/jobs/JobForm'
import type { Category, Skill } from '@/types'

export default function NewJobPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [skills, setSkills] = useState<Skill[]>([])

  useEffect(() => {
    async function load() {
      const [catRes, skillRes] = await Promise.all([
        fetch('/api/category'),
        fetch('/api/skill'),
      ])
      if (catRes.ok) setCategories(await catRes.json())
      if (skillRes.ok) setSkills(await skillRes.json())
    }
    load()
  }, [])

  async function handleSubmit(data: {
    title: string
    description: string
    categoryId: number
    skills: number[]
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
    router.push(`/jobs/${job.id}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-gray-900">Post a New Gig</h1>
      <JobForm categories={categories} skills={skills} onSubmit={handleSubmit} />
    </div>
  )
}
