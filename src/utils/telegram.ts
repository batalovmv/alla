export function normalizeTelegramLink(raw: string | undefined | null): string {
  return String(raw || '').trim()
}

export function buildTelegramHref(opts: { telegramLink: string | undefined | null }): string | null {
  const link = normalizeTelegramLink(opts.telegramLink)
  if (!link) return null

  // Allow common safe schemes
  if (link.startsWith('https://t.me/') || link.startsWith('http://t.me/')) return link
  if (link.startsWith('tg://')) return link

  // If admin entered just username like "@akbeauty" or "akbeauty"
  const cleaned = link.replace(/^@/, '')
  if (/^[a-zA-Z0-9_]{4,}$/.test(cleaned)) {
    return `https://t.me/${cleaned}`
  }

  return null
}


