'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getLastReads, mergeLastReads } from '@/lib/messaging-read-cookie'
import { createClient } from '@/lib/supabase/client'
import type { ThreadMessagingMeta } from '@/lib/services/threads'

async function hasBrowserAuthSession() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return !!session
}

type MessagingUnreadContextValue = {
  totalUnread: number
  unreadByThread: Record<number, number>
  refresh: () => Promise<void>
}

const MessagingUnreadContext = createContext<MessagingUnreadContextValue | null>(null)

async function loadUnreadSnapshot() {
  if (!(await hasBrowserAuthSession())) {
    return { totalUnread: 0, unreadByThread: {} as Record<number, number> }
  }

  const metaRes = await fetch('/api/threads/messaging-meta')
  if (!metaRes.ok) throw new Error('messaging-meta failed')
  const meta: ThreadMessagingMeta[] = await metaRes.json()

  const reads = getLastReads()
  const patch: Record<number, number> = {}
  for (const row of meta) {
    if (reads[row.threadId] === undefined) {
      patch[row.threadId] = row.latestMessageId
    }
  }
  if (Object.keys(patch).length > 0) {
    mergeLastReads(patch)
  }

  const lastRead = getLastReads()
  const countRes = await fetch('/api/threads/unread-counts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lastRead }),
  })
  if (!countRes.ok) throw new Error('unread-counts failed')
  const { counts } = (await countRes.json()) as { counts: Record<string, number> }

  const unreadByThread: Record<number, number> = {}
  let totalUnread = 0
  for (const [k, v] of Object.entries(counts)) {
    const id = Number(k)
    const n = Number(v)
    if (!Number.isFinite(id) || !Number.isFinite(n)) continue
    unreadByThread[id] = n
    totalUnread += n
  }
  return { totalUnread, unreadByThread }
}

export function MessagingUnreadProvider({ children }: { children: ReactNode }) {
  const [totalUnread, setTotalUnread] = useState(0)
  const [unreadByThread, setUnreadByThread] = useState<Record<number, number>>({})

  const refresh = useCallback(async () => {
    try {
      const snap = await loadUnreadSnapshot()
      setTotalUnread(snap.totalUnread)
      setUnreadByThread(snap.unreadByThread)
    } catch {
      /* keep previous values */
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setTotalUnread(0)
        setUnreadByThread({})
        return
      }
      if (event === 'SIGNED_IN') {
        void refresh()
      }
    })
    return () => subscription.unsubscribe()
  }, [refresh])

  useEffect(() => {
    void refresh()
    const interval = setInterval(() => void refresh(), 30_000)
    const onVis = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [refresh])

  const value = useMemo(
    () => ({ totalUnread, unreadByThread, refresh }),
    [totalUnread, unreadByThread, refresh],
  )

  return (
    <MessagingUnreadContext.Provider value={value}>{children}</MessagingUnreadContext.Provider>
  )
}

export function useMessagingUnread() {
  const ctx = useContext(MessagingUnreadContext)
  if (!ctx) {
    throw new Error('useMessagingUnread must be used within MessagingUnreadProvider')
  }
  return ctx
}
