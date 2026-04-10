'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMessagingUnread } from '@/components/providers/MessagingUnreadProvider'
import NavbarProfileMenu from '@/components/layout/NavbarProfileMenu'
import UnreadBadge from '@/components/threads/UnreadBadge'

type NavbarProps = {
  isLoggedIn: boolean
}

function navItemClass(active: boolean) {
  return [
    'rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 border',
    active
      ? 'border-ember/35 bg-ember/[0.09] text-ember shadow-[inset_0_0_0_1px_rgba(220,38,38,0.12)]'
      : 'border-transparent text-muted hover:text-fg hover:bg-raised',
  ].join(' ')
}

export default function Navbar({ isLoggedIn }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const unread = useMessagingUnread()

  const jobsActive = pathname === '/jobs' || pathname.startsWith('/jobs/')
  const messagesActive =
    pathname === '/messages' || pathname.startsWith('/messages/')
  const dashboardActive =
    pathname === '/dashboard' || pathname.startsWith('/dashboard/')

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
            className={navItemClass(jobsActive)}
            aria-current={jobsActive ? 'page' : undefined}
          >
            Jobs
          </Link>
          <span className="relative inline-flex items-center">
            <Link
              href="/messages"
              className={navItemClass(messagesActive)}
              aria-current={messagesActive ? 'page' : undefined}
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
            className={navItemClass(dashboardActive)}
            aria-current={dashboardActive ? 'page' : undefined}
          >
            Dashboard
          </Link>
          <div className="ml-2 flex items-center gap-2 pl-2 border-l border-edge">
            <NavbarProfileMenu onLogout={handleLogout} />
          </div>
        </div>
      )}
    </nav>
  )
}
