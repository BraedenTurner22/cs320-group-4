import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { profile } from '@/lib/services/profile'
import type { MessageThread, Message, UserProfile } from '@/types'

async function canAccessThreadParticipants(
  supabase: SupabaseClient,
  threadId: number,
  profileId: number,
): Promise<boolean> {
  const { data: memRows, error: memErr } = await supabase
    .from('Thread users')
    .select('thread_id')
    .eq('thread_id', threadId)
    .eq('user_id', profileId)
    .limit(1)
  if (memErr) throw memErr
  if (memRows?.length) return true

  const { data: msgRows, error: msgErr } = await supabase
    .from('Message')
    .select('MessageId')
    .eq('message_thread', threadId)
    .limit(1)
  if (msgErr) throw msgErr
  if (msgRows?.length) return true

  const { data: threadRows, error: threadErr } = await supabase
    .from('Message Thread')
    .select('job')
    .eq('id', threadId)
    .limit(1)
  if (threadErr) throw threadErr
  const jobId = threadRows?.[0]?.job
  if (jobId == null) return false

  const { data: jobRows, error: jobErr } = await supabase
    .from('Job')
    .select('posted_by, accepted_workers')
    .eq('id', jobId)
    .limit(1)
  if (jobErr) throw jobErr
  const job = jobRows?.[0]
  if (!job) return false

  if (Number(job.posted_by) === profileId) return true
  const workers = Array.isArray(job.accepted_workers) ? job.accepted_workers : []
  return workers.some((w) => Number(w) === profileId)
}

export type ThreadMessagingMeta = {
  threadId: number
  latestMessageId: number
  latestSenderId: number | null
}

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

  // Participants: member ids via session, full Profile via admin (RLS often hides others' profile_picture).
  async getUsers(threadId: number): Promise<UserProfile[]> {
    const { supabase, profileId } = await getAuthProfile()
    const allowed = await canAccessThreadParticipants(supabase, threadId, profileId)
    if (!allowed) throw new Error('Not a member of this thread')

    const { data, error } = await supabase
      .from('Thread users')
      .select('user_id')
      .eq('thread_id', threadId)
    if (error) throw error
    let ids = [...new Set((data ?? []).map((row) => row.user_id as number))]

    if (ids.length === 0) {
      const { data: msgs } = await supabase
        .from('Message')
        .select('Sender')
        .eq('message_thread', threadId)
      ids = [...new Set((msgs ?? []).map((m) => (m as { Sender: number }).Sender))]
    }
    if (ids.length === 0) {
      const { data: t } = await supabase
        .from('Message Thread')
        .select('job')
        .eq('id', threadId)
        .maybeSingle()
      if (t?.job != null) {
        const { data: job } = await supabase
          .from('Job')
          .select('posted_by, accepted_workers')
          .eq('id', t.job)
          .maybeSingle()
        if (job) {
          const set = new Set<number>()
          set.add(job.posted_by as number)
          for (const id of (job.accepted_workers as number[] | null) ?? []) {
            set.add(id)
          }
          ids = [...set]
        }
      }
    }

    const profiles = await Promise.all(
      ids.map(async (id) => {
        try {
          return await profile.getByID(id)
        } catch {
          return null
        }
      }),
    )
    return profiles.filter((p): p is UserProfile => p != null)
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

  async getMessagingMeta(): Promise<ThreadMessagingMeta[]> {
    const { supabase, profileId } = await getAuthProfile()

    // Single query to get thread IDs for this user
    const { data: threadData, error: threadError } = await supabase
      .from('Thread users')
      .select('"Message Thread"(id, Archived)')
      .eq('user_id', profileId)
    if (threadError) throw threadError

    const threadIds = (threadData ?? [])
      .map((row) => (row as Record<string, unknown>)['Message Thread'] as { id: number; Archived: boolean })
      .filter((t) => t && !t.Archived)
      .map((t) => t.id)

    if (threadIds.length === 0) return []

    // Single bulk query for latest messages across all threads, grouped in JS
    const { data: messages, error: msgError } = await supabase
      .from('Message')
      .select('MessageId, Sender, message_thread')
      .in('message_thread', threadIds)
      .order('MessageId', { ascending: false })
    if (msgError) throw msgError

    const latestByThread = new Map<number, Pick<Message, 'MessageId' | 'Sender'>>()
    for (const msg of (messages ?? []) as Pick<Message, 'MessageId' | 'Sender' | 'message_thread'>[]) {
      if (!latestByThread.has(msg.message_thread)) {
        latestByThread.set(msg.message_thread, { MessageId: msg.MessageId, Sender: msg.Sender })
      }
    }

    return threadIds.map((id) => {
      const latest = latestByThread.get(id)
      return {
        threadId: id,
        latestMessageId: latest?.MessageId ?? 0,
        latestSenderId: latest?.Sender ?? null,
      }
    })
  },

  async getUnreadCounts(lastReadByThread: Record<number, number>): Promise<Record<number, number>> {
    const { supabase, profileId } = await getAuthProfile()

    // Single query to get thread IDs for this user
    const { data: threadData, error: threadError } = await supabase
      .from('Thread users')
      .select('"Message Thread"(id, Archived)')
      .eq('user_id', profileId)
    if (threadError) throw threadError

    const threadIds = (threadData ?? [])
      .map((row) => (row as Record<string, unknown>)['Message Thread'] as { id: number; Archived: boolean })
      .filter((t) => t && !t.Archived)
      .map((t) => t.id)

    if (threadIds.length === 0) return {}

    const counts: Record<number, number> = {}
    for (const id of threadIds) counts[id] = 0

    // Single bulk query: fetch all non-self messages across all threads, count in JS
    const { data: messages, error: msgError } = await supabase
      .from('Message')
      .select('MessageId, message_thread, Sender')
      .in('message_thread', threadIds)
      .neq('Sender', profileId)
    if (msgError) throw msgError

    for (const msg of (messages ?? []) as Pick<Message, 'MessageId' | 'message_thread' | 'Sender'>[]) {
      const lastRead = lastReadByThread[msg.message_thread] ?? 0
      if (msg.MessageId > lastRead) {
        counts[msg.message_thread] = (counts[msg.message_thread] ?? 0) + 1
      }
    }

    return counts
  },
}
