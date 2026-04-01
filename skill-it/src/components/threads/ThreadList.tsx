'use client'

import type { MessageThread } from '@/types'
import Card from '@/components/ui/Card'
import Link from 'next/link'

type ThreadListProps = {
  threads: MessageThread[]
}

export default function ThreadList({ threads }: ThreadListProps) {
  if (threads.length === 0) {
    return <p className="text-sm text-gray-400 py-4">No threads yet.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {threads.map((thread) => (
        <Link key={thread.id} href={`/messages/${thread.id}`}>
          <Card hover className="cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h4 className="font-semibold text-gray-900">
                  {thread['Thread name']}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  Job #{thread.job}
                </span>
                {thread.Archived && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    Archived
                  </span>
                )}
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
