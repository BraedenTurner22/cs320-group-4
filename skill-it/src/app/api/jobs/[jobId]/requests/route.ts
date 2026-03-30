import { jobs } from '@/lib/services/jobs'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ jobId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { jobId } = await params
    const requests = await jobs.getPendingRequests(Number(jobId))
    return NextResponse.json(requests)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get requests'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
