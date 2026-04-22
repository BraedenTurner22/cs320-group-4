'use client'

import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

type ReviewCardProps = {
  rating: number
  feedback: string
  subject: string
}

export default function ReviewCard({ rating, feedback, subject }: ReviewCardProps) {
  return (
    <Card hover>
      <div className="flex flex-col gap-3">
        {/* Subject and Rating */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-base text-fg leading-snug">
            Review for {subject}
          </h3>
          <Badge color="orange">
            {rating}/5
          </Badge>
        </div>

        {/* Feedback */}
        <p className="text-sm text-muted leading-relaxed">
          {feedback}
        </p>
      </div>
    </Card>
  )
}