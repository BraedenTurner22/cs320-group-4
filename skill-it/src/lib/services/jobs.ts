import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { profile } from '@/lib/services/profile'
import type { Job, MessageThread, UserProfile } from '@/types'

async function getAuthProfile() {
  const supabase = await createClient()
  const current = await profile.getCurrent()
  return { supabase, profileId: current.id }
}

export const jobs = {
  // Fetching
  async getAll(): Promise<Job[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Job')
      .select('*, associated_skills:"Job-skills"("Skill"(*)), category:"Category-holder"("Category"(*))')
      .order('created_at', { ascending: false })
    if (error) throw error
    // Flatten the nested category from junction table (Category-holder returns array, take first)
    return (data ?? []).map((job) => ({
      ...job,
      category: job.category?.[0]?.Category ?? null,
      associated_skills: (job.associated_skills ?? []).map((js: { Skill: unknown }) => js.Skill),
    })) as Job[]
  },

  async getOneByID(jobId: number): Promise<Job> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Job')
      .select('*, associated_skills:"Job-skills"("Skill"(*)), category:"Category-holder"("Category"(*))')
      .eq('id', jobId)
      .single()
    if (error) throw error
    return {
      ...data,
      category: data.category?.[0]?.Category ?? null,
      associated_skills: (data.associated_skills ?? []).map((js: { Skill: unknown }) => js.Skill),
    } as Job
  },

  async getByCategory(category: string): Promise<Job[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Job')
      .select('*, associated_skills:"Job-skills"("Skill"(*)), category:"Category-holder"!inner("Category"!inner(*))')
      .eq('"Category-holder"."Category".name', category)
    if (error) throw error
    return (data ?? []).map((job) => ({
      ...job,
      category: job.category?.[0]?.Category ?? null,
      associated_skills: (job.associated_skills ?? []).map((js: { Skill: unknown }) => js.Skill),
    })) as Job[]
  },

  async getBySkills(skills: string[]): Promise<Job[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Job')
      .select('*, associated_skills:"Job-skills"!inner("Skill"!inner(*)), category:"Category-holder"("Category"(*))')
      .in('"Job-skills"."Skill".name', skills)
    if (error) throw error
    return (data ?? []).map((job) => ({
      ...job,
      category: job.category?.[0]?.Category ?? null,
      associated_skills: (job.associated_skills ?? []).map((js: { Skill: unknown }) => js.Skill),
    })) as Job[]
  },

  async getByStatus(completed: boolean): Promise<Job[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Job')
      .select('*, associated_skills:"Job-skills"("Skill"(*)), category:"Category-holder"("Category"(*))')
      .eq('completed', completed)
    if (error) throw error
    return (data ?? []).map((job) => ({
      ...job,
      category: job.category?.[0]?.Category ?? null,
      associated_skills: (job.associated_skills ?? []).map((js: { Skill: unknown }) => js.Skill),
    })) as Job[]
  },

  async getByUser(): Promise<Job[]> {
    const { supabase, profileId } = await getAuthProfile()
    const { data, error } = await supabase
      .from('Job')
      .select('*, associated_skills:"Job-skills"("Skill"(*)), category:"Category-holder"("Category"(*))')
      .eq('posted_by', profileId)
    if (error) throw error
    return (data ?? []).map((job) => ({
      ...job,
      category: job.category?.[0]?.Category ?? null,
      associated_skills: (job.associated_skills ?? []).map((js: { Skill: unknown }) => js.Skill),
    })) as Job[]
  },

  async getAppliedJobs(): Promise<Job[]> {
    const { supabase, profileId } = await getAuthProfile()
    const id = Number(profileId)
    const { data, error } = await supabase
      .from('Job')
      .select('*, associated_skills:"Job-skills"("Skill"(*)), category:"Category-holder"("Category"(*))')
      .filter('pending_requests', 'cs', `{${id}}`)
    if (error) throw error
    return (data ?? []).map((job) => ({
      ...job,
      category: job.category?.[0]?.Category ?? null,
      associated_skills: (job.associated_skills ?? []).map((js: { Skill: unknown }) => js.Skill),
    })) as Job[]
  },

  async getAcceptedJobs(): Promise<Job[]> {
    const { supabase, profileId } = await getAuthProfile()
    const id = Number(profileId)
    const { data, error } = await supabase
      .from('Job')
      .select('*, associated_skills:"Job-skills"("Skill"(*)), category:"Category-holder"("Category"(*))')
      .filter('accepted_workers', 'cs', `{${id}}`)
    if (error) throw error
    return (data ?? []).map((job) => ({
      ...job,
      category: job.category?.[0]?.Category ?? null,
      associated_skills: (job.associated_skills ?? []).map((js: { Skill: unknown }) => js.Skill),
    })) as Job[]
  },

  // Lifecycle
  async create(
    title: string,
    description: string,
    categoryId: number,
    skills: number[]
  ): Promise<Job> {
    const { supabase, profileId } = await getAuthProfile()

    const { data: job, error } = await supabase
      .from('Job')
      .insert({
        title,
        description,
        posted_by: profileId,
        completed: false,
      })
      .select()
      .single()
    if (error) throw error

    // Link category via Category-holder junction
    if (categoryId) {
      const { error: catError } = await supabase
        .from('Category-holder')
        .insert({ job_id: job.id, category_id: categoryId })
      if (catError) throw catError
    }

    // Link skills via Job-skills junction
    if (skills.length > 0) {
      const skillRows = skills.map((skillId) => ({
        job_id: job.id,
        skill_id: skillId,
      }))
      const { error: skillError } = await supabase
        .from('Job-skills')
        .insert(skillRows)
      if (skillError) throw skillError
    }

    return job as Job
  },

  async update(jobId: number, fields: Partial<Pick<Job, 'title' | 'description' | 'completed'>>): Promise<Job> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Job')
      .update(fields)
      .eq('id', jobId)
      .select()
      .single()
    if (error) throw error
    return data as Job
  },

  async delete(jobId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase.from('Job').delete().eq('id', jobId)
    if (error) throw error
    return true
  },

  async markComplete(jobId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('Job')
      .update({ completed: true })
      .eq('id', jobId)
    if (error) throw error
    return true
  },

  // Worker requests (pending_requests is an int8 array on Job)
  async requestWork(jobId: number): Promise<boolean> {
    const { supabase, profileId } = await getAuthProfile()
    const { data: job, error: fetchError } = await supabase
      .from('Job')
      .select('pending_requests')
      .eq('id', jobId)
      .single()
    if (fetchError) throw fetchError

    const current: number[] = job.pending_requests ?? []
    if (current.includes(profileId)) return true

    const { error } = await supabase
      .from('Job')
      .update({ pending_requests: [...current, profileId] })
      .eq('id', jobId)
    if (error) throw error
    return true
  },

  async withdrawRequest(jobId: number): Promise<boolean> {
    const { supabase, profileId } = await getAuthProfile()
    const { data: job, error: fetchError } = await supabase
      .from('Job')
      .select('pending_requests')
      .eq('id', jobId)
      .single()
    if (fetchError) throw fetchError

    const current: number[] = job.pending_requests ?? []
    const { error } = await supabase
      .from('Job')
      .update({ pending_requests: current.filter((id) => id !== profileId) })
      .eq('id', jobId)
    if (error) throw error
    return true
  },

  async getAcceptedWorkerProfiles(jobId: number): Promise<UserProfile[]> {
    const supabase = createAdminClient()
    const { data: job, error: fetchError } = await supabase
      .from('Job')
      .select('accepted_workers')
      .eq('id', jobId)
      .single()
    if (fetchError) throw fetchError

    const workerIds: number[] = (job.accepted_workers ?? []).map(Number).filter(Boolean)
    if (workerIds.length === 0) return []

    const { data, error } = await supabase
      .from('Profile')
      .select('*')
      .in('id', workerIds)
    if (error) throw error
    return (data ?? []) as UserProfile[]
  },

  async getPendingRequests(jobId: number): Promise<UserProfile[]> {
    // Use admin client for both queries: RLS may block reading the job's
    // pending_requests array and reading other users' profiles
    const supabase = createAdminClient()
    const { data: job, error: fetchError } = await supabase
      .from('Job')
      .select('pending_requests')
      .eq('id', jobId)
      .single()
    if (fetchError) throw fetchError

    // int8 arrays come back as strings — coerce to numbers
    const requestIds: number[] = (job.pending_requests ?? []).map(Number).filter(Boolean)
    if (requestIds.length === 0) return []

    const { data, error } = await supabase
      .from('Profile')
      .select('*')
      .in('id', requestIds)
    if (error) throw error
    return (data ?? []) as UserProfile[]
  },

  async denyWorker(jobId: number, profileId: number): Promise<boolean> {
    const supabase = await createClient()
    const { data: job, error: fetchError } = await supabase
      .from('Job')
      .select('pending_requests')
      .eq('id', jobId)
      .single()
    if (fetchError) throw fetchError

    const pending = (job.pending_requests ?? []).filter((id: number) => id !== profileId)
    const { error } = await supabase
      .from('Job')
      .update({ pending_requests: pending })
      .eq('id', jobId)
    if (error) throw error
    return true
  },

  async acceptWorker(jobId: number, profileId: number): Promise<Job> {
    const supabase = await createClient()
    const { data: job, error: fetchError } = await supabase
      .from('Job')
      .select('pending_requests, accepted_workers')
      .eq('id', jobId)
      .single()
    if (fetchError) throw fetchError

    const pendingRequests: number[] = (job.pending_requests ?? []).filter(
      (id: number) => id !== profileId
    )
    const acceptedWorkers: number[] = [...(job.accepted_workers ?? []), profileId]

    const { error } = await supabase
      .from('Job')
      .update({ pending_requests: pendingRequests, accepted_workers: acceptedWorkers })
      .eq('id', jobId)
    if (error) throw error

    return this.getOneByID(jobId)
  },

  async removeWorker(jobId: number, profileId: number): Promise<boolean> {
    const supabase = await createClient()
    const { data: job, error: fetchError } = await supabase
      .from('Job')
      .select('accepted_workers')
      .eq('id', jobId)
      .single()
    if (fetchError) throw fetchError

    const acceptedWorkers: number[] = (job.accepted_workers ?? []).filter(
      (id: number) => id !== profileId
    )
    const { error } = await supabase
      .from('Job')
      .update({ accepted_workers: acceptedWorkers })
      .eq('id', jobId)
    if (error) throw error
    return true
  },

  // Related
  async getThreads(jobId: number): Promise<MessageThread[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Message Thread')
      .select('*')
      .eq('job', jobId)
    if (error) throw error
    return data as MessageThread[]
  },
}
