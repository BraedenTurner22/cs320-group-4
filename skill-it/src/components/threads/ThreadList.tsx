'use client'

import type { MessageThread } from '@/types'
import Link from 'next/link'
import UnreadBadge from '@/components/threads/UnreadBadge'

type ThreadListProps = {
  threads: MessageThread[]
  unreadByThread?: Record<number, number>
}

export default function ThreadList({ threads, unreadByThread = {} }: ThreadListProps) {
  if (threads.length === 0) {
    return <p className="text-sm text-muted/60 py-4">No threads yet.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {threads.map((thread) => (
        <Link key={thread.id} href={`/messages/${thread.id}`}>
          <div className="group relative flex items-center justify-between rounded-xl border border-edge bg-raised px-4 py-3 pr-12 transition-all duration-200 hover:border-ember/40 hover:bg-high cursor-pointer">
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
            <UnreadBadge
              count={unreadByThread[thread.id] ?? 0}
              className="absolute right-3 top-1/2 -translate-y-1/2 scale-90"
            />
          </div>
        </Link>
      ))}
    </div>
  )
}
