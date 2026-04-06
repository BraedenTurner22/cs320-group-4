import { jobs } from '@/lib/services/jobs'
import { threads } from '@/lib/services/threads'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ jobId: string; userId: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { jobId, userId } = await params
    const jobIdNum = Number(jobId)
    const userIdNum = Number(userId)

    // Get the job before accepting so we have posted_by and title
    const job = await jobs.getOneByID(jobIdNum)

    // Move worker from pending → accepted
    await jobs.acceptWorker(jobIdNum, userIdNum)

    // Open a message thread between the job owner and the accepted worker
    const thread = await threads.create(
      jobIdNum,
      [job.posted_by, userIdNum],
      `Re: ${job.title ?? `Job #${jobIdNum}`}`
    )

    return NextResponse.json({ threadId: thread.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to accept worker'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
