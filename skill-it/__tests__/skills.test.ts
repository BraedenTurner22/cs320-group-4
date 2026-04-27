import { jskillHolder, pskillHolder, skill } from '@/lib/services/skills'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

const mockCreateClient = jest.mocked(createClient)

describe('Skills', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('skill.create("Marketing", false) → creates skill row', async () => {
    const row = { id: 1, name: 'Marketing', explicit: false }
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: row, error: null }),
          })),
        })),
      })),
    } as never)

    const created = await skill.create('Marketing', false)
    expect(created.name).toBe('Marketing')
    expect(created.explicit).toBe(false)
  })

  it('skill.create duplicate → Supabase throws (constraint)', async () => {
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

    await expect(skill.create('Marketing', false)).rejects.toBeDefined()
  })

  it('skill.getByID → returns name and explicit flag', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 3, name: 'Marketing', explicit: false },
              error: null,
            }),
          })),
        })),
      })),
    } as never)

    const s = await skill.getByID(3)
    expect([s.name, s.explicit]).toEqual(['Marketing', false])
  })

  it('pskillHolder.addSkillToProfile(uid, skillId) → returns true', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({ error: null }),
      })),
    } as never)

    await expect(pskillHolder.addSkillToProfile(2, 3)).resolves.toBe(true)
  })

  it('pskillHolder duplicate add → throws (mock DB error)', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({
          error: { message: 'duplicate key' },
        }),
      })),
    } as never)

    await expect(pskillHolder.addSkillToProfile(2, 3)).rejects.toBeDefined()
  })

  it('skill.getByID from pskillHolder.getSkillsForProfile → matches stored skill', async () => {
    const marketing = { id: 3, name: 'Marketing', explicit: false }
    mockCreateClient
      .mockResolvedValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({
              data: [{ Skill: marketing }],
              error: null,
            }),
          })),
        })),
      } as never)
      .mockResolvedValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: marketing, error: null }),
            })),
          })),
        })),
      } as never)

    const skills = await pskillHolder.getSkillsForProfile(2)
    const firstId = skills[0].id
    const s = await skill.getByID(firstId)
    expect([s.name, s.explicit]).toEqual(['Marketing', false])
  })

  it('jskillHolder.addSkillToJob(jobId, skillId) → returns true', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({ error: null }),
      })),
    } as never)

    await expect(jskillHolder.addSkillToJob(100, 3)).resolves.toBe(true)
  })

  it('jskillHolder duplicate add → throws (mock DB error)', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({
          error: { message: 'duplicate key' },
        }),
      })),
    } as never)

    await expect(jskillHolder.addSkillToJob(100, 3)).rejects.toBeDefined()
  })

  it('skill.getByID from jskillHolder.getSkillsForJob → matches stored skill', async () => {
    const marketing = { id: 3, name: 'Marketing', explicit: false }
    mockCreateClient
      .mockResolvedValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({
              data: [{ Skill: marketing }],
              error: null,
            }),
          })),
        })),
      } as never)
      .mockResolvedValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: marketing, error: null }),
            })),
          })),
        })),
      } as never)

    const skills = await jskillHolder.getSkillsForJob(100)
    const s = await skill.getByID(skills[0].id)
    expect([s.name, s.explicit]).toEqual(['Marketing', false])
  })

  it('explicit flag set server-side → skill.getByID returns explicit true', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 3, name: 'Marketing', explicit: true },
              error: null,
            }),
          })),
        })),
      })),
    } as never)

    const s = await skill.getByID(3)
    expect([s.name, s.explicit]).toEqual(['Marketing', true])
  })

  it('pskillHolder.removeSkillFromProfile / jskillHolder.removeSkillFromJob → return true', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({ error: null }),
          })),
        })),
      })),
    } as never)

    await expect(pskillHolder.removeSkillFromProfile(2, 3)).resolves.toBe(true)
    await expect(jskillHolder.removeSkillFromJob(100, 3)).resolves.toBe(true)
  })
})
