import admin from 'firebase-admin'
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'

admin.initializeApp()

/**
 * One-time bootstrap secret.
 *
 * Set it via:
 *   firebase functions:secrets:set ADMIN_GRANT_SECRET
 *
 * After you grant the first admin, rotate or delete it.
 */
const ADMIN_GRANT_SECRET = defineSecret('ADMIN_GRANT_SECRET')

function isCallerAdmin(context: { auth?: { token?: Record<string, unknown> } } | undefined): boolean {
  return context?.auth?.token?.admin === true
}

/**
 * Admin-only callable function: grants admin claim to another user.
 *
 * Usage (from an already-admin signed-in client):
 *   httpsCallable(functions, 'grantAdmin')({ uid: '...' })
 */
export const grantAdmin = onCall(async (request) => {
  if (!isCallerAdmin({ auth: request.auth })) {
    throw new HttpsError('permission-denied', 'Admin only.')
  }

  const uid = String((request.data as unknown as { uid?: unknown })?.uid || '').trim()
  if (!uid) throw new HttpsError('invalid-argument', 'uid is required.')

  await admin.auth().setCustomUserClaims(uid, { admin: true })
  return { ok: true }
})

/**
 * Bootstrap endpoint for the very first admin.
 *
 * This is intentionally NOT callable (so you can do it from curl/postman once),
 * guarded by a secret header:
 *   x-admin-grant-secret: <secret>
 *
 * POST JSON body:
 *   { "uid": "..." }
 *
 * Deploy with secrets:
 *   firebase deploy --only functions
 */
export const bootstrapGrantAdmin = onRequest(
  { secrets: [ADMIN_GRANT_SECRET] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'method-not-allowed' })
      return
    }

    const header = String(req.header('x-admin-grant-secret') || '')
    const secret = ADMIN_GRANT_SECRET.value()
    if (!secret || header !== secret) {
      res.status(403).json({ ok: false, error: 'forbidden' })
      return
    }

    const uid = String((req.body as any)?.uid || '').trim()
    if (!uid) {
      res.status(400).json({ ok: false, error: 'uid-required' })
      return
    }

    await admin.auth().setCustomUserClaims(uid, { admin: true })
    res.status(200).json({ ok: true })
  }
)


