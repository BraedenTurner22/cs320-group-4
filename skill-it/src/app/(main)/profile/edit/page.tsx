'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import type { UserProfile } from '@/types'

export default function EditProfilePage() {
  const router = useRouter()
  
  // Form State
  const [username, setUsername] = useState('')
  const [major, setMajor] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [bio, setBio] = useState('')
  
  // UI State
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Load existing profile data on mount
  useEffect(() => {
    let cancelled = false
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile')
        if (res.ok && !cancelled) {
          const data: UserProfile = await res.json()
          setUsername(data.Username || '')
          setMajor(data.Major || '') 
          setGraduationYear(data.Graduation_Year ? String(data.Graduation_Year) : '')
          setBio(data.Description || '') 
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load profile data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadProfile()

    return () => { cancelled = true }
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const payload = {
        Username: username,
        Major: major, 
        Graduation_Year: graduationYear ? parseInt(graduationYear, 10) : null,
        Description: bio, 
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to update profile')
      }

      setSuccess(true)
      
      // Redirect back after a short delay
      setTimeout(() => {
        router.push('/dashboard') 
      }, 1500)

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg py-8 text-center">
        <p className="text-sm text-muted/70">Loading…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg flex flex-col gap-8 pb-12">
      <div>
        <Link
          href="/profile"
          className="text-sm font-medium text-muted hover:text-ember transition-colors"
        >
          ← Back
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold text-fg tracking-tight">Edit Details</h1>
        <p className="mt-1 text-sm text-muted">
          Update your personal information and bio.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-2xl border border-edge bg-high/80 p-8 shadow-lg shadow-black/15">
        
        {/* Username Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted">Display Name</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="text-sm text-fg rounded-lg border border-edge bg-raised px-3 py-2 outline-none focus:ring-2 focus:ring-ember/50"
            placeholder="How others see you..."
          />
        </div>

        {/* Major Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted">Major / Field of Study</label>
          <input
            type="text"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="text-sm text-fg rounded-lg border border-edge bg-raised px-3 py-2 outline-none focus:ring-2 focus:ring-ember/50"
            placeholder="e.g. Computer Science"
          />
        </div>

        {/* Graduation Year Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted">Graduation Year</label>
          <input
            type="number"
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
            min="1950"
            max="2030"
            className="text-sm text-fg rounded-lg border border-edge bg-raised px-3 py-2 outline-none focus:ring-2 focus:ring-ember/50"
            placeholder="YYYY"
          />
        </div>

        {/* Bio Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted">Short Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="text-sm text-fg rounded-lg border border-edge bg-raised px-3 py-2 outline-none focus:ring-2 focus:ring-ember/50 min-h-[120px] resize-y"
            placeholder="Tell people a little about yourself, your skills, and what you are looking for..."
          />
        </div>

        {/* Status Messages */}
        {error && <p className="text-sm text-danger font-medium">{error}</p>}
        {success && <p className="text-sm text-success font-medium">Profile updated successfully!</p>}

        {/* Submit Button */}
        <div className="pt-2">
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Saving changes...' : 'Save Profile'}
          </Button>
        </div>
      </form>
      
      {/* Helpful Link to Picture Edit */}
      <div className="text-center">
        <Link 
          href="/main/profile/picture" 
          className="text-sm text-muted hover:text-ember transition-colors font-medium"
        >
          Want to update your profile picture instead?
        </Link>
      </div>
    </div>
  )
}