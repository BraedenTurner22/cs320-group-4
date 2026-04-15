'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMessagingUnread } from '@/components/providers/MessagingUnreadProvider'
import type { Job, Message, MessageThread, UserProfile } from '@/types'
import MessageBubble from '@/components/threads/MessageBubble'
import MessageInput from '@/components/threads/MessageInput'
import ParticipantChips from '@/components/threads/ParticipantChips'
import type { ParticipantChip } from '@/components/threads/ParticipantChips'
import { markThreadUpTo } from '@/lib/messaging-read-cookie'

export default function ThreadDetailPage() {
  const { threadId } = useParams<{ threadId: string }>()
  const router = useRouter()
  const { refresh: refreshUnread } = useMessagingUnread()
  const [thread, setThread] = useState<MessageThread | null>(null)
  const [jobTitle, setJobTitle] = useState<string | null>(null)
  const [jobLoaded, setJobLoaded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentProfileId, setCurrentProfileId] = useState<number>(0)
  const [userMap, setUserMap] = useState<Record<number, string>>({})
  const [avatarByUserId, setAvatarByUserId] = useState<Record<number, string | null>>({})
  const [participants, setParticipants] = useState<UserProfile[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastMarkedMaxRef = useRef<number | null>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)
  const numericThreadId = Number(threadId)

  const [renamingThread, setRenamingThread] = useState(false)
  const [renameDraft, setRenameDraft] = useState('')
  const [renameError, setRenameError] = useState<string | null>(null)
  const [renameSaving, setRenameSaving] = useState(false)

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/threads/${threadId}/messages`)
    if (res.ok) setMessages(await res.json())
  }, [threadId])

  useEffect(() => {
    async function init() {
      setMessages([])
      setThread(null)
      setJobTitle(null)
      setJobLoaded(false)
      setUserMap({})
      setAvatarByUserId({})
      setParticipants([])
      setRenamingThread(false)
      setRenameError(null)
      // Current user
      try {
        const profileRes = await fetch('/api/profile')
        if (profileRes.ok) {
          const prof: UserProfile = await profileRes.json()
          setCurrentProfileId(prof.id)
        }
      } catch { /* Not authenticated */ }

      // Thread info + job title
      const threadRes = await fetch(`/api/threads/${threadId}`)
      if (threadRes.ok) {
        const thr: MessageThread = await threadRes.json()
        setThread(thr)
        try {
          const jobRes = await fetch(`/api/jobs/${thr.job}`)
          if (jobRes.ok) {
            const job: Job = await jobRes.json()
            setJobTitle(job.title)
          }
        } catch {
          /* ignore */
        } finally {
          setJobLoaded(true)
        }
      }

      // Participants → id:name map
      const usersRes = await fetch(`/api/threads/${threadId}/users`)
      if (usersRes.ok) {
        const users: UserProfile[] = await usersRes.json()
        const map: Record<number, string> = {}
        const avatars: Record<number, string | null> = {}
        users.filter(Boolean).forEach((u) => {
          map[u.id] = u.Username
          avatars[u.id] = u.profile_picture ?? null
        })
        setUserMap(map)
        setAvatarByUserId(avatars)
        setParticipants(
          [...users.filter(Boolean)].sort((a, b) =>
            (a.Username ?? '').localeCompare(b.Username ?? '', undefined, {
              sensitivity: 'base',
            }),
          ),
        )
      }

      await fetchMessages()
    }
    init()
  }, [threadId, fetchMessages])

  useEffect(() => {
    if (!renamingThread) return
    renameInputRef.current?.focus()
    renameInputRef.current?.select()
  }, [renamingThread])

  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    lastMarkedMaxRef.current = null
  }, [numericThreadId])

  useEffect(() => {
    if (!Number.isFinite(numericThreadId)) return
    if (
      messages.length > 0 &&
      messages.some((m) => m.message_thread !== numericThreadId)
    ) {
      return
    }
    const maxId =
      messages.length === 0 ? 0 : Math.max(...messages.map((m) => m.MessageId))
    markThreadUpTo(numericThreadId, maxId)
    if (lastMarkedMaxRef.current !== maxId) {
      lastMarkedMaxRef.current = maxId
      void refreshUnread()
    }
  }, [messages, numericThreadId, refreshUnread])

  function beginRename() {
    if (!thread) return
    setRenameError(null)
    setRenameDraft(thread['Thread name'])
    setRenamingThread(true)
  }

  function cancelRename() {
    setRenamingThread(false)
    setRenameError(null)
  }

  async function saveRename() {
    const name = renameDraft.trim()
    if (!name) {
      setRenameError('Name cannot be empty')
      return
    }
    setRenameSaving(true)
    setRenameError(null)
    try {
      const res = await fetch(`/api/threads/${threadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setRenameError(typeof err.error === 'string' ? err.error : 'Could not rename thread')
        return
      }
      const updated: MessageThread = await res.json()
      setThread(updated)
      setRenamingThread(false)
    } finally {
      setRenameSaving(false)
    }
  }

  const jobSubtitle =
    thread &&
    (jobLoaded ? (jobTitle ?? `Job #${thread.job}`) : 'Loading...')

  const displayParticipants = useMemo((): ParticipantChip[] => {
    const sortByName = (a: ParticipantChip, b: ParticipantChip) =>
      (a.Username ?? '').localeCompare(b.Username ?? '', undefined, {
        sensitivity: 'base',
      })

    let list: ParticipantChip[]
    if (participants.length > 0) {
      list = [...participants].sort(sortByName)
    } else {
      list = Object.keys(userMap)
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id))
        .map((id) => ({
          id,
          Username: userMap[id],
          profile_picture: avatarByUserId[id] ?? null,
        }))
        .sort(sortByName)
    }
    if (currentProfileId > 0) {
      return list.filter((p) => p.id !== currentProfileId)
    }
    return list
  }, [participants, userMap, avatarByUserId, currentProfileId])

  async function handleSend(content: string) {
    const res = await fetch(`/api/threads/${threadId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    if (!res.ok) throw new Error('Failed to send')
    await fetchMessages()
  }

  return (
    <div className="flex h-[calc(100dvh-6rem-2pt)] min-h-0 flex-col">
      {/* Thread header */}
      <div className="border-b border-edge pb-2 mb-2">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl rounded-br-md border border-ember/30 bg-ember text-white shadow-md shadow-ember/20 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            aria-label="Back to previous page"
          >
            <svg
              className="size-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            {renamingThread ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0 flex-1 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={renameDraft}
                      onChange={(e) => setRenameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') cancelRename()
                        if (e.key === 'Enter') void saveRename()
                      }}
                      disabled={renameSaving}
                      className="min-w-[4.8rem] w-[25%] max-w-full rounded-xl border border-edge bg-high px-3 py-2 text-xl font-bold text-fg placeholder:text-muted/50 focus:border-ember/50 focus:outline-none focus:ring-2 focus:ring-ember/30 disabled:opacity-50"
                      aria-label="Thread name"
                      maxLength={200}
                    />
                    <button
                      type="button"
                      onClick={() => void saveRename()}
                      disabled={renameSaving}
                      className="rounded-xl border border-ember/40 bg-ember px-3 py-2 text-sm font-semibold text-white shadow-md shadow-ember/20 transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                      {renameSaving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelRename}
                      disabled={renameSaving}
                      className="rounded-xl border border-edge px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-raised hover:text-fg disabled:opacity-40"
                    >
                      Cancel
                    </button>
                  </div>
                  {renameError && (
                    <p className="text-xs text-danger">{renameError}</p>
                  )}
                </div>
                <ParticipantChips
                  participants={displayParticipants}
                  listClassName="shrink-0 sm:justify-end sm:pt-0.5"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="flex min-w-0 flex-1 flex-row flex-wrap items-start gap-x-2 gap-y-1">
                  <div className="min-w-0 w-fit max-w-[calc(100%-3.25rem)]">
                    <h1 className="break-words text-xl font-bold text-fg">
                      {thread?.['Thread name'] ?? 'Loading...'}
                    </h1>
                    {thread && jobSubtitle && (
                      <p className="mt-0.5 text-muted text-[calc(0.75rem+2pt)]">
                        {jobSubtitle}
                      </p>
                    )}
                  </div>
                  {thread && (
                    <button
                      type="button"
                      onClick={beginRename}
                      className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-edge bg-raised text-muted transition-colors hover:border-ember/40 hover:bg-high hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-ember/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:size-11"
                      aria-label="Edit thread name"
                    >
                      <svg
                        className="size-5 sm:size-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </button>
                  )}
                </div>
                <ParticipantChips
                  participants={displayParticipants}
                  listClassName="shrink-0 sm:justify-end sm:pt-0.5"
                />
              </div>
            )}
            {thread && renamingThread && jobSubtitle && (
              <p
                className="mt-0.5 text-muted text-[calc(0.75rem+2pt)]"
              >
                {jobSubtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-2">
        {messages.length === 0 && (
          <p className="text-center text-muted/50 text-sm py-8">No messages yet — say hello!</p>
        )}
        {messages.map((msg) => {
          const name = userMap[msg.Sender] ?? 'User'
          return (
            <MessageBubble
              key={msg.MessageId}
              message={msg}
              isCurrentUser={msg.Sender === currentProfileId}
              senderName={name}
              senderAvatarUrl={avatarByUserId[msg.Sender]}
            />
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input — pt-4 above bar; mb pulls bar up to trim gap below */}
      <div className="shrink-0 border-t border-edge pt-4 pb-0 mb-[calc(-0.5rem-1pt)]">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  )
}
