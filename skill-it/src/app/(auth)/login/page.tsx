'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ShaderGradientBg from '@/components/ui/ShaderGradientBg'
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Full-screen shader gradient */}
      <ShaderGradientBg />

      {/* Dark overlay — light enough to let the gradient breathe */}
      <div className="absolute inset-0 bg-surface/40" />

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-edge/60 bg-raised/80 backdrop-blur-xl p-8 shadow-2xl shadow-surface">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            <span className="text-ember">Skill</span>
            <span className="text-fg">-It</span>
          </h1>
          <p className="text-muted text-sm">Welcome back — sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@umass.edu"
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />

          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full mt-1">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-5 flex flex-col items-center gap-2 text-sm">
          <button
            onClick={handleForgotPassword}
            className="text-muted hover:text-ember transition-colors cursor-pointer text-xs"
          >
            Forgot password?
          </button>
          <p className="text-muted">
            No account?{' '}
            <Link href="/signup" className="font-medium text-ember hover:text-ember-dark transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
