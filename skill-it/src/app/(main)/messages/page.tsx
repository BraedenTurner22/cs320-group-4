'use client'

import { useCallback, useEffect, useState } from 'react'
import { useMessagingUnread } from '@/components/providers/MessagingUnreadProvider'
import type { Job, MessageThread, UserProfile } from '@/types'
import MessagesJobGroups from '@/components/threads/MessagesJobGroups'
import ParticipantChips from '@/components/threads/ParticipantChips'

export default function MessagesPage() {
  const { unreadByThread } = useMessagingUnread()
  const [threadsList, setThreadsList] = useState<MessageThread[]>([])
  const [jobTitleByJobId, setJobTitleByJobId] = useState<Record<number, string>>({})
  const [jobParticipantsByJobId, setJobParticipantsByJobId] = useState<
    Record<number, number[]>
  >({})
  const [jobTitlesLoading, setJobTitlesLoading] = useState(false)
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [headerPeople, setHeaderPeople] = useState<UserProfile[]>([])

  const loadThreads = useCallback(async () => {
    setLoadingThreads(true)
    setHeaderPeople([])
    setJobTitlesLoading(false)
    let threads: MessageThread[] = []
    try {
      const res = await fetch('/api/threads')
      if (res.ok) {
        threads = await res.json()
        setThreadsList(threads)
      }
    } catch {
      // Ignore
    } finally {
      setLoadingThreads(false)
    }

    if (threads.length === 0) {
      return
    }

    setJobTitleByJobId({})
    setJobParticipantsByJobId({})
    setJobTitlesLoading(true)
    const jobIds = [...new Set(threads.map((t) => t.job))]
    const titles: Record<number, string> = {}
    const participants: Record<number, number[]> = {}
    try {
      await Promise.all(
        jobIds.map(async (jobId) => {
          try {
            const jobRes = await fetch(`/api/jobs/${jobId}`)
            if (jobRes.ok) {
              const job: Job = await jobRes.json()
              titles[jobId] = job.title
              const ids = new Set<number>()
              ids.add(job.posted_by)
              for (const id of job.accepted_workers ?? []) ids.add(id)
              participants[jobId] = [...ids]
            }
          } catch {
            /* ignore */
          }
        }),
      )
      setJobTitleByJobId(titles)
      setJobParticipantsByJobId(participants)

      let currentUserId = 0
      try {
        const meRes = await fetch('/api/profile')
        if (meRes.ok) {
          const me = (await meRes.json()) as UserProfile
          currentUserId = me.id
        }
      } catch {
        /* ignore */
      }

      const unionIds = [...new Set(Object.values(participants).flat())]
      if (unionIds.length > 0) {
        try {
          const profRes = await fetch('/api/profiles/by-ids', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: unionIds }),
          })
          if (profRes.ok) {
            const list = (await profRes.json()) as UserProfile[]
            setHeaderPeople(
              list
                .filter(Boolean)
                .filter((u) => currentUserId <= 0 || u.id !== currentUserId)
                .sort((a, b) =>
                  (a.Username ?? '').localeCompare(b.Username ?? '', undefined, {
                    sensitivity: 'base',
                  }),
                ),
            )
          }
        } catch {
          /* ignore */
        }
      }
    } finally {
      setJobTitlesLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadThreads()
  }, [loadThreads])

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-extrabold text-fg tracking-tight">Messages</h1>
          <p className="text-muted text-sm mt-1">Your active conversations</p>
        </div>
        <ParticipantChips
          participants={headerPeople}
          listClassName="shrink-0 sm:justify-end sm:pt-1"
          ariaLabel="People on jobs you have conversations for"
        />
      </div>
      {loadingThreads ? (
        <p className="text-sm text-muted/60">Loading threads...</p>
      ) : (
        <MessagesJobGroups
          threads={threadsList}
          unreadByThread={unreadByThread}
          jobTitleByJobId={jobTitleByJobId}
          jobTitlesLoading={jobTitlesLoading}
          jobParticipantsByJobId={jobParticipantsByJobId}
          onThreadCreated={() => void loadThreads()}
        />
      )}
    </div>
  )
}
