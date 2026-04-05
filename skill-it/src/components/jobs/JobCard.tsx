'use client'

import type { Job } from '@/types'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Link from 'next/link'

type JobCardProps = {
  job: Job
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Card hover>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
          <Badge color={job.completed ? 'gray' : 'green'}>
            {job.completed ? 'Completed' : 'Open'}
          </Badge>
        </div>

        {job.category && (
          <Badge color="violet">{job.category.name}</Badge>
        )}

        {job.associated_skills && job.associated_skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.associated_skills.map((s) => (
              <Badge key={s.skill_id} color="amber">{s.name}</Badge>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-500 line-clamp-2">{job.description}</p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-gray-400">Posted by #{job.posted_by}</span>
          <Link href={`/jobs/${job.id}`}>
            <Button variant="secondary">View</Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
