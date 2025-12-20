import type { User } from 'firebase/auth'

/**
 * Checks admin access via Firebase Custom Claims.
 * If Firebase is not configured or claim missing, returns false.
 */
export async function isAdminByClaims(user: User | null): Promise<boolean> {
  if (!user) return false
  try {
    const res = await user.getIdTokenResult()
    return res?.claims?.admin === true
  } catch {
    return false
  }
}


