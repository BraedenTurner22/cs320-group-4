import type { SupabaseClient } from '@supabase/supabase-js'

/** Must match the Storage bucket id and `picture/route.ts`. */
export const PROFILE_IMAGES_BUCKET = 'profile images'

/** Fresh signed URL on each API read; keep TTL comfortably long for <img> caching. */
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24 * 7 // 7 days

function objectPathFromLegacyPublicUrl(stored: string): string | null {
  try {
    const u = new URL(stored)
    const marker = '/object/public/'
    const idx = u.pathname.indexOf(marker)
    if (idx === -1) return null
    const rest = u.pathname.slice(idx + marker.length)
    const slash = rest.indexOf('/')
    if (slash === -1) return null
    const bucketInUrl = decodeURIComponent(rest.slice(0, slash))
    const objectPath = rest
      .slice(slash + 1)
      .split('/')
      .map((seg) => decodeURIComponent(seg))
      .join('/')
    if (bucketInUrl !== PROFILE_IMAGES_BUCKET) return null
    return objectPath
  } catch {
    return null
  }
}

/** Resolve DB value (object path or legacy public URL) to a time-limited signed URL for <img src>. */
export async function resolveProfilePictureSignedUrl(
  supabase: SupabaseClient,
  stored: string | null | undefined,
): Promise<string | null> {
  if (stored == null || stored === '') return null

  const path =
    stored.startsWith('http://') || stored.startsWith('https://')
      ? objectPathFromLegacyPublicUrl(stored)
      : stored

  if (!path) return null

  const { data, error } = await supabase.storage
    .from(PROFILE_IMAGES_BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS)

  if (error || !data?.signedUrl) return null
  return data.signedUrl
}
