export const validatePhone = (phone: string): boolean => {
  return normalizePhone(phone) !== null
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const formatPhone = (phone: string): string => {
  return normalizePhone(phone) || phone
}

// Normalizes a phone to E.164-like format for RU/KZ: +7XXXXXXXXXX (11 digits total including country code).
export const normalizePhone = (raw: string): string | null => {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return null

  let d = digits
  // Accept: 10 digits (national) or 11 digits starting with 7/8
  if (d.length === 11 && d.startsWith('8')) d = `7${d.slice(1)}`
  if (d.length === 10) d = `7${d}`
  if (d.length !== 11) return null
  if (!d.startsWith('7')) return null

  const national = d.slice(1) // 10 digits
  // Basic sanity: must be exactly 10 digits after country code.
  // (We intentionally do NOT over-restrict prefixes here to keep UX simple.)
  if (!/^\d{10}$/.test(national)) return null

  return `+${d}`
}

// Formats a phone as "+7 (XXX) XXX-XX-XX" progressively while the user types.
export const formatPhoneMask = (raw: string): string => {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return ''

  let d = digits
  if (d.startsWith('8')) d = `7${d.slice(1)}`
  if (d.startsWith('7')) d = d.slice(1)
  // Keep only first 10 digits of national part (ignore extra input; do NOT shift digits)
  if (d.length > 10) d = d.slice(0, 10)

  const p1 = d.slice(0, 3)
  const p2 = d.slice(3, 6)
  const p3 = d.slice(6, 8)
  const p4 = d.slice(8, 10)

  let out = '+7'
  if (p1) out += ` (${p1}`
  if (p1.length === 3) out += ')'
  if (p2) out += ` ${p2}`
  if (p3) out += `-${p3}`
  if (p4) out += `-${p4}`
  return out
}

