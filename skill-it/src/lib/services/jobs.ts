import { createClient } from '@/lib/supabase/server'
import type { Job, Review, MessageThread, UserProfile } from '@/types'

async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Not authenticated')
  return { supabase, user }
}

export const jobs = {
  // Fetching
  async getAll(): Promise<Job[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('jobs')
      .select('*, associated_skills:job_skills(skill:skills(*)), category:categories(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Job[]
  },

  async getOneByID(jobId: number): Promise<Job> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('jobs')
      .select('*, associated_skills:job_skills(skill:skills(*)), category:categories(*)')
      .eq('job_id', jobId)
      .single()
    if (error) throw error
    return data as Job
  },

  async getByCategory(category: string): Promise<Job[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('jobs')
      .select('*, associated_skills:job_skills(skill:skills(*)), category:categories!inner(*)')
      .eq('categories.name', category)
    if (error) throw error
    return data as Job[]
  },

  async getBySkills(skills: string[]): Promise<Job[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('jobs')
      .select('*, associated_skills:job_skills!inner(skill:skills!inner(*)), category:categories(*)')
      .in('job_skills.skills.name', skills)
    if (error) throw error
    return data as Job[]
  },

  async getByStatus(completed: boolean): Promise<Job[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('jobs')
      .select('*, associated_skills:job_skills(skill:skills(*)), category:categories(*)')
      .eq('completed', completed)
    if (error) throw error
    return data as Job[]
  },

  async getByUser(userId: string): Promise<Job[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('jobs')
      .select('*, associated_skills:job_skills(skill:skills(*)), category:categories(*)')
      .eq('posted_by', userId)
    if (error) throw error
    return data as Job[]
  },

  // Lifecycle
  async create(
    title: string,
    description: string,
    categoryId: number,
    skills: number[],
    headerImage?: string
  ): Promise<Job> {
    const { supabase, user } = await getUser()

    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        title,
        description,
        category: categoryId,
        header: headerImage,
        posted_by: user.id,
        completed: false,
      })
      .select()
      .single()
    if (error) throw error

    if (skills.length > 0) {
      const skillRows = skills.map((skillId) => ({
        job_id: job.job_id,
        skill_id: skillId,
      }))
      const { error: skillError } = await supabase
        .from('job_skills')
        .insert(skillRows)
      if (skillError) throw skillError
    }

    return job as Job
  },

  async update(jobId: number, fields: Partial<Job>): Promise<Job> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('jobs')
      .update(fields)
      .eq('job_id', jobId)
      .select()
      .single()
    if (error) throw error
    return data as Job
  },

  async delete(jobId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase.from('jobs').delete().eq('job_id', jobId)
    if (error) throw error
    return true
  },

  async markComplete(jobId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('jobs')
      .update({ completed: true })
      .eq('job_id', jobId)
    if (error) throw error
    return true
  },

  // Worker requests
  async requestWork(jobId: number): Promise<boolean> {
    const { supabase, user } = await getUser()
    const { error } = await supabase
      .from('job_requests')
      .insert({ job_id: jobId, user_id: user.id })
    if (error) throw error
    return true
  },

  async withdrawRequest(jobId: number): Promise<boolean> {
    const { supabase, user } = await getUser()
    const { error } = await supabase
      .from('job_requests')
      .delete()
      .eq('job_id', jobId)
      .eq('user_id', user.id)
    if (error) throw error
    return true
  },

  async getPendingRequests(jobId: number): Promise<UserProfile[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('job_requests')
      .select('user:profiles(*)')
      .eq('job_id', jobId)
    if (error) throw error
    return (data ?? []).map((r) => r.user) as unknown as UserProfile[]
  },

  async acceptWorker(jobId: number, userId: string): Promise<Job> {
    const supabase = await createClient()

    const { error: insertError } = await supabase
      .from('job_workers')
      .insert({ job_id: jobId, user_id: userId })
    if (insertError) throw insertError

    const { error: deleteError } = await supabase
      .from('job_requests')
      .delete()
      .eq('job_id', jobId)
      .eq('user_id', userId)
    if (deleteError) throw deleteError

    return this.getOneByID(jobId)
  },

  async removeWorker(jobId: number, userId: string): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('job_workers')
      .delete()
      .eq('job_id', jobId)
      .eq('user_id', userId)
    if (error) throw error
    return true
  },

  // Related
  async getReviews(jobId: number): Promise<Review[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('associated_job', jobId)
    if (error) throw error
    return data as Review[]
  },

  async getThreads(jobId: number): Promise<MessageThread[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('message_threads')
      .select('*')
      .eq('job', jobId)
    if (error) throw error
    return data as MessageThread[]
  },
}
