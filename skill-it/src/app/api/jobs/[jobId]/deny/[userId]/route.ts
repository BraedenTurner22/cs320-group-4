import { jobs } from '@/lib/services/jobs'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ jobId: string; userId: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { jobId, userId } = await params
    await jobs.denyWorker(Number(jobId), Number(userId))
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to deny applicant'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
