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
          radial-gradient(ellipse 56% 44% at 88% 2%, rgba(136,17,36,0.18) 0%, transparent 55%),
          radial-gradient(ellipse 40% 32% at 5% 95%, rgba(136,17,36,0.16) 0%, transparent 55%),
          radial-gradient(ellipse 40% 32% at 14% 12%, rgba(136,17,36,0.12) 0%, transparent 55%),
          radial-gradient(ellipse 56% 44% at 62% 38%, rgba(136,17,36,0.1) 0%, transparent 55%),
          radial-gradient(ellipse 40% 32% at 94% 72%, rgba(136,17,36,0.14) 0%, transparent 55%),
          radial-gradient(ellipse 56% 44% at 32% 88%, rgba(74,10,18,0.14) 0%, transparent 55%),
          #0E0D0C
        `,
      }}
    >
      <Navbar isLoggedIn={true} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
