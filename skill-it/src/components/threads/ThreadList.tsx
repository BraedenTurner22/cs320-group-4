'use client'

import type { MessageThread } from '@/types'
import Link from 'next/link'

type ThreadListProps = {
  threads: MessageThread[]
}

export default function ThreadList({ threads }: ThreadListProps) {
  if (threads.length === 0) {
    return <p className="text-sm text-muted/60 py-4">No threads yet.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {threads.map((thread) => (
        <Link key={thread.id} href={`/messages/${thread.id}`}>
          <div className="group flex items-center justify-between rounded-xl border border-edge bg-raised px-4 py-3 transition-all duration-200 hover:border-ember/40 hover:bg-high cursor-pointer">
            <div className="flex flex-col gap-0.5">
              <h4 className="font-medium text-fg text-sm group-hover:text-ember transition-colors">
                {thread['Thread name']}
              </h4>
              <span className="text-xs text-muted/60">Job #{thread.job}</span>
            </div>
            <div className="flex items-center gap-2">
              {thread.Archived && (
                <span className="rounded-full bg-high border border-edge px-2 py-0.5 text-xs text-muted">
                  Archived
                </span>
              )}
              <span className="text-muted/40 text-xs group-hover:text-ember transition-colors">→</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
