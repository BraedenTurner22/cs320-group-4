import { createClient } from '@/lib/supabase/server'
import type { UserProfile, Skill, MessageThread } from '@/types'

/**
 * Resolves the current auth user's Profile row.
 * Requires a `auth_uid` column (uuid, unique) on the "Profile" table
 * that references auth.users(id).
 */
async function getAuthUserProfile() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('Profile')
    .select('*')
    .eq('auth_uid', user.id)
    .single()

  if (existing) {
    return { supabase, user, profile: existing as UserProfile }
  }

  // Auto-create profile for new auth users
  const { data: created, error: createError } = await supabase
    .from('Profile')
    .insert({
      auth_uid: user.id,
      Username: user.email?.split('@')[0] ?? 'user',
      Email: user.email ?? '',
      Banned: false,
      Is_Undergrad: true,
    })
    .select()
    .single()
  if (createError) throw new Error('Failed to create profile: ' + createError.message)

  return { supabase, user, profile: created as UserProfile }
}

export const profile = {
  async create(data: Partial<UserProfile> & { auth_uid: string }): Promise<UserProfile> {
    const supabase = await createClient()
    const { data: profile, error } = await supabase
      .from('Profile')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return profile as UserProfile
  },

  async getCurrent(): Promise<UserProfile> {
    const { profile } = await getAuthUserProfile()
    return profile
  },

  async getByID(id: number): Promise<UserProfile> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Profile')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as UserProfile
  },

  async getByAuthUID(authUid: string): Promise<UserProfile> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Profile')
      .select('*')
      .eq('auth_uid', authUid)
      .single()
    if (error) throw error
    return data as UserProfile
  },

  async update(id: number, fields: Partial<UserProfile>): Promise<UserProfile> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Profile')
      .update(fields)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as UserProfile
  },

  async delete(id: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase.from('Profile').delete().eq('id', id)
    if (error) throw error
    return true
  },

  async ban(id: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('Profile')
      .update({ Banned: true })
      .eq('id', id)
    if (error) throw error
    return true
  },

  async unban(id: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('Profile')
      .update({ Banned: false })
      .eq('id', id)
    if (error) throw error
    return true
  },

  async addSkill(id: number, skillId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('Skill-holder')
      .insert({ userid: id, skillid: skillId })
    if (error) throw error
    return true
  },

  async removeSkill(id: number, skillId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('Skill-holder')
      .delete()
      .eq('userid', id)
      .eq('skillid', skillId)
    if (error) throw error
    return true
  },

  async getSkills(id: number): Promise<Skill[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Skill-holder')
      .select('"Skill"(*)')
      .eq('userid', id)
    if (error) throw error
    return (data ?? []).map(
      (row) => (row as Record<string, unknown>)['Skill'] as Skill
    )
  },

  async getThreads(id: number): Promise<MessageThread[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Thread users')
      .select('"Message Thread"(*)')
      .eq('user_id', id)
    if (error) throw error
    return (data ?? []).map(
      (row) => (row as Record<string, unknown>)['Message Thread'] as MessageThread
    )
  },
}
