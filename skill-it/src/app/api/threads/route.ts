import { threads } from '@/lib/services/threads'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const data = await threads.getAll()
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch threads'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { jobId, userIds, threadName } = await req.json()
    const thread = await threads.create(jobId, userIds, threadName)
    return NextResponse.json(thread, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create thread'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
