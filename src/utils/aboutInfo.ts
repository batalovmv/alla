import { aboutInfoService } from '../services/firebaseService'
import { AboutInfo } from '../types'
import { safeHttpUrl } from './url'

const useFirebase =
  !!import.meta.env.VITE_FIREBASE_API_KEY && !!import.meta.env.VITE_FIREBASE_PROJECT_ID

let cached: AboutInfo | null = null
let inflight: Promise<AboutInfo> | null = null

function normalize(raw: any | null | undefined): AboutInfo {
  const certificatesRaw = Array.isArray(raw?.certificates) ? raw.certificates : []
  const certificates = certificatesRaw
    .map((v: any) => safeHttpUrl(String(v || '')))
    .filter(Boolean)

  return {
    name: String(raw?.name || '').trim(),
    photo: safeHttpUrl(raw?.photo || ''),
    education: String(raw?.education || '').trim(),
    experience: String(raw?.experience || '').trim(),
    description: String(raw?.description || '').trim(),
    certificates,
  }
}

export async function getAboutInfo(opts?: { force?: boolean }): Promise<AboutInfo> {
  if (!useFirebase) return normalize(null)
  if (!opts?.force && cached) return cached
  if (!opts?.force && inflight) return inflight

  inflight = (async () => {
    try {
      const data = await aboutInfoService.get()
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


