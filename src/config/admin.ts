export const ADMIN_UIDS: string[] = (() => {
  const raw =
    (import.meta.env.VITE_ADMIN_UIDS as string | undefined) ||
    (import.meta.env.VITE_ADMIN_UID as string | undefined) ||
    ''

  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
})()

export function isAdminUid(uid: string | undefined | null): boolean {
  if (!uid) return false
  if (ADMIN_UIDS.length === 0) return false
  return ADMIN_UIDS.includes(uid)
}





