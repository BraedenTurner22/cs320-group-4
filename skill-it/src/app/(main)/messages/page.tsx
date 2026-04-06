'use client'

import { useEffect, useState } from 'react'
import { useMessagingUnread } from '@/components/providers/MessagingUnreadProvider'
import type { MessageThread } from '@/types'
import ThreadList from '@/components/threads/ThreadList'

export default function MessagesPage() {
  const { unreadByThread } = useMessagingUnread()
  const [threadsList, setThreadsList] = useState<MessageThread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/threads')
        if (res.ok) setThreadsList(await res.json())
      } catch {
        // Ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-fg tracking-tight">Messages</h1>
        <p className="text-muted text-sm mt-1">Your active conversations</p>
      </div>
      {loading ? (
        <p className="text-sm text-muted/60">Loading threads...</p>
      ) : (
        <ThreadList threads={threadsList} unreadByThread={unreadByThread} />
      )}
    </div>
  )
}
