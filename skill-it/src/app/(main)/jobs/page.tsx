import { jobs } from '@/lib/services/jobs'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveProfilePictureSignedUrl } from '@/lib/profile-picture-signed-url'
import JobsClient from './jobs-client'

export default async function JobsPage() {
  let allJobs: Awaited<ReturnType<typeof jobs.getAll>> = []
  try {
    allJobs = await jobs.getAll()
  } catch {
    // Table may not exist yet
  }

  // Extract unique categories and skills for filters
  const categories = [
    ...new Set(allJobs.map((j) => j.category?.name).filter(Boolean) as string[]),
  ]
  const skills = [
    ...new Set(
      allJobs.flatMap((j) => j.associated_skills?.map((s) => s.name) ?? [])
    ),
  ]

  // Fetch poster usernames + avatars in one batch query using the admin client (bypasses RLS)
  const posterIds = [...new Set(allJobs.map((j) => Number(j.posted_by)).filter(Boolean))]
  const posterNames: Record<string, string> = {}
  const posterAvatars: Record<string, string | null> = {}
  if (posterIds.length > 0) {
    const supabase = createAdminClient()
    const { data: profiles } = await supabase
      .from('Profile')
      .select('id, Username, profile_picture')
      .in('id', posterIds)
    await Promise.all(
      (profiles ?? []).map(async (p) => {
        const key = String(p.id)
        posterNames[key] = p.Username
        posterAvatars[key] = await resolveProfilePictureSignedUrl(supabase, p.profile_picture)
      })
    )
  }

  return <JobsClient initialJobs={allJobs} categories={categories} skills={skills} posterNames={posterNames} posterAvatars={posterAvatars} />
}
