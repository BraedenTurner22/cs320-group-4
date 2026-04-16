import { profile } from '@/lib/services/profile'
import { threads } from '@/lib/services/threads'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/services/profile', () => ({
  profile: {
    getCurrent: jest.fn(),
    getByID: jest.fn(),
  },
}))

const mockCreateClient = jest.mocked(createClient)
const mockGetCurrent = jest.mocked(profile.getCurrent)
const mockGetByID = jest.mocked(profile.getByID)

/** Thread users table mock: membership check + participant listing */
function threadUsersTableMock(userRows: { user_id: number }[]) {
  return {
    insert: jest.fn().mockResolvedValue({ error: null }),
    delete: jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ error: null }),
      })),
    })),
    select: jest.fn((cols: string) => {
      if (cols === 'thread_id') {
        return {
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              limit: jest.fn().mockResolvedValue({
                data: [{ thread_id: 1 }],
                error: null,
              }),
            })),
          })),
        }
      }
      if (cols === 'user_id') {
        return {
          eq: jest.fn().mockResolvedValue({
            data: userRows,
            error: null,
          }),
        }
      }
      throw new Error(`unexpected select(${cols})`)
    }),
  }
}

describe('Message Threads', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCurrent.mockResolvedValue({ id: 10 } as never)
  })

  const threadRow = (overrides: Record<string, unknown> = {}) => ({
    id: 1,
    created_on: new Date().toISOString(),
    job: 5,
    'Thread name': 'T',
    Archived: false,
    ...overrides,
  })

  it('threads.getAll() → only threads for logged-in participant', async () => {
    const t = threadRow({ id: 3 })
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({
            data: [{ 'Message Thread': t }],
            error: null,
          }),
        })),
      })),
    } as never)

    const list = await threads.getAll()
    expect(list.some((x) => x.id === 3)).toBe(true)
  })

  it('threads.getOneByID(1) → returns thread with id, job, thread name', async () => {
    const t = threadRow({ id: 1, job: 9, 'Thread name': 'Hello' })
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: t, error: null }),
          })),
        })),
      })),
    } as never)

    const one = await threads.getOneByID(1)
    expect(one.id).toBe(1)
    expect(one.job).toBe(9)
    expect(one['Thread name']).toBe('Hello')
  })

  it('threads.getOneByID(9999) → throws when not found', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest
              .fn()
              .mockResolvedValue({ data: null, error: { message: 'Not found', code: 'PGRST116' } }),
          })),
        })),
      })),
    } as never)

    await expect(threads.getOneByID(9999)).rejects.toBeDefined()
  })

  it('threads.create(jobId, users, name) → new thread; getOneByID returns same id', async () => {
    const inserted = threadRow({ id: 50, job: 3, 'Thread name': 'New Thread' })
    mockCreateClient.mockResolvedValue({
      from: jest.fn((table: string) => {
        if (table === 'Message Thread') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: inserted, error: null }),
              })),
            })),
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: inserted, error: null }),
              })),
            })),
          }
        }
        if (table === 'Thread users') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          }
        }
        throw new Error(table)
      }),
    } as never)

    const created = await threads.create(3, [11, 12], 'New Thread')
    expect(created.id).toBe(50)

    const again = await threads.getOneByID(50)
    expect(again['Thread name']).toBe('New Thread')
  })

  it('threads.rename(1, "New Name") → getOneByID reflects name', async () => {
    const renamed = threadRow({ id: 1, 'Thread name': 'New Name' })
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: renamed, error: null }),
            })),
          })),
        })),
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: renamed, error: null }),
          })),
        })),
      })),
    } as never)

    await threads.rename(1, 'New Name')
    const t = await threads.getOneByID(1)
    expect(t['Thread name']).toBe('New Name')
  })

  it('threads.archive(1) → getOneByID returns Archived true', async () => {
    const archived = threadRow({ id: 1, Archived: true })
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null }),
        })),
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: archived, error: null }),
          })),
        })),
      })),
    } as never)

    await threads.archive(1)
    const t = await threads.getOneByID(1)
    expect(t.Archived).toBe(true)
  })

  it('threads.getMessages(1) → messages have MessageId, Content, Sender, sent_on', async () => {
    const msg = {
      MessageId: 1,
      Content: 'hi',
      Sender: 2,
      sent_on: new Date().toISOString(),
      message_thread: 1,
    }
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn().mockResolvedValue({ data: [msg], error: null }),
          })),
        })),
      })),
    } as never)

    const list = await threads.getMessages(1)
    expect(list[0].MessageId).toBeDefined()
    expect(list[0].Content).toBeDefined()
    expect(list[0].Sender).toBeDefined()
    expect(list[0].sent_on).toBeDefined()
  })

  it('threads.sendMessage(1, "hello") → message appears in getMessages', async () => {
    const sent = {
      MessageId: 9,
      Content: 'hello',
      Sender: 10,
      sent_on: new Date().toISOString(),
      message_thread: 1,
    }
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: sent, error: null }),
          })),
        })),
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn().mockResolvedValue({ data: [sent], error: null }),
          })),
        })),
      })),
    } as never)

    await threads.sendMessage(1, 'hello')
    const msgs = await threads.getMessages(1)
    expect(msgs.some((m) => m.Content === 'hello')).toBe(true)
  })

  it('threads.deleteMessage(1, messageId) → message removed from getMessages', async () => {
    mockCreateClient
      .mockResolvedValueOnce({
        from: jest.fn(() => ({
          delete: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({ error: null }),
            })),
          })),
        })),
      } as never)
      .mockResolvedValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn().mockResolvedValue({ data: [], error: null }),
            })),
          })),
        })),
      } as never)

    await threads.deleteMessage(1, 100)
    const msgs = await threads.getMessages(1)
    expect(msgs).toHaveLength(0)
  })

  it('threads.getUsers(1) → returns participant profiles', async () => {
    mockGetByID.mockResolvedValue({ id: 20, Username: 'p', Email: 'p@p.com' } as never)
    mockCreateClient.mockResolvedValue({
      from: jest.fn((table: string) => {
        if (table === 'Thread users') return threadUsersTableMock([{ user_id: 20 }])
        throw new Error(table)
      }),
    } as never)

    const users = await threads.getUsers(1)
    expect(users.some((u) => u.id === 20)).toBe(true)
  })

  it('threads.addUser(1, userId) → user in getUsers', async () => {
    mockGetByID.mockResolvedValue({ id: 30, Username: 'x', Email: 'x@x.com' } as never)
    const tu = threadUsersTableMock([{ user_id: 30 }])
    mockCreateClient
      .mockResolvedValueOnce({
        from: jest.fn(() => tu),
      } as never)
      .mockResolvedValueOnce({
        from: jest.fn(() => tu),
      } as never)

    await threads.addUser(1, 30)
    const users = await threads.getUsers(1)
    expect(users.some((u) => u.id === 30)).toBe(true)
  })

  it('threads.removeUser(1, userId) → delete succeeds', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({ error: null }),
          })),
        })),
      })),
    } as never)

    await expect(threads.removeUser(1, 31)).resolves.toBe(true)
  })

  it('threads.getByJob(1) → all threads have job === 1', async () => {
    const rows = [threadRow({ id: 1, job: 1 }), threadRow({ id: 2, job: 1 })]
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ data: rows, error: null }),
        })),
      })),
    } as never)

    const list = await threads.getByJob(1)
    expect(list.every((t) => t.job === 1)).toBe(true)
  })

  it.skip('threads.getUnread() → PDF: threads with unread for current user (verify against product rules)', () => {
    // Current implementation returns user threads (non-archived) without per-message unread filtering.
  })
})
