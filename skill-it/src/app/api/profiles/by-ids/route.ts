import { createAdminClient } from '@/lib/supabase/admin'
import { resolveProfilePictureSignedUrl } from '@/lib/profile-picture-signed-url'
import { profile } from '@/lib/services/profile'
import { NextRequest, NextResponse } from 'next/server'
import type { UserProfile } from '@/types'

const MAX_IDS = 64

/**
 * Load profile rows + signed avatar URLs for a set of user ids (e.g. messaging UI).
 * Requires an authenticated session.
 */
export async function POST(req: NextRequest) {
  try {
    await profile.getCurrent()

    const body = await req.json()
    const raw = body?.ids
    if (!Array.isArray(raw)) {
      return NextResponse.json({ error: 'Expected { ids: number[] }' }, { status: 400 })
    }

    const unique = [
      ...new Set(
        raw
          .map((n: unknown) => Number(n))
          .filter((n) => Number.isFinite(n) && n > 0),
      ),
    ].slice(0, MAX_IDS)

    if (unique.length === 0) {
      return NextResponse.json([] satisfies UserProfile[])
    }

    const admin = createAdminClient()
    const out: UserProfile[] = []

    for (const id of unique) {
      try {
        const u = await profile.getByID(id)
        const profile_picture = await resolveProfilePictureSignedUrl(admin, u.profile_picture)
        out.push({ ...u, profile_picture })
      } catch {
        /* skip missing / invalid */
      }
    }

    return NextResponse.json(out)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load profiles'
    const status = message.includes('Not authenticated') ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
