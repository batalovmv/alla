export function sanitizeWhatsappPhone(raw: string | undefined | null): string {
  return String(raw || '').replace(/\D/g, '')
}

export function buildWhatsAppHref(opts: {
  whatsappPhone: string | undefined | null
  text?: string
}): string | null {
  const phone = sanitizeWhatsappPhone(opts.whatsappPhone)
  if (!phone) return null
  const base = `https://wa.me/${phone}`
  if (!opts.text) return base
  return `${base}?text=${encodeURIComponent(opts.text)}`
}




