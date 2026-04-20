import { category, categoryHolder } from '@/lib/services/categories'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

const mockCreateClient = jest.mocked(createClient)

describe('Categories', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('category.create("Project", false) → creates category row', async () => {
    const row = { id: 1, name: 'Project', explicit: false }
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: row, error: null }),
          })),
        })),
      })),
    } as never)

    const created = await category.create('Project', false)
    expect(created.name).toBe('Project')
    expect(created.explicit).toBe(false)
  })

  it('category.create duplicate → Supabase throws', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'duplicate key value violates unique constraint' },
            }),
          })),
        })),
      })),
    } as never)

    await expect(category.create('Project', false)).rejects.toBeDefined()
  })

  it('category.getByID → returns name and explicit', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 2, name: 'Project', explicit: false },
              error: null,
            }),
          })),
        })),
      })),
    } as never)

    const c = await category.getByID(2)
    expect([c.name, c.explicit]).toEqual(['Project', false])
  })

  it('categoryHolder.setCategoryForJob → returns true', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({ error: null }),
      })),
    } as never)

    await expect(categoryHolder.setCategoryForJob(500, 2)).resolves.toBe(true)
  })

  it('categoryHolder.setCategoryForJob duplicate → throws', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({
          error: { message: 'duplicate key' },
        }),
      })),
    } as never)

    await expect(categoryHolder.setCategoryForJob(500, 2)).rejects.toBeDefined()
  })

  it('categoryHolder.getCategoryForJob → returns linked category', async () => {
    const project = { id: 2, name: 'Project', explicit: false }
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { Category: project },
              error: null,
            }),
          })),
        })),
      })),
    } as never)

    const c = await categoryHolder.getCategoryForJob(500)
    expect([c.name, c.explicit]).toEqual(['Project', false])
  })

  it('explicit Project category → getByID returns explicit true', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 2, name: 'Project', explicit: true },
              error: null,
            }),
          })),
        })),
      })),
    } as never)

    const c = await category.getByID(2)
    expect([c.name, c.explicit]).toEqual(['Project', true])
  })

  it('categoryHolder.removeCategoryFromJob → returns true', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        delete: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null }),
        })),
      })),
    } as never)

    await expect(categoryHolder.removeCategoryFromJob(500)).resolves.toBe(true)
  })
})
