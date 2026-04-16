import { jobs } from '@/lib/services/jobs'
import { profile } from '@/lib/services/profile'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(),
}))

jest.mock('@/lib/services/profile', () => ({
  profile: {
    getCurrent: jest.fn(),
  },
}))

const mockCreateClient = jest.mocked(createClient)
const mockCreateAdminClient = jest.mocked(createAdminClient)
const mockGetCurrent = jest.mocked(profile.getCurrent)

describe('Job Postings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCurrent.mockResolvedValue({ id: 10 } as never)
  })

  function mockJobRow(overrides: Record<string, unknown> = {}) {
    return {
      id: 1,
      title: 't',
      description: 'd',
      posted_by: 1,
      completed: false,
      associated_skills: [],
      category: [{ Category: { id: 1, name: 'design', explicit: false } }],
      ...overrides,
    }
  }

  it('jobs.getAll() → returns Job objects with id, description, category, posted_by', async () => {
    const job = mockJobRow({
      id: 42,
      description: 'desc',
      posted_by: 7,
      category: [{ Category: { id: 2, name: 'design', explicit: false } }],
    })
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn().mockResolvedValue({
            data: [job],
            error: null,
          }),
        })),
      })),
    } as never)

    const list = await jobs.getAll()
    expect(list.length).toBeGreaterThan(0)
    expect(list[0].id).toBe(42)
    expect(list[0].description).toBe('desc')
    expect(list[0].posted_by).toBe(7)
    expect(list[0].category?.name).toBe('design')
  })

  it('jobs.getOneByID(1) → returns job with id 1', async () => {
    const job = mockJobRow({ id: 1, description: 'full' })
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: job, error: null }),
          })),
        })),
      })),
    } as never)

    const one = await jobs.getOneByID(1)
    expect(one.id).toBe(1)
    expect(one.description).toBe('full')
  })

  it('jobs.getOneByID(9999) → throws when not found', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest
              .fn()
              .mockResolvedValue({ data: null, error: { message: 'No rows', code: 'PGRST116' } }),
          })),
        })),
      })),
    } as never)

    await expect(jobs.getOneByID(9999)).rejects.toBeDefined()
  })

  it('jobs.getByCategory("design") → jobs have category design', async () => {
    const job = mockJobRow({
      category: [{ Category: { id: 1, name: 'design', explicit: false } }],
    })
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({
            data: [job],
            error: null,
          }),
        })),
      })),
    } as never)

    const list = await jobs.getByCategory('design')
    expect(list.every((j) => j.category?.name === 'design')).toBe(true)
  })

  it('jobs.getBySkills(["JavaScript"]) → jobs include JavaScript skill', async () => {
    const job = mockJobRow({
      associated_skills: [{ Skill: { id: 1, name: 'JavaScript', explicit: true } }],
    })
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          in: jest.fn().mockResolvedValue({
            data: [job],
            error: null,
          }),
        })),
      })),
    } as never)

    const list = await jobs.getBySkills(['JavaScript'])
    expect(
      list.every((j) =>
        (j.associated_skills ?? []).some((s) => s.name === 'JavaScript'),
      ),
    ).toBe(true)
  })

  it('jobs.getByStatus(false) → all jobs have completed === false', async () => {
    const job = mockJobRow({ completed: false })
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({
            data: [job],
            error: null,
          }),
        })),
      })),
    } as never)

    const list = await jobs.getByStatus(false)
    expect(list.every((j) => j.completed === false)).toBe(true)
  })

  it('jobs.create(...) → returns new job; getOneByID returns same id', async () => {
    const inserted = { id: 500, title: 'new', description: 'x', posted_by: 10, completed: false }
    mockCreateClient.mockResolvedValue({
      from: jest.fn((table: string) => {
        if (table === 'Job') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: inserted, error: null }),
              })),
            })),
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: {
                    ...inserted,
                    associated_skills: [],
                    category: [],
                  },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'Category-holder') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          }
        }
        if (table === 'Job-skills') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          }
        }
        throw new Error(`unexpected table ${table}`)
      }),
    } as never)

    const created = await jobs.create('new', 'x', 1, [2])
    expect(created.id).toBe(500)

    const again = await jobs.getOneByID(500)
    expect(again.id).toBe(500)
  })

  it('jobs.update(1, { description: "new desc" }) → getOneByID reflects update', async () => {
    const after = mockJobRow({ id: 1, description: 'new desc' })
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: after, error: null }),
            })),
          })),
        })),
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { ...after, associated_skills: [], category: [] },
              error: null,
            }),
          })),
        })),
      })),
    } as never)

    const updated = await jobs.update(1, { description: 'new desc' })
    expect(updated.description).toBe('new desc')

    const fetched = await jobs.getOneByID(1)
    expect(fetched.description).toBe('new desc')
  })

  it('jobs.delete(1) → returns true; subsequent getOneByID throws', async () => {
    mockCreateClient
      .mockResolvedValueOnce({
        from: jest.fn(() => ({
          delete: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({ error: null }),
          })),
        })),
      } as never)
      .mockResolvedValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest
                .fn()
                .mockResolvedValue({ data: null, error: { message: 'missing', code: 'PGRST116' } }),
            })),
          })),
        })),
      } as never)

    await expect(jobs.delete(1)).resolves.toBe(true)
    await expect(jobs.getOneByID(1)).rejects.toBeDefined()
  })

  it('jobs.markComplete(1) → getOneByID returns completed true', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null }),
        })),
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockJobRow({ id: 1, completed: true }),
              error: null,
            }),
          })),
        })),
      })),
    } as never)

    await jobs.markComplete(1)
    const j = await jobs.getOneByID(1)
    expect(j.completed).toBe(true)
  })

  it('jobs.requestWork(1) → user appears in getPendingRequests(1)', async () => {
    mockGetCurrent.mockResolvedValue({ id: 77 } as never)
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { pending_requests: [] },
              error: null,
            }),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null }),
        })),
      })),
    } as never)

    mockCreateAdminClient.mockReturnValue({
      from: jest.fn((table: string) => {
        if (table === 'Job') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: { pending_requests: [77] },
                  error: null,
                }),
              })),
            })),
          }
        }
        if (table === 'Profile') {
          return {
            select: jest.fn(() => ({
              in: jest.fn().mockResolvedValue({
                data: [{ id: 77, Username: 'u77', Email: 'u@77.com' }],
                error: null,
              }),
            })),
          }
        }
        throw new Error(`unexpected table ${table}`)
      }),
    } as never)

    await jobs.requestWork(1)
    const pending = await jobs.getPendingRequests(1)
    expect(pending.some((p) => p.id === 77)).toBe(true)
  })

  it('jobs.acceptWorker(1, userId) → user leaves pending, joins accepted_workers', async () => {
    const jobAfter = {
      ...mockJobRow({ id: 1 }),
      pending_requests: [] as number[],
      accepted_workers: [88],
      associated_skills: [] as { Skill: unknown }[],
      category: [] as unknown[],
    }
    const single = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          pending_requests: [88],
          accepted_workers: [] as number[],
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: jobAfter,
        error: null,
      })

    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single,
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null }),
        })),
      })),
    } as never)

    const job = await jobs.acceptWorker(1, 88)
    expect(job.accepted_workers).toContain(88)
    expect(job.pending_requests ?? []).not.toContain(88)
  })

  it('jobs.removeWorker(1, userId) → user not in accepted_workers', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { accepted_workers: [5, 99] },
              error: null,
            }),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null }),
        })),
      })),
    } as never)

    await jobs.removeWorker(1, 99)
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: {
                ...mockJobRow({ id: 1, accepted_workers: [5] }),
                associated_skills: [],
                category: [],
              },
              error: null,
            }),
          })),
        })),
      })),
    } as never)

    const j = await jobs.getOneByID(1)
    expect(j.accepted_workers).not.toContain(99)
  })
})
