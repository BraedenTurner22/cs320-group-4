import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
          radial-gradient(ellipse 70% 55% at 88% 2%, rgba(236,108,4,0.18) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 5% 95%, rgba(58,47,65,0.22) 0%, transparent 55%),
          #0E0D0C
        `,
      }}
    >
      <Navbar isLoggedIn={true} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
