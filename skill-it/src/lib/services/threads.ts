import { createClient } from '@/lib/supabase/server'
import { profile } from '@/lib/services/profile'
import type { MessageThread, Message, UserProfile } from '@/types'

async function getAuthProfile() {
  const supabase = await createClient()
  const current = await profile.getCurrent()
  return { supabase, profileId: current.id }
}

export const threads = {
  // Thread management
  async getAll(): Promise<MessageThread[]> {
    const { supabase, profileId } = await getAuthProfile()
    // Get threads where this user is a member via the "Thread users" junction table
    const { data, error } = await supabase
      .from('Thread users')
      .select('"Message Thread"(*)')
      .eq('user_id', profileId)
    if (error) throw error
    // Flatten: each row is { "Message Thread": {...} }
    const threadList = (data ?? [])
      .map((row) => (row as Record<string, unknown>)['Message Thread'] as MessageThread)
      .filter((t) => !t.Archived)
      .sort((a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime())
    return threadList
  },

  async getOneByID(threadId: number): Promise<MessageThread> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Message Thread')
      .select('*')
      .eq('id', threadId)
      .single()
    if (error) throw error
    return data as MessageThread
  },

  async create(jobId: number, userIds: number[], threadName: string): Promise<MessageThread> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Message Thread')
      .insert({
        job: jobId,
        'Thread name': threadName,
        Archived: false,
      })
      .select()
      .single()
    if (error) throw error

    // Add users to the thread via "Thread users" junction table
    if (userIds.length > 0) {
      const userRows = userIds.map((userId) => ({
        thread_id: data.id,
        user_id: userId,
      }))
      const { error: userError } = await supabase
        .from('Thread users')
        .insert(userRows)
      if (userError) throw userError
    }

    return data as MessageThread
  },

  async archive(threadId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('Message Thread')
      .update({ Archived: true })
      .eq('id', threadId)
    if (error) throw error
    return true
  },

  async rename(threadId: number, name: string): Promise<MessageThread> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Message Thread')
      .update({ 'Thread name': name })
      .eq('id', threadId)
      .select()
      .single()
    if (error) throw error
    return data as MessageThread
  },

  // Messages
  async getMessages(threadId: number): Promise<Message[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Message')
      .select('*')
      .eq('message_thread', threadId)
      .order('sent_on', { ascending: true })
    if (error) throw error
    return data as Message[]
  },

  async sendMessage(threadId: number, content: string): Promise<Message> {
    const { supabase, profileId } = await getAuthProfile()
    const { data, error } = await supabase
      .from('Message')
      .insert({
        message_thread: threadId,
        Content: content,
        Sender: profileId,
      })
      .select()
      .single()
    if (error) throw error
    return data as Message
  },

  async deleteMessage(threadId: number, messageId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('Message')
      .delete()
      .eq('MessageId', messageId)
      .eq('message_thread', threadId)
    if (error) throw error
    return true
  },

  // Participants (via "Thread users" junction table)
  async getUsers(threadId: number): Promise<UserProfile[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Thread users')
      .select('"Profile"(*)')
      .eq('thread_id', threadId)
    if (error) throw error
    return (data ?? []).map(
      (row) => (row as Record<string, unknown>)['Profile'] as UserProfile
    )
  },

  async addUser(threadId: number, userId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('Thread users')
      .insert({ thread_id: threadId, user_id: userId })
    if (error) throw error
    return true
  },

  async removeUser(threadId: number, userId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('Thread users')
      .delete()
      .eq('thread_id', threadId)
      .eq('user_id', userId)
    if (error) throw error
    return true
  },

  // Utility
  async getByJob(jobId: number): Promise<MessageThread[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Message Thread')
      .select('*')
      .eq('job', jobId)
    if (error) throw error
    return data as MessageThread[]
  },

  async getUnread(): Promise<MessageThread[]> {
    const { supabase, profileId } = await getAuthProfile()
    // Get non-archived threads for this user via junction table
    const { data, error } = await supabase
      .from('Thread users')
      .select('"Message Thread"(*)')
      .eq('user_id', profileId)
    if (error) throw error
    return (data ?? [])
      .map((row) => (row as Record<string, unknown>)['Message Thread'] as MessageThread)
      .filter((t) => !t.Archived)
  },
}
