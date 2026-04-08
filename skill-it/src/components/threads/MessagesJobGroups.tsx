'use client'

import type { MessageThread } from '@/types'
import Link from 'next/link'
import JobGroupNewThreadButton from '@/components/threads/JobGroupNewThreadButton'
import UnreadBadge from '@/components/threads/UnreadBadge'

type MessagesJobGroupsProps = {
  threads: MessageThread[]
  unreadByThread?: Record<number, number>
  jobTitleByJobId: Record<number, string>
  jobTitlesLoading: boolean
  jobParticipantsByJobId: Record<number, number[]>
  onThreadCreated?: () => void
}

function groupThreadsByJobOrder(threads: MessageThread[]): [number, MessageThread[]][] {
  const map = new Map<number, MessageThread[]>()
  const order: number[] = []
  for (const t of threads) {
    if (!map.has(t.job)) {
      order.push(t.job)
      map.set(t.job, [])
    }
    map.get(t.job)!.push(t)
  }
  return order.map((jobId) => [jobId, map.get(jobId)!])
}

function jobHeading(
  jobId: number,
  jobTitleByJobId: Record<number, string>,
  jobTitlesLoading: boolean,
) {
  if (jobTitlesLoading) return 'Loading...'
  return jobTitleByJobId[jobId] ?? `Job #${jobId}`
}

export default function MessagesJobGroups({
  threads,
  unreadByThread = {},
  jobTitleByJobId,
  jobTitlesLoading,
  jobParticipantsByJobId,
  onThreadCreated,
}: MessagesJobGroupsProps) {
  if (threads.length === 0) {
    return <p className="text-sm text-muted/60 py-4">No threads yet.</p>
  }

  const groups = groupThreadsByJobOrder(threads)

  return (
    <div className="grid w-full max-w-full grid-cols-1 gap-5 md:grid-cols-2 md:items-start">
      {groups.map(([jobId, jobThreads]) => (
        <section
          key={jobId}
          className="min-w-0 rounded-2xl border border-edge bg-high/80 overflow-hidden shadow-lg shadow-black/20"
        >
          <div className="flex items-start justify-between gap-2 border-b border-edge bg-raised/90 px-4 py-3 sm:px-5 sm:py-4">
            <h2 className="min-w-0 flex-1 text-base font-bold leading-snug tracking-tight text-fg break-words sm:text-lg">
              {jobHeading(jobId, jobTitleByJobId, jobTitlesLoading)}
            </h2>
            <JobGroupNewThreadButton
              jobId={jobId}
              jobLabel={
                jobTitlesLoading
                  ? `Job #${jobId}`
                  : (jobTitleByJobId[jobId] ?? `Job #${jobId}`)
              }
              participantIds={jobParticipantsByJobId[jobId]}
              disabled={jobTitlesLoading}
              onCreated={onThreadCreated}
            />
          </div>
          <div className="flex flex-col divide-y divide-edge/80 p-2">
            {jobThreads.map((thread) => (
              <Link key={thread.id} href={`/messages/${thread.id}`}>
                <div className="group relative flex items-center justify-between rounded-xl px-4 py-3 pr-12 transition-colors hover:bg-raised cursor-pointer">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <h3 className="font-medium text-fg text-sm group-hover:text-ember transition-colors truncate">
                      {thread['Thread name']}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
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
        </section>
      ))}
    </div>
  )
}
