'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

type NavbarProps = {
  isLoggedIn: boolean
}

export default function Navbar({ isLoggedIn }: NavbarProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md px-6 py-3">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-violet-500 to-amber-500 bg-clip-text text-transparent">
          Skill-It
        </span>
      </Link>

      {isLoggedIn && (
        <div className="flex items-center gap-6">
          <Link
            href="/jobs"
            className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Jobs
          </Link>
          <Link
            href="/messages"
            className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Messages
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Dashboard
          </Link>
          <Button variant="ghost" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      )}
    </nav>
  )
}
