'use client'

import type { UserProfile } from '@/types'
import ProfileAvatar from '@/components/ui/ProfileAvatar'

export type ParticipantChip = Pick<UserProfile, 'id' | 'Username' | 'profile_picture'>

type ParticipantChipsProps = {
  participants: ParticipantChip[]
  listClassName?: string
  /** e.g. "People in your conversations" vs "People in this thread" */
  ariaLabel?: string
}

export default function ParticipantChips({
  participants,
  listClassName = '',
  ariaLabel = 'People in this conversation',
}: ParticipantChipsProps) {
  if (participants.length === 0) return null
  return (
    <ul
      className={`flex flex-wrap gap-3 ${listClassName}`}
      aria-label={ariaLabel}
    >
      {participants.map((u) => (
        <li
          key={u.id}
          className="flex max-w-[5.5rem] flex-col items-center gap-1"
        >
          <ProfileAvatar
            name={u.Username}
            imageUrl={u.profile_picture}
            size="md"
          />
          <span className="w-full truncate text-center text-[10px] leading-tight text-muted">
            {u.Username}
          </span>
        </li>
      ))}
    </ul>
  )
}
