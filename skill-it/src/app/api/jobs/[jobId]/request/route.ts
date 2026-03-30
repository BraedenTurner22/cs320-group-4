import { jobs } from '@/lib/services/jobs'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ jobId: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { jobId } = await params
    await jobs.requestWork(Number(jobId))
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to request work'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { jobId } = await params
    await jobs.withdrawRequest(Number(jobId))
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to withdraw request'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
