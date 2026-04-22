import { NextRequest, NextResponse } from 'next/server'
import { reviews } from '@/lib/services/reviews'

type Params = { params: Promise<{ jobId: string }> }

// GET /api/jobs/[jobId]/reviews - Retrieve a review for a specific job and profile
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { jobId } = await params
    const body = await req.json()
    const { profileid} = body

    if (!profileid || !jobId) {
      return NextResponse.json({ error: 'Missing profileid or jobid in request body' }, { status: 400 })
    }

    const jobIdNum = parseInt(jobId)
    const profileIdNum = parseInt(profileid)

    if (isNaN(jobIdNum) || isNaN(profileIdNum)) {
      return NextResponse.json({ error: 'Invalid jobid or profileid' }, { status: 400 })
    }

    const review = await reviews.getReviewByJobID(jobIdNum, profileIdNum)

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json(review)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get review'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
