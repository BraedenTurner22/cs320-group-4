'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Message } from '@/types'
import ProfileAvatar from '@/components/ui/ProfileAvatar'

const HOVER_DELAY_MS = 200

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
  const sent = new Date(message.sent_on)
  const dateTimeLabel = sent.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const [hoverRevealed, setHoverRevealed] = useState(false)
  const [focused, setFocused] = useState(false)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearHoverTimer = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }, [])

  useEffect(() => () => clearHoverTimer(), [clearHoverTimer])

  const handleMouseEnter = useCallback(() => {
    clearHoverTimer()
    hoverTimerRef.current = setTimeout(() => {
      hoverTimerRef.current = null
      setHoverRevealed(true)
    }, HOVER_DELAY_MS)
  }, [clearHoverTimer])

  const handleMouseLeave = useCallback(() => {
    clearHoverTimer()
    setHoverRevealed(false)
  }, [clearHoverTimer])

  const showMeta = hoverRevealed || focused

  const bubbleLift = showMeta
    ? '-translate-y-0.5 shadow-lg'
    : ''

  const bubbleBase = `w-fit max-w-full rounded-2xl px-4 py-2.5 text-sm transition-[transform,box-shadow] duration-200 ${bubbleLift}`

  const bubble = (
    <div
      className={`${bubbleBase} ${
        isCurrentUser
          ? `rounded-br-md bg-ember text-white shadow-md shadow-ember/20 ${
              showMeta ? 'shadow-ember/30' : ''
            }`
          : `rounded-bl-md border border-edge bg-raised text-fg ${
              showMeta ? 'shadow-black/10' : ''
            }`
      }`}
    >
      <p className="leading-relaxed">{message.Content}</p>
      <p
        className={`mt-0.5 text-[10px] ${showMeta ? 'block' : 'hidden'} ${
          isCurrentUser ? 'text-white/80' : 'text-muted'
        }`}
      >
        {dateTimeLabel}
      </p>
    </div>
  )

  const avatar = (
    <div className="shrink-0 self-end pb-0.5">
      <ProfileAvatar name={senderName} imageUrl={senderAvatarUrl} size="sm" />
    </div>
  )

  const metaLabel = `${isCurrentUser ? 'You' : senderName}. ${dateTimeLabel}.`

  const groupShell =
    'flex w-fit max-w-full min-w-0 items-end gap-2 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface'

  const interactiveProps = {
    tabIndex: 0 as const,
    role: 'article' as const,
    'aria-label': metaLabel,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  }

  if (isCurrentUser) {
    return (
      <div className="flex w-full justify-end">
        <div
          {...interactiveProps}
          className={`${groupShell} focus-visible:ring-ember/50`}
        >
          <div className="flex min-w-0 flex-col items-end">{bubble}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full justify-start">
      <div
        {...interactiveProps}
        className={`${groupShell} focus-visible:ring-ember/40`}
      >
        {avatar}
        <div className="flex min-w-0 flex-col items-start gap-1">
          <span
            className={`max-w-full truncate px-1 text-[11px] text-muted ${
              showMeta ? 'block' : 'hidden'
            }`}
          >
            {senderName}
          </span>
          {bubble}
        </div>
      </div>
    </div>
  )
}
