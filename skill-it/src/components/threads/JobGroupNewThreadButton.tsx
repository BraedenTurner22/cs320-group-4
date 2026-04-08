'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type JobGroupNewThreadButtonProps = {
  jobId: number
  jobLabel: string
  participantIds: number[] | undefined
  disabled?: boolean
  onCreated?: () => void
}

export default function JobGroupNewThreadButton({
  jobId,
  jobLabel,
  participantIds,
  disabled = false,
  onCreated,
}: JobGroupNewThreadButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [threadName, setThreadName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userIds = participantIds ? [...new Set(participantIds)] : []
  const canOffer = userIds.length >= 2 && !disabled

  useEffect(() => {
    if (!open) return
    setThreadName(`Re: ${jobLabel}`)
    setError(null)
  }, [open, jobLabel])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canOffer) return
    const name =
      threadName.trim() || `Re: ${jobLabel}`
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          userIds,
          threadName: name,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(typeof body.error === 'string' ? body.error : 'Could not create chat')
        return
      }
      const thread = await res.json()
      setOpen(false)
      onCreated?.()
      router.push(`/messages/${thread.id}`)
    } catch {
      setError('Could not create chat')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!canOffer}
        title={
          !participantIds
            ? 'Loading job…'
            : userIds.length < 2
              ? 'Need at least two people on this gig'
              : 'New thread with everyone on this job'
        }
        className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-ember/35 bg-ember text-white shadow-md shadow-ember/20 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        aria-label={`New group chat for ${jobLabel}`}
      >
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-new-thread-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-edge bg-high p-5 shadow-xl shadow-black/40"
            onMouseDown={(ev) => ev.stopPropagation()}
          >
            <h2 id="job-new-thread-title" className="text-lg font-bold text-fg">
              New group chat
            </h2>
            <p className="mt-1 text-sm text-muted">
              Includes the {userIds.length} people assigned to this job.
            </p>
            <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted">Chat name</span>
                <input
                  type="text"
                  value={threadName}
                  onChange={(e) => setThreadName(e.target.value)}
                  className="rounded-xl border border-edge bg-raised px-3 py-2.5 text-sm text-fg focus:border-ember/50 focus:outline-none focus:ring-2 focus:ring-ember/25"
                  maxLength={200}
                />
              </label>
              {error && <p className="text-sm text-danger">{error}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-edge px-4 py-2 text-sm font-medium text-muted hover:bg-raised hover:text-fg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl border border-ember/40 bg-ember px-4 py-2 text-sm font-semibold text-white shadow-md shadow-ember/25 disabled:opacity-40"
                >
                  {busy ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
