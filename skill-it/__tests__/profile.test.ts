import { profile } from '@/lib/services/profile'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(),
}))

const mockCreateClient = jest.mocked(createClient)
const mockCreateAdminClient = jest.mocked(createAdminClient)

describe('Profile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('profile.create → returns profile with valid uid/username; Banned false', async () => {
    const row = {
      id: 1,
      auth_uid: '00000000-0000-0000-0000-000000000001',
      Username: 'testuser',
      Banned: false,
      Email: 'a@b.com',
    }
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: row, error: null }),
          })),
        })),
      })),
    } as never)

    const created = await profile.create({
      auth_uid: row.auth_uid,
      Username: 'testuser',
      Email: 'a@b.com',
    })

    expect(created.Username).toBe('testuser')
    expect(created.Banned).toBe(false)
  })

  it('profile.getByID(uid) → returns profile with fields populated', async () => {
    const row = {
      id: 2,
      auth_uid: 'uid',
      Username: 'u',
      Email: 'e@e.com',
    }
    mockCreateAdminClient.mockReturnValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: row, error: null }),
          })),
        })),
      })),
    } as never)

    const p = await profile.getByID(2)
    expect(p.id).toBe(2)
    expect(p.Username).toBe('u')
  })

  it('profile.getCurrent() → when logged in, returns profile for session user', async () => {
    const authUid = '00000000-0000-0000-0000-000000000099'
    const row = {
      id: 99,
      auth_uid: authUid,
      Username: 'current',
      Email: 'c@c.com',
    }
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: authUid } },
          error: null,
        }),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: row, error: null }),
          })),
        })),
      })),
    } as never)

    const current = await profile.getCurrent()
    expect(current.id).toBe(row.id)
    expect(current.Username).toBe(row.Username)
  })

  it('profile.update(2, { Description: "new bio" }) → returns updated row', async () => {
    const updated = {
      id: 2,
      auth_uid: 'x',
      Username: 'u',
      Email: 'e@e.com',
      Description: 'new bio',
    }
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: updated, error: null }),
            })),
          })),
        })),
      })),
    } as never)

    const p = await profile.update(2, { Description: 'new bio' })
    expect(p.Description).toBe('new bio')
  })

  it('profile.delete(2) → returns true', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        delete: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null }),
        })),
      })),
    } as never)

    await expect(profile.delete(2)).resolves.toBe(true)
  })

  it('profile.ban(2) → returns true', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null }),
        })),
      })),
    } as never)

    await expect(profile.ban(2)).resolves.toBe(true)
  })

  it('profile.unban(2) → returns true', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null }),
        })),
      })),
    } as never)

    await expect(profile.unban(2)).resolves.toBe(true)
  })

  it('profile.addSkill(2, 3) → returns true', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({ error: null }),
      })),
    } as never)

    await expect(profile.addSkill(2, 3)).resolves.toBe(true)
  })

  it('profile.removeSkill(2, 3) → returns true', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => ({
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({ error: null }),
          })),
        })),
      })),
    } as never)

    await expect(profile.removeSkill(2, 3)).resolves.toBe(true)
  })

  it.skip('profile.verify(2) → verifies profile (add when API exists)', () => {})

  it.skip('skills.getUsersBySkill(3) → list users by skill (add service API when available)', () => {})

  it.skip('profile.getReviewsReceived(2) → list reviews (add when Review schema exists)', () => {})
})
