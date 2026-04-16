import type { Session, User } from '@supabase/supabase-js'
import { account, passwordReset, updatePassword } from '@/lib/services/auth'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

const mockCreateClient = jest.mocked(createClient)

const testEmail = 'test@test.com'
const testPassword = '123test'

function mockServerClient(overrides: {
  auth?: Partial<{
    signUp: jest.Mock
    signInWithPassword: jest.Mock
    signOut: jest.Mock
    resetPasswordForEmail: jest.Mock
    updateUser: jest.Mock
  }>
} = {}) {
  const auth = {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
    ...overrides.auth,
  }
  mockCreateClient.mockResolvedValue({ auth } as unknown as Awaited<ReturnType<typeof createClient>>)
  return { auth }
}

describe('Account and Login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('signUp(test)', () => {
    it('verifies new user is created in Supabase and a User is returned', async () => {
      const mockUser = { id: 'auth-user-1', email: testEmail } as User
      const { auth } = mockServerClient({
        auth: {
          signUp: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      })

      const user = await account.signUp(testEmail, testPassword, 'testuser')

      expect(auth.signUp).toHaveBeenCalledWith({
        email: testEmail,
        password: testPassword,
        options: { data: { name: 'testuser' } },
      })
      expect(user).toBe(mockUser)
    })
  })

  it('signUp returns OK status (user present, no error)', async () => {
    const mockUser = { id: 'auth-user-2', email: testEmail } as User
    mockServerClient({
      auth: {
        signUp: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    })

    await expect(account.signUp(testEmail, testPassword, 'testuser')).resolves.toBe(mockUser)
  })

  describe('logIn(test)', () => {
    it('begins an active session when given ok credentials', async () => {
      const mockSession = { access_token: 'tok' } as Session
      const { auth } = mockServerClient({
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({
            data: { session: mockSession },
            error: null,
          }),
        },
      })

      const session = await account.logIn(testEmail, testPassword)

      expect(auth.signInWithPassword).toHaveBeenCalledWith({
        email: testEmail,
        password: testPassword,
      })
      expect(session).toBe(mockSession)
    })

    it('fails with bad credentials', async () => {
      mockServerClient({
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({
            data: { session: null },
            error: { message: 'Invalid login credentials' },
          }),
        },
      })

      await expect(account.logIn(testEmail, 'wrong')).rejects.toBeDefined()
    })
  })

  it('logOut ends the current session', async () => {
    const { auth } = mockServerClient({
      auth: {
        signOut: jest.fn().mockResolvedValue({ error: null }),
      },
    })

    await expect(account.logOut()).resolves.toBe(true)
    expect(auth.signOut).toHaveBeenCalled()
  })

  describe('resetPassword(email)', () => {
    it('delegates to Supabase resetPasswordForEmail', async () => {
      const { auth } = mockServerClient({
        auth: {
          resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
        },
      })

      await expect(passwordReset(testEmail)).resolves.toBe(true)
      expect(auth.resetPasswordForEmail).toHaveBeenCalledWith(testEmail)
    })
  })

  describe('updatePassword', () => {
    it('updates the user password via Supabase and returns the User', async () => {
      const mockUser = { id: 'u1' } as User
      const { auth } = mockServerClient({
        auth: {
          updateUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      })

      const user = await updatePassword('new-secret-password')

      expect(auth.updateUser).toHaveBeenCalledWith({ password: 'new-secret-password' })
      expect(user).toBe(mockUser)
    })
  })

  it('error returned for invalid email (signUp)', async () => {
    mockServerClient({
      auth: {
        signUp: jest.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Invalid email' },
        }),
      },
    })

    await expect(account.signUp('not-an-email', testPassword, 'x')).rejects.toBeDefined()
  })
})
