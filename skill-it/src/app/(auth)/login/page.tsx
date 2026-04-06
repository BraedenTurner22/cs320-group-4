'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Login failed')
      }
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Enter your email first')
      return
    }
    try {
      await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setError('')
      alert('Password reset email sent!')
    } catch {
      setError('Failed to send reset email')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent mb-2">
          Skill-It
        </h1>
        <p className="text-gray-500 mb-6">Welcome back</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@umass.edu"
            className="text-indigo-600"
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="text-indigo-600"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <div className="mt-4 flex flex-col items-center gap-2 text-sm">
          <button
            onClick={handleForgotPassword}
            className="text-indigo-600 hover:underline cursor-pointer"
          >
            Forgot password?
          </button>
          <p className="text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-indigo-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
