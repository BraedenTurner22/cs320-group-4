'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
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

type NavbarProfileMenuProps = {
  onLogout: () => void | Promise<void>
}

export default function NavbarProfileMenu({ onLogout }: NavbarProfileMenuProps) {
  const [prof, setProf] = useState<UserProfile | null>(null)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

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

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close()
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])

  const name = prof?.Username ?? 'User'

  async function handleLogout() {
    close()
    await onLogout()
  }

  // return (
  //   <div ref={rootRef} className="relative ml-1 shrink-0">
  //     <button
  //       type="button"
  //       onClick={() => setOpen((v) => !v)}
  //       aria-expanded={open}
  //       aria-haspopup="menu"
  //       aria-label="Account menu"
  //       className="flex shrink-0 items-center rounded-full ring-2 ring-transparent transition-all hover:ring-ember/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember/50 focus-visible:ring-offset-2 focus-visible:ring-offset-high"
  //     >
  //       <ProfileAvatar name={name} imageUrl={prof?.profile_picture} size="md" />
  //     </button>

  //     {open && (
  //       <div
  //         role="menu"
  //         aria-orientation="vertical"
  //         className="absolute right-0 top-full z-[60] mt-5 min-w-[12rem] overflow-hidden rounded-xl border border-edge bg-high/95 py-1 shadow-lg shadow-black/20 backdrop-blur-md"
  //       >
  //         <Link
  //           href="/profile/picture"
  //           role="menuitem"
  //           onClick={close}
  //           className="block px-4 py-2.5 text-left text-sm font-medium text-fg hover:bg-raised transition-colors"
  //         >
  //           Edit Profile
  //         </Link>
  //         <Link
  //           href="/profile/settings"
  //           role="menuitem"
  //           onClick={close}
  //           className="block px-4 py-2.5 text-left text-sm font-medium text-fg hover:bg-raised transition-colors"
  //         >
  //           User Settings (TODO)
  //         </Link>
  //         <button
  //           type="button"
  //           role="menuitem"
  //           onClick={() => void handleLogout()}
  //           className="flex w-full justify-start px-4 py-2.5 text-left text-sm font-medium text-fg hover:bg-raised transition-colors"
  //         >
  //           Log out
  //         </button>
  //       </div>
  //     )}
  //   </div>
  // )
  return (
    <div ref={rootRef} className="relative ml-1 shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="flex shrink-0 items-center rounded-full ring-2 ring-transparent transition-all hover:ring-ember/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember/50 focus-visible:ring-offset-2 focus-visible:ring-offset-high"
      >
        <ProfileAvatar name={name} imageUrl={prof?.profile_picture} size="md" />
      </button>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full z-[60] mt-5 min-w-[12rem] overflow-hidden rounded-xl border border-edge bg-high/95 py-1 shadow-lg shadow-black/20 backdrop-blur-md"
        >
          <Link
            href="/profile/edit"
            role="menuitem"
            onClick={close}
            className="block px-4 py-2.5 text-left text-sm font-medium text-fg hover:bg-raised transition-colors"
          >
            Edit Profile
          </Link>
          <Link
            href="/profile/picture"
            role="menuitem"
            onClick={close}
            className="block px-4 py-2.5 text-left text-sm font-medium text-fg hover:bg-raised transition-colors"
          >
            Change Picture
          </Link>
          <Link
            href="/profile/settings"
            role="menuitem"
            onClick={close}
            className="block px-4 py-2.5 text-left text-sm font-medium text-fg hover:bg-raised transition-colors"
          >
            User Settings (TODO)
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => void handleLogout()}
            className="flex w-full justify-start px-4 py-2.5 text-left text-sm font-medium text-fg hover:bg-raised transition-colors"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
