import { jobs } from '@/lib/services/jobs'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const category = searchParams.get('category')
    const completed = searchParams.get('completed')
    const userId = searchParams.get('userId')

    let data
    if (category) {
      data = await jobs.getByCategory(category)
    } else if (completed !== null) {
      data = await jobs.getByStatus(completed === 'true')
    } else if (userId) {
      data = await jobs.getByUser(userId)
    } else {
      data = await jobs.getAll()
    }

    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch jobs'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const job = await jobs.create(
      body.title,
      body.description,
      body.categoryId ?? null,
      body.skills ?? [],
      body.header
    )
    return NextResponse.json(job, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create job, missing required fields'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
