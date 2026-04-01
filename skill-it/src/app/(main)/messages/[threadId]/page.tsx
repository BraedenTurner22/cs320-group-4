'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import type { Message, MessageThread, UserProfile } from '@/types'
import MessageBubble from '@/components/threads/MessageBubble'
import MessageInput from '@/components/threads/MessageInput'

export default function ThreadDetailPage() {
  const { threadId } = useParams<{ threadId: string }>()
  const [thread, setThread] = useState<MessageThread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentProfileId, setCurrentProfileId] = useState<number>(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/threads/${threadId}/messages`)
    if (res.ok) {
      setMessages(await res.json())
    }
  }, [threadId])

  useEffect(() => {
    async function init() {
      // Get current user's profile id
      try {
        const profileRes = await fetch('/api/profile')
        if (profileRes.ok) {
          const prof: UserProfile = await profileRes.json()
          setCurrentProfileId(prof.id)
        }
      } catch {
        // Not authenticated
      }

      const threadRes = await fetch(`/api/threads/${threadId}`)
      if (threadRes.ok) setThread(await threadRes.json())

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
      <div className="border-b border-gray-200 pb-3 mb-4">
        <h1 className="text-xl font-bold text-gray-900">
          {thread?.['Thread name'] ?? 'Loading...'}
        </h1>
        {thread && (
          <p className="text-sm text-gray-400">Job #{thread.job}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.MessageId}
            message={msg}
            isCurrentUser={msg.Sender === currentProfileId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-200 pt-4">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  )
}
