import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MainAppShell from '@/components/layout/MainAppShell'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Onboarding gate: new users who haven't filled in their profile yet
  const { data: profileRow } = await supabase
    .from('Profile')
    .select('Description, Major, Graduation_Year')
    .eq('auth_uid', user.id)
    .single()

  const needsOnboarding =
    !profileRow ||
    (profileRow.Description == null &&
      profileRow.Major == null &&
      profileRow.Graduation_Year == null)

  if (needsOnboarding) redirect('/onboarding')

  return <MainAppShell>{children}</MainAppShell>
}
