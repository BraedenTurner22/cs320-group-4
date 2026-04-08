'use client'

import type { MessageThread } from '@/types'
import Link from 'next/link'
import UnreadBadge from '@/components/threads/UnreadBadge'

type ThreadListProps = {
  threads: MessageThread[]
  unreadByThread?: Record<number, number>
  /** When set (e.g. Messages page), show job title under thread name with larger type; else `Job #id`. */
  jobTitleByJobId?: Record<number, string>
  /** When true with `jobTitleByJobId`, second line shows “Loading…” until titles are ready. */
  jobTitlesLoading?: boolean
}

export default function ThreadList({
  threads,
  unreadByThread = {},
  jobTitleByJobId,
  jobTitlesLoading = false,
}: ThreadListProps) {
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
              <span className="text-muted text-[calc(0.75rem+2pt)]">
                {jobTitleByJobId !== undefined && jobTitlesLoading
                  ? 'Loading...'
                  : (jobTitleByJobId?.[thread.job] ?? `Job #${thread.job}`)}
              </span>
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
