import { createClient } from '@/lib/supabase/server'
import type { Skill } from '@/types'

export const skill = {
  async create(name: string, explicit: boolean): Promise<Skill> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Skill')
      .insert({ name, explicit })
      .select()
      .single()
    if (error) throw error
    return data as Skill
  },

  async getAll(): Promise<Skill[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Skill')
      .select('*')
      .order('name', { ascending: true })
    if (error) throw error
    return data as Skill[]
  },

  async getByID(skillId: number): Promise<Skill> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Skill')
      .select('*')
      .eq('skill_id', skillId)
      .single()
    if (error) throw error
    return data as Skill
  },

  async update(skillId: number, fields: Partial<Skill>): Promise<Skill> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Skill')
      .update(fields)
      .eq('skill_id', skillId)
      .select()
      .single()
    if (error) throw error
    return data as Skill
  },

  async delete(skillId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase.from('Skill').delete().eq('skill_id', skillId)
    if (error) throw error
    return true
  },
}

export const pskillHolder = {
  async addSkillToProfile(uid: number, skillId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('Skill-holder')
      .insert({ userid: uid, skillid: skillId })
    if (error) throw error
    return true
  },

  async removeSkillFromProfile(uid: number, skillId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('Skill-holder')
      .delete()
      .eq('userid', uid)
      .eq('skillid', skillId)
    if (error) throw error
    return true
  },

  async getSkillsForProfile(uid: number): Promise<Skill[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Skill-holder')
      .select('"Skill"(*)')
      .eq('userid', uid)
    if (error) throw error
    return (data ?? []).map(
      (row) => (row as Record<string, unknown>)['Skill'] as Skill
    )
  },
}

export const jskillHolder = {
  async addSkillToJob(jobId: number, skillId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('Job-skills')
      .insert({ job_id: jobId, skill_id: skillId })
    if (error) throw error
    return true
  },

  async removeSkillFromJob(jobId: number, skillId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('Job-skills')
      .delete()
      .eq('job_id', jobId)
      .eq('skill_id', skillId)
    if (error) throw error
    return true
  },

  async getSkillsForJob(jobId: number): Promise<Skill[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Job-skills')
      .select('"Skill"(*)')
      .eq('job_id', jobId)
    if (error) throw error
    return (data ?? []).map(
      (row) => (row as Record<string, unknown>)['Skill'] as Skill
    )
  },
}
