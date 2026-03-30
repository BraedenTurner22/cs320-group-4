'use client'

import { useState, FormEvent } from 'react'
import Button from '@/components/ui/Button'

type MessageInputProps = {
  onSend: (content: string) => Promise<void>
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSending(true)
    try {
      await onSend(content)
      setContent('')
    } catch {
      // Error handled by parent
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <textarea
        className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 resize-none min-h-[44px] max-h-[120px]"
        placeholder="Type a message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
          }
        }}
      />
      <Button type="submit" disabled={sending || !content.trim()}>
        Send
      </Button>
    </form>
  )
}
