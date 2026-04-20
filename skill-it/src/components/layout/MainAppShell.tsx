'use client'

import type { ReactNode } from 'react'
import Navbar from '@/components/layout/Navbar'
import { MessagingUnreadProvider } from '@/components/providers/MessagingUnreadProvider'

type MainAppShellProps = {
  children: ReactNode
}

export default function MainAppShell({ children }: MainAppShellProps) {
  return (
    <div className="min-h-screen bg-surface">
      <MessagingUnreadProvider>
        <Navbar isLoggedIn={true} />
        <main className="mx-auto max-w-6xl px-4 pt-8 pb-[calc(2rem-2pt)]">{children}</main>
      </MessagingUnreadProvider>
    </div>
  )
}
