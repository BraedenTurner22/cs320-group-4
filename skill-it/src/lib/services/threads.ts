import { createClient } from '@/lib/supabase/server'
import type { MessageThread, Message, UserProfile } from '@/types'

async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Not authenticated')
  return { supabase, user }
}

export const threads = {
  // Thread management
  async getAll(): Promise<MessageThread[]> {
    const { supabase, user } = await getUser()
    const { data, error } = await supabase
      .from('message_threads')
      .select('*')
      .contains('users', [user.id])
      .eq('archived', false)
      .order('created_on', { ascending: false })
    if (error) throw error
    return data as MessageThread[]
  },

  async getOneByID(threadId: number): Promise<MessageThread> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('message_threads')
      .select('*')
      .eq('thread_id', threadId)
      .single()
    if (error) throw error
    return data as MessageThread
  },

  async create(jobId: number, userIds: string[], threadName: string): Promise<MessageThread> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('message_threads')
      .insert({
        job: jobId,
        users: userIds,
        thread_name: threadName,
        archived: false,
      })
      .select()
      .single()
    if (error) throw error
    return data as MessageThread
  },

  async archive(threadId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('message_threads')
      .update({ archived: true })
      .eq('thread_id', threadId)
    if (error) throw error
    return true
  },

  async rename(threadId: number, name: string): Promise<MessageThread> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('message_threads')
      .update({ thread_name: name })
      .eq('thread_id', threadId)
      .select()
      .single()
    if (error) throw error
    return data as MessageThread
  },

  // Messages
  async getMessages(threadId: number): Promise<Message[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('sent_on', { ascending: true })
    if (error) throw error
    return data as Message[]
  },

  async sendMessage(threadId: number, content: string): Promise<Message> {
    const { supabase, user } = await getUser()
    const { data, error } = await supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        content,
        sender: user.id,
      })
      .select()
      .single()
    if (error) throw error
    return data as Message
  },

  async deleteMessage(threadId: number, messageId: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('message_id', messageId)
      .eq('thread_id', threadId)
    if (error) throw error
    return true
  },

  // Participants
  async getUsers(threadId: number): Promise<UserProfile[]> {
    const supabase = await createClient()
    const thread = await this.getOneByID(threadId)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('uid', thread.users)
    if (error) throw error
    return data as unknown as UserProfile[]
  },

  async addUser(threadId: number, userId: string): Promise<MessageThread> {
    const supabase = await createClient()
    const thread = await this.getOneByID(threadId)
    const updatedUsers = [...thread.users, userId]
    const { data, error } = await supabase
      .from('message_threads')
      .update({ users: updatedUsers })
      .eq('thread_id', threadId)
      .select()
      .single()
    if (error) throw error
    return data as MessageThread
  },

  async removeUser(threadId: number, userId: string): Promise<boolean> {
    const supabase = await createClient()
    const thread = await this.getOneByID(threadId)
    const updatedUsers = thread.users.filter((id) => id !== userId)
    const { error } = await supabase
      .from('message_threads')
      .update({ users: updatedUsers })
      .eq('thread_id', threadId)
    if (error) throw error
    return true
  },

  // Utility
  async getByJob(jobId: number): Promise<MessageThread[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('message_threads')
      .select('*')
      .eq('job', jobId)
    if (error) throw error
    return data as MessageThread[]
  },

  async getUnread(): Promise<MessageThread[]> {
    const { supabase, user } = await getUser()
    // TODO: requires an unread tracking table/column — returning all non-archived for now
    const { data, error } = await supabase
      .from('message_threads')
      .select('*')
      .contains('users', [user.id])
      .eq('archived', false)
    if (error) throw error
    return data as MessageThread[]
  },
}
