'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PROFILE_PICTURE_UPDATED_EVENT } from '@/lib/profile-picture-events'
import type { UserProfile } from '@/types'
import ProfileAvatar from '@/components/ui/ProfileAvatar'

async function fetchCurrentProfile(): Promise<UserProfile | null> {
  try {
    const res = await fetch('/api/profile')
    if (!res.ok) return null
    return (await res.json()) as UserProfile
  } catch {
    return null
  }
}

export default function NavbarProfileAvatar() {
  const [prof, setProf] = useState<UserProfile | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const data = await fetchCurrentProfile()
      if (!cancelled && data) setProf(data)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onUpdated = () => {
      void fetchCurrentProfile().then((data) => {
        if (data) setProf(data)
      })
    }
    window.addEventListener(PROFILE_PICTURE_UPDATED_EVENT, onUpdated)
    return () => window.removeEventListener(PROFILE_PICTURE_UPDATED_EVENT, onUpdated)
  }, [])

  const name = prof?.Username ?? 'User'

  return (
    <Link
      href="/profile/picture"
      className="ml-1 flex shrink-0 items-center rounded-full ring-2 ring-transparent transition-all hover:ring-ember/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember/50 focus-visible:ring-offset-2 focus-visible:ring-offset-high"
      aria-label="Edit profile picture"
      title="Profile picture"
    >
      <ProfileAvatar name={name} imageUrl={prof?.profile_picture} size="md" />
    </Link>
  )
}
