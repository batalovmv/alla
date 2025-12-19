import { CONTACT_INFO } from '../config/constants'
import { contactInfoService } from '../services/firebaseService'
import { ContactInfo } from '../types'

const useFirebase =
  !!import.meta.env.VITE_FIREBASE_API_KEY && !!import.meta.env.VITE_FIREBASE_PROJECT_ID

let cached: ContactInfo | null = null
let inflight: Promise<ContactInfo> | null = null

function normalize(raw: any | null | undefined): ContactInfo {
  const social = raw?.socialMedia || {}
  return {
    phone: raw?.phone || CONTACT_INFO.phone,
    email: raw?.email || CONTACT_INFO.email,
    address: raw?.address || CONTACT_INFO.address,
    workingHours: raw?.workingHours || CONTACT_INFO.workingHours,
    socialMedia: {
      instagram: social.instagram || CONTACT_INFO.socialMedia.instagram || '',
      vk: social.vk || CONTACT_INFO.socialMedia.vk || '',
      telegram: social.telegram || CONTACT_INFO.socialMedia.telegram || '',
      whatsapp: social.whatsapp || CONTACT_INFO.socialMedia.whatsapp || '',
    },
    mapEmbedUrl: raw?.mapEmbedUrl || '',
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


