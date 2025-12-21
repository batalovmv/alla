import { CONTACT_INFO } from '../config/constants'
import { contactInfoService } from '../services/firebaseService'
import { ContactInfo } from '../types'
import { safeHttpUrl, safeIframeSrc } from './url'
import { formatWorkingHoursFromSchedule, normalizeWorkingSchedule, parseWorkingHoursStringToSchedule } from './workingHours'

const useFirebase =
  !!import.meta.env.VITE_FIREBASE_API_KEY && !!import.meta.env.VITE_FIREBASE_PROJECT_ID

let cached: ContactInfo | null = null
let inflight: Promise<ContactInfo> | null = null

function normalize(raw: any | null | undefined): ContactInfo {
  const social = raw?.socialMedia || {}
  const envMapEmbedUrl = safeIframeSrc(import.meta.env.VITE_MAP_EMBED_URL || '')
  const schedule = normalizeWorkingSchedule(raw?.workingSchedule) || null
  const derivedHours = schedule
    ? formatWorkingHoursFromSchedule(schedule)
    : null
  return {
    phone: raw?.phone || CONTACT_INFO.phone,
    whatsappPhone: raw?.whatsappPhone || '',
    email: raw?.email || CONTACT_INFO.email,
    address: raw?.address || CONTACT_INFO.address,
    workingHours: derivedHours || raw?.workingHours || CONTACT_INFO.workingHours,
    workingSchedule: schedule || (raw?.workingHours ? parseWorkingHoursStringToSchedule(raw.workingHours) : undefined),
    socialMedia: {
      instagram: safeHttpUrl(social.instagram || CONTACT_INFO.socialMedia.instagram || ''),
      vk: safeHttpUrl(social.vk || CONTACT_INFO.socialMedia.vk || ''),
      telegram: social.telegram || CONTACT_INFO.socialMedia.telegram || '',
      whatsapp: safeHttpUrl(social.whatsapp || CONTACT_INFO.socialMedia.whatsapp || ''),
    },
    // Priority: Firestore value (admin-managed) -> env fallback (for no-Firebase / initial setup)
    mapEmbedUrl: safeIframeSrc(raw?.mapEmbedUrl || '') || envMapEmbedUrl,
    whatsappEnabled: raw?.whatsappEnabled !== false,
  }
}

export async function getContactInfo(opts?: { force?: boolean }): Promise<ContactInfo> {
  if (!useFirebase) return normalize(null)
  if (!opts?.force && cached) return cached
  if (!opts?.force && inflight) return inflight

  inflight = (async () => {
    try {
      const data = await contactInfoService.get()
      cached = normalize(data)
      return cached
    } catch {
      cached = normalize(null)
      return cached
    } finally {
      inflight = null
    }
  })()

  return inflight
}


