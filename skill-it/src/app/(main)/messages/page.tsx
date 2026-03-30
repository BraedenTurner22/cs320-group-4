'use client'

import { useEffect, useState } from 'react'
import type { MessageThread } from '@/types'
import ThreadList from '@/components/threads/ThreadList'

export default function MessagesPage() {
  const [threadsList, setThreadsList] = useState<MessageThread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/threads')
        if (res.ok) {
          setThreadsList(await res.json())
        }
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
      <h1 className="text-3xl font-extrabold text-gray-900">Messages</h1>
      {loading ? (
        <p className="text-sm text-gray-400">Loading threads...</p>
      ) : (
        <ThreadList threads={threadsList} />
      )}
    </div>
  )
}
