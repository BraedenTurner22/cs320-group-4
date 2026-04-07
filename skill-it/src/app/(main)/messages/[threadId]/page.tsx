'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useMessagingUnread } from '@/components/providers/MessagingUnreadProvider'
import type { Message, MessageThread, UserProfile } from '@/types'
import MessageBubble from '@/components/threads/MessageBubble'
import MessageInput from '@/components/threads/MessageInput'
import { markThreadUpTo } from '@/lib/messaging-read-cookie'

export default function ThreadDetailPage() {
  const { threadId } = useParams<{ threadId: string }>()
  const { refresh: refreshUnread } = useMessagingUnread()
  const [thread, setThread] = useState<MessageThread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentProfileId, setCurrentProfileId] = useState<number>(0)
  const [userMap, setUserMap] = useState<Record<number, string>>({})
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastMarkedMaxRef = useRef<number | null>(null)
  const numericThreadId = Number(threadId)

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/threads/${threadId}/messages`)
    if (res.ok) setMessages(await res.json())
  }, [threadId])

  useEffect(() => {
    async function init() {
      setMessages([])
      setThread(null)
      // Current user
      try {
        const profileRes = await fetch('/api/profile')
        if (profileRes.ok) {
          const prof: UserProfile = await profileRes.json()
          setCurrentProfileId(prof.id)
        }
      } catch { /* Not authenticated */ }

      // Thread info
      const threadRes = await fetch(`/api/threads/${threadId}`)
      if (threadRes.ok) setThread(await threadRes.json())

      // Participants → id:name map
      const usersRes = await fetch(`/api/threads/${threadId}/users`)
      if (usersRes.ok) {
        const users: UserProfile[] = await usersRes.json()
        const map: Record<number, string> = {}
        users.filter(Boolean).forEach((u) => { map[u.id] = u.Username })
        setUserMap(map)
      }

      await fetchMessages()
    }
    init()
  }, [threadId, fetchMessages])

  useEffect(() => {
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    lastMarkedMaxRef.current = null
  }, [numericThreadId])

  useEffect(() => {
    if (!Number.isFinite(numericThreadId)) return
    if (
      messages.length > 0 &&
      messages.some((m) => m.message_thread !== numericThreadId)
    ) {
      return
    }
    const maxId =
      messages.length === 0 ? 0 : Math.max(...messages.map((m) => m.MessageId))
    markThreadUpTo(numericThreadId, maxId)
    if (lastMarkedMaxRef.current !== maxId) {
      lastMarkedMaxRef.current = maxId
      void refreshUnread()
    }
  }, [messages, numericThreadId, refreshUnread])

  async function handleSend(content: string) {
    const res = await fetch(`/api/threads/${threadId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    if (!res.ok) throw new Error('Failed to send')
    await fetchMessages()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Thread header */}
      <div className="border-b border-edge pb-4 mb-4">
        <h1 className="text-xl font-bold text-fg">
          {thread?.['Thread name'] ?? 'Loading...'}
        </h1>
        {thread && (
          <p className="text-xs text-muted mt-0.5">Job #{thread.job}</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-4">
        {messages.length === 0 && (
          <p className="text-center text-muted/50 text-sm py-8">No messages yet — say hello!</p>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.MessageId}
            message={msg}
            isCurrentUser={msg.Sender === currentProfileId}
            senderName={msg.Sender !== currentProfileId ? userMap[msg.Sender] : undefined}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-edge pt-4">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  )
}
