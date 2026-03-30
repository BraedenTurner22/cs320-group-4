'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import type { Message, MessageThread } from '@/types'
import MessageBubble from '@/components/threads/MessageBubble'
import MessageInput from '@/components/threads/MessageInput'
import { createClient } from '@/lib/supabase/client'

export default function ThreadDetailPage() {
  const { threadId } = useParams<{ threadId: string }>()
  const [thread, setThread] = useState<MessageThread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/threads/${threadId}/messages`)
    if (res.ok) {
      setMessages(await res.json())
    }
  }, [threadId])

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)

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
          {thread?.thread_name ?? 'Loading...'}
        </h1>
        {thread && (
          <p className="text-sm text-gray-400">Job #{thread.job}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.message_id}
            message={msg}
            isCurrentUser={msg.sender === currentUserId}
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
