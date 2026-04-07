'use client'

import type { CSSProperties, ReactNode } from 'react'
import Navbar from '@/components/layout/Navbar'
import { MessagingUnreadProvider } from '@/components/providers/MessagingUnreadProvider'

type MainAppShellProps = {
  children: ReactNode
  shellStyle: CSSProperties
}

export default function MainAppShell({ children, shellStyle }: MainAppShellProps) {
  return (
    <div className="min-h-screen" style={shellStyle}>
      <MessagingUnreadProvider>
        <Navbar isLoggedIn={true} />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </MessagingUnreadProvider>
    </div>
  )
}
