import { jobs } from '@/lib/services/jobs'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ jobId: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { jobId } = await params
    await jobs.markComplete(Number(jobId))
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to mark complete'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
