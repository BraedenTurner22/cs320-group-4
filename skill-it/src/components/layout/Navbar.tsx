'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useMessagingUnread } from '@/components/providers/MessagingUnreadProvider'
import NavbarProfileMenu from '@/components/layout/NavbarProfileMenu'
import UnreadBadge from '@/components/threads/UnreadBadge'
import ThemeToggle from '@/components/ui/ThemeToggle'

type NavbarProps = {
  isLoggedIn: boolean
}

// function navItemClass(active: boolean) {
//   return [
//     'rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 border',
//     active
//       ? 'bg-ember text-white border-transparent shadow-sm'
//       : 'border-transparent text-muted hover:text-fg hover:bg-raised',
//   ].join(' ')
// }

function navItemClass(active: boolean) {
  return [
    'rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 border',
    active
      ? 'bg-white text-ember border-transparent shadow-sm'
      : 'border-transparent text-white hover:bg-white/10',
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
    // <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-edge bg-white/90 backdrop-blur-md px-6 py-3">
    //   <Link href="/dashboard" className="flex items-center gap-2">
    //     <Image src="/skillit_logo.png" alt="Skill-It logo" width={48} height={48} className="rounded-sm w-[48px] h-[48px]" />
    //     {/* <span className="text-2xl font-extrabold text-ember tracking-tight">
    //       Skill<span className="text-fg">-It</span>
    //     </span> */}
    //     <div className="text-2xl font-extrabold tracking-tight [-webkit-text-stroke:var(--logo-stroke)]">
    //       <span className="text-[color:var(--logo-skill-color)]">Skill</span>
    //       <span className="text-[color:var(--logo-it-color)]">-It</span>
    //     </div>
    //   </Link>

  <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-ember-dark bg-ember text-white px-6 py-3 shadow-sm">
    <Link href="/dashboard" className="flex items-center gap-2">
      <Image src="/skillit_logo.png" alt="Skill-It logo" width={48} height={48} className="rounded-sm w-[48px] h-[48px]" />
      <div className="text-2xl font-extrabold tracking-tight text-white">
        <span>Skill</span>
        <span>-It</span>
      </div>
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
            <ThemeToggle />
            <NavbarProfileMenu onLogout={handleLogout} />
          </div>
        </div>
      )}
    </nav>
  )
}
