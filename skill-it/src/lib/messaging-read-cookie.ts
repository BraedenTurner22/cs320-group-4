const COOKIE_NAME = 'skillit_msg_last_read'
const MAX_AGE_SEC = 60 * 60 * 24 * 365

function isBrowser() {
  return typeof document !== 'undefined'
}

function parseCookie(raw: string): Record<number, number> {
  const prefix = `${COOKIE_NAME}=`
  const part = raw.split('; ').find((p) => p.startsWith(prefix))
  if (!part) return {}
  const encoded = part.slice(prefix.length)
  try {
    const json = JSON.parse(decodeURIComponent(encoded))
    if (!json || typeof json !== 'object') return {}
    const out: Record<number, number> = {}
    for (const [k, v] of Object.entries(json)) {
      const id = Number(k)
      const n = Number(v)
      if (!Number.isFinite(id) || !Number.isFinite(n)) continue
      out[id] = n
    }
    return out
  } catch {
    return {}
  }
}

function writeCookie(map: Record<number, number>) {
  if (!isBrowser()) return
  const payload = encodeURIComponent(JSON.stringify(map))
  document.cookie = `${COOKIE_NAME}=${payload}; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax`
}

export function getLastReads(): Record<number, number> {
  if (!isBrowser()) return {}
  return parseCookie(document.cookie)
}

export function setLastReads(reads: Record<number, number>) {
  writeCookie(reads)
}

export function mergeLastReads(patch: Record<number, number>) {
  const next = { ...getLastReads(), ...patch }
  writeCookie(next)
}

export function markThreadUpTo(threadId: number, messageId: number) {
  const reads = getLastReads()
  const prev = reads[threadId] ?? 0
  reads[threadId] = Math.max(prev, messageId)
  writeCookie(reads)
}
