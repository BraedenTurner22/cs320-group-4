import { jobs } from '@/lib/services/jobs'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ jobId: string; userId: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { jobId, userId } = await params
    const job = await jobs.acceptWorker(Number(jobId), Number(userId))
    return NextResponse.json(job)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to accept worker'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
