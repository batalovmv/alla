export function safeHttpUrl(raw: string | undefined | null): string {
  const s = String(raw || '').trim()
  if (!s) return ''

  try {
    // Accept absolute URLs only; reject relative and unknown schemes.
    const u = new URL(s)
    const p = u.protocol.toLowerCase()
    if (p !== 'https:' && p !== 'http:') return ''
    return u.toString()
  } catch {
    return ''
  }
}

export function safeIframeSrc(raw: string | undefined | null): string {
  // Same as safeHttpUrl for now; keep separate in case we want to allow-list domains later.
  return safeHttpUrl(raw)
}




