import { createClient } from '@/lib/supabase/server'
import { PROFILE_IMAGES_BUCKET, resolveProfilePictureSignedUrl } from '@/lib/profile-picture-signed-url'
import { profile } from '@/lib/services/profile'
import { NextRequest, NextResponse } from 'next/server'

const BUCKET = PROFILE_IMAGES_BUCKET
const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])

function extForMime(mime: string) {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file')
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 })
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: 'Use JPEG, PNG, or WebP' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be 2MB or smaller' }, { status: 400 })
    }

    const buf = Buffer.from(await file.arrayBuffer())
    const ext = extForMime(file.type)
    const path = `${user.id}/avatar.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, buf, {
        upsert: true,
        contentType: file.type,
      })
    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 400 })
    }

    const current = await profile.getCurrent()
    const updated = await profile.update(current.id, {
      profile_picture: path,
    })

    const profile_picture = await resolveProfilePictureSignedUrl(supabase, updated.profile_picture)
    return NextResponse.json({ ...updated, profile_picture })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
