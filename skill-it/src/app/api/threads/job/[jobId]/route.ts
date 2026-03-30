import { threads } from '@/lib/services/threads'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ jobId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { jobId } = await params
    const data = await threads.getByJob(Number(jobId))
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get threads'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
