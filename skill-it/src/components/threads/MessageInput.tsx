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
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5 pb-3">
      <textarea
        rows={1}
        className="box-border h-9 min-h-9 max-h-9 flex-1 resize-none overflow-y-auto rounded-lg border border-edge bg-high px-2 py-1.5 text-sm leading-snug text-fg placeholder:text-muted/50 outline-none transition-all duration-200 focus:border-ember/60 focus:ring-2 focus:ring-ember/50"
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
        className="inline-flex h-9 shrink-0 items-center justify-center !px-4 !py-0 text-sm"
      >
        Send
      </Button>
    </form>
  )
}
