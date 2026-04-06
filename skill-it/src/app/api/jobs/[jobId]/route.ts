import { jobs } from '@/lib/services/jobs'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ jobId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { jobId } = await params
    const job = await jobs.getOneByID(Number(jobId))
    return NextResponse.json(job)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Job not found'
    return NextResponse.json({ error: message }, { status: 404 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { jobId } = await params
    const body = await req.json()
    const job = await jobs.update(Number(jobId), body)
    return NextResponse.json(job)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update job'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { jobId } = await params
    await jobs.delete(Number(jobId))
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete job'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
