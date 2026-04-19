import { createClient } from '@/lib/supabase/server'
import { resolveProfilePictureSignedUrl } from '@/lib/profile-picture-signed-url'
import { profile } from '@/lib/services/profile'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const current = await profile.getCurrent()
    const profile_picture = await resolveProfilePictureSignedUrl(supabase, current.profile_picture)
    return NextResponse.json({ ...current, profile_picture })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get profile'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const created = await profile.create(body)
    return NextResponse.json(created, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create profile'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const current = await profile.getCurrent()
    const body = await req.json()
    const updated = await profile.update(current.id, body)
    return NextResponse.json(updated)
  } catch (err: unknown) {
    console.error("SUPABASE ERROR DETAILS:", err)
    const message = err instanceof Error ? err.message : 'Failed to update profile'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
