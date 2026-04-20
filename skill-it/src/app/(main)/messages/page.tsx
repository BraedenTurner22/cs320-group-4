'use client'

import { useCallback, useEffect, useState } from 'react'
import { useMessagingUnread } from '@/components/providers/MessagingUnreadProvider'
import type { Job, MessageThread } from '@/types'
import MessagesJobGroups from '@/components/threads/MessagesJobGroups'

export default function MessagesPage() {
  const { unreadByThread } = useMessagingUnread()
  const [threadsList, setThreadsList] = useState<MessageThread[]>([])
  const [jobTitleByJobId, setJobTitleByJobId] = useState<Record<number, string>>({})
  const [jobParticipantsByJobId, setJobParticipantsByJobId] = useState<
    Record<number, number[]>
  >({})
  const [jobTitlesLoading, setJobTitlesLoading] = useState(false)
  const [loadingThreads, setLoadingThreads] = useState(true)

  const loadThreads = useCallback(async () => {
    setLoadingThreads(true)
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
    } finally {
      setJobTitlesLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadThreads()
  }, [loadThreads])

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-fg tracking-tight">Messages</h1>
        <p className="text-muted text-sm mt-1">Your active conversations</p>
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
