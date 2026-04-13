'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import JobForm from '@/components/jobs/JobForm'
import CreateCategoryPopup from '@/components/jobs/CreateCategoryPopup'
import Button from '@/components/ui/Button'
import type { Category, Skill } from '@/types'


export default function NewJobPage() {
  const router = useRouter()
  // retrieves list of categories
  const [categories, setCategories] = useState<Category[]>([])
  // retrieves list of skill
  const [skills, setSkills] = useState<Skill[]>([])
  // whether the category creation tab is open
  const [isCreateCategoryOpen, setCreateCategoryOpen] = useState(false)

  // default categories
  const [defCategory, setDefCategory] = useState(0)

  // retrieves skills and categories from api
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

  // handle job creation 
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

  // after category is created, update the list of categories and pass the new category back
  // as the default selected option for the form.
  function handleCategoryCreated(category: Category) {
    setCategories((current) => [...current, category])
    setDefCategory(category.id)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-fg tracking-tight">Post a New Gig</h1>
            <p className="text-muted text-sm mt-1">Fill out the details below to find the right person</p>
          </div>
        </div>
      </div>

      <JobForm
        categories={categories}
        skills={skills}
        onSubmit={handleSubmit}
        onCreateCategory={() => setCreateCategoryOpen(true)}
        defCategory = {defCategory}
        setDefCategory = {setDefCategory}

      />

      <CreateCategoryPopup
        open={isCreateCategoryOpen}
        onClose={() => setCreateCategoryOpen(false)}
        onCreated={handleCategoryCreated}
      />
    </div>
  )
}
