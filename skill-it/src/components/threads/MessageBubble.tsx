'use client'

import type { Message } from '@/types'
import ProfileAvatar from '@/components/ui/ProfileAvatar'

type MessageBubbleProps = {
  message: Message
  isCurrentUser: boolean
  senderName: string
  senderAvatarUrl?: string | null
}

export default function MessageBubble({
  message,
  isCurrentUser,
  senderName,
  senderAvatarUrl,
}: MessageBubbleProps) {
  const bubble = (
    <div
      className={`w-fit max-w-full rounded-2xl px-4 py-2.5 text-sm ${
        isCurrentUser
          ? 'rounded-br-md bg-ember text-white shadow-md shadow-ember/20'
          : 'rounded-bl-md border border-edge bg-raised text-fg'
      }`}
    >
      <p className="leading-relaxed">{message.Content}</p>
      <p
        className={`mt-0.5 text-[10px] ${
          isCurrentUser ? 'text-white/60' : 'text-muted/60'
        }`}
      >
        {new Date(message.sent_on).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  )

  const avatar = (
    <div className="shrink-0 self-end pb-0.5">
      <ProfileAvatar name={senderName} imageUrl={senderAvatarUrl} size="sm" />
    </div>
  )

  if (isCurrentUser) {
    return (
      <div className="flex w-full justify-end">
        <div className="flex max-w-full min-w-0 items-end gap-2">
          <div className="flex min-w-0 flex-col items-end">{bubble}</div>
          {avatar}
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full justify-start">
      <div className="flex max-w-full min-w-0 flex-1 items-end gap-2">
        {avatar}
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <span className="px-1 text-[11px] text-muted">{senderName}</span>
          {bubble}
        </div>
      </div>
    </div>
  )
}
