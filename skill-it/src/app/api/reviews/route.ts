import { NextResponse } from 'next/server'
import { reviews } from '@/lib/services/reviews'

export async function GET() {
  return NextResponse.json({ message: 'not implemented' })
}

/*
Request body
job id from url parameter
rating
feedback
*/
export async function POST(request: Request) {
  try {

    const body = await request.json()
    const { author, subjects, jobId, rating, feedback } = body


    if (!jobId || !subjects || !rating || !feedback || !author) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    await reviews.createReview(author, subjects, feedback, rating, jobId)
    return NextResponse.json({ message: 'Review created' })
  } 
  catch (err) {
  console.error('Error creating review:', err)
  return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}
