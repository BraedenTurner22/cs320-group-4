import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/types'

export const category = {
  async create(name: string, explicit: boolean): Promise<Category> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Category')
      .insert({ name, explicit })
      .select()
      .single()
    if (error) throw error
    return data as Category
  },

  async getAll(): Promise<Category[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Category')
      .select('*')
      .order('name', { ascending: true })
    if (error) throw error
    return data as Category[]
  },

  async getByID(categoryId: number): Promise<Category> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Category')
      .select('*')
      .eq('id', categoryId)
      .single()
    if (error) throw error
    return data as Category
  },

  async update(categoryId: number, fields: Partial<Category>): Promise<Category> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Category')
      .update(fields)
      .eq('id', categoryId)
      .select()
      .single()
    if (error) throw error
    return data as Category
  },

  async delete(categoryId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase.from('Category').delete().eq('id', categoryId)
    if (error) throw error
    return true
  },
}

export const categoryHolder = {
  async setCategoryForJob(jobId: number, categoryId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('Category-holder')
      .insert({ job_id: jobId, category_id: categoryId })
    if (error) throw error
    return true
  },

  async getCategoryForJob(jobId: number): Promise<Category> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Category-holder')
      .select('"Category"(*)')
      .eq('job_id', jobId)
      .single()
    if (error) throw error
    return (data as Record<string, unknown>)['Category'] as Category
  },

  async removeCategoryFromJob(jobId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('Category-holder')
      .delete()
      .eq('job_id', jobId)
    if (error) throw error
    return true
  },
}
