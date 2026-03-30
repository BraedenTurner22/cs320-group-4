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
      {threads.map((thread) => {
        const lastMessage = thread.messages?.[thread.messages.length - 1]
        return (
          <Link key={thread.thread_id} href={`/messages/${thread.thread_id}`}>
            <Card hover className="cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h4 className="font-semibold text-gray-900">
                    {thread.thread_name}
                  </h4>
                  {lastMessage && (
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {lastMessage.content}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    Job #{thread.job}
                  </span>
                  {thread.archived && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      Archived
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
