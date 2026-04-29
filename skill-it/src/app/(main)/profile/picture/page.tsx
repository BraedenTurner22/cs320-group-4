'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PROFILE_PICTURE_UPDATED_EVENT } from '@/lib/profile-picture-events'
import type { UserProfile } from '@/types'
import Button from '@/components/ui/Button'
import ProfileAvatar from '@/components/ui/ProfileAvatar'

export default function ProfilePicturePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/profile')
        if (res.ok && !cancelled) {
          setProfile(await res.json())
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Choose an image first')
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const fd = new FormData()
      fd.set('file', file)
      const res = await fetch('/api/profile/picture', { method: 'POST', body: fd })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof body.error === 'string' ? body.error : 'Upload failed')
        return
      }
      setProfile(body as UserProfile)
      setFile(null)
      setPreview(null)
      setSuccess(true)
      window.dispatchEvent(new Event(PROFILE_PICTURE_UPDATED_EVENT))
      router.refresh()
    } catch {
      setError('Upload failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg py-8">
        <p className="text-sm text-muted/70">Loading…</p>
      </div>
    )
  }

  const displayName = profile?.Username ?? 'User'

  return (
    <div className="mx-auto max-w-lg flex flex-col gap-8">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-muted hover:text-ember-text transition-colors"
        >
          ← Back
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold text-fg tracking-tight">Profile picture</h1>
        <p className="mt-1 text-sm text-muted">
          Upload a photo for your account. Until you do, others see your initials.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 rounded-2xl border border-edge bg-high/80 p-8 shadow-lg shadow-black/15">
        <div className="rounded-full ring-4 ring-edge/50">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              width={128}
              height={128}
              className="size-32 rounded-full border border-edge object-cover"
            />
          ) : (
            <ProfileAvatar
              name={displayName}
              imageUrl={profile?.profile_picture}
              size="xl"
              className="border-2"
            />
          )}
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex w-full max-w-sm flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted">New image (JPEG, PNG, or WebP, max 2MB)</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null)
                setSuccess(false)
                setError(null)
              }}
              className="text-sm text-fg file:mr-3 file:rounded-lg file:border file:border-edge file:bg-raised file:px-3 file:py-2 file:text-sm file:font-medium file:text-fg"
            />
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          {success && <p className="text-sm text-success">Picture updated.</p>}
          <Button type="submit" disabled={saving || !file} className="w-full">
            {saving ? 'Uploading…' : 'Save picture'}
          </Button>
        </form>
      </div>
    </div>
  )
}
