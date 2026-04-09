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
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <textarea
        rows={1}
        className="box-border h-10 min-h-10 max-h-10 flex-1 resize-none overflow-y-auto rounded-xl border border-edge bg-high px-4 py-2 text-sm leading-5 text-fg placeholder:text-muted/50 outline-none transition-all duration-200 focus:border-ember/60 focus:ring-2 focus:ring-ember/50"
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
      <Button
        type="submit"
        disabled={sending || !content.trim()}
        className="inline-flex h-10 shrink-0 items-center justify-center px-5 py-0"
      >
        Send
      </Button>
    </form>
  )
}
