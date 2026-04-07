'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMessagingUnread } from '@/components/providers/MessagingUnreadProvider'
import UnreadBadge from '@/components/threads/UnreadBadge'
import Button from '@/components/ui/Button'

type NavbarProps = {
  isLoggedIn: boolean
}

export default function Navbar({ isLoggedIn }: NavbarProps) {
  const router = useRouter()
  const unread = useMessagingUnread()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-edge bg-high/80 backdrop-blur-md px-6 py-3">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="text-2xl font-extrabold text-ember tracking-tight">
          Skill<span className="text-fg">-It</span>
        </span>
      </Link>

      {isLoggedIn && (
        <div className="flex items-center gap-1">
          <Link
            href="/jobs"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-fg hover:bg-raised transition-all duration-150"
          >
            Jobs
          </Link>
          <span className="relative inline-flex items-center">
            <Link
              href="/messages"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-fg hover:bg-raised transition-all duration-150"
            >
              Messages
            </Link>
            <UnreadBadge
              count={unread.totalUnread}
              className="absolute -right-0.5 -top-0.5 scale-90"
            />
          </span>
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-fg hover:bg-raised transition-all duration-150"
          >
            Dashboard
          </Link>
          <div className="ml-2 pl-2 border-l border-edge">
            <Button variant="ghost" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
