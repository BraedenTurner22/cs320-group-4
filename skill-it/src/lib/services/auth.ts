import { createClient } from '@/lib/supabase/server'
import type { User, Session } from '@supabase/supabase-js'

export const account = {
  async signUp(email: string, password: string, name: string): Promise<User> {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw error
    if (!data.user) throw new Error('Sign up failed: no user returned')
    return data.user
  },

  async logIn(email: string, password: string): Promise<Session> {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (!data.session) throw new Error('Login failed: no session returned')
    return data.session
  },

  async logOut(): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return true
  },
}

export async function passwordReset(email: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
  return true
}

export async function updatePassword(password: string): Promise<User> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.updateUser({ password })
  if (error) throw error
  if (!data.user) throw new Error('Password update failed: no user returned')
  return data.user
}

export async function handleCallback(code: string): Promise<Session> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) throw error
  if (!data.session) throw new Error('Callback failed: no session returned')
  return data.session
}
