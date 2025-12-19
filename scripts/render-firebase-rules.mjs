import fs from 'node:fs'
import path from 'node:path'

function parseDotEnv(content) {
  const env = {}
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    let value = trimmed.slice(idx + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }
  return env
}

function getAdminUids(env) {
  const raw = env.VITE_ADMIN_UIDS || env.VITE_ADMIN_UID || ''
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function renderRules(template, uids) {
  const uidList = uids.map((u) => `"${u}"`).join(',\n          ')
  return template.replace(/"ADMIN_UID_1"/g, uidList || '"ADMIN_UID_1"')
}

const repoRoot = process.cwd()
const envPath = path.join(repoRoot, '.env.local')
const envTemplatePath = path.join(repoRoot, 'env.local.template')
const firestoreRulesPath = path.join(repoRoot, 'firebase.rules', 'firestore.rules')
const storageRulesPath = path.join(repoRoot, 'firebase.rules', 'storage.rules')

const envFile = fs.existsSync(envPath) ? envPath : envTemplatePath
const envContent = fs.readFileSync(envFile, 'utf8')
const env = parseDotEnv(envContent)
const adminUids = getAdminUids(env)

if (adminUids.length === 0) {
  // eslint-disable-next-line no-console
  console.warn(
    'WARN: VITE_ADMIN_UID(S) не задан. Rules будут выведены с placeholder "ADMIN_UID_1".'
  )
}

const firestoreTemplate = fs.readFileSync(firestoreRulesPath, 'utf8')
const storageTemplate = fs.readFileSync(storageRulesPath, 'utf8')

const firestoreRendered = renderRules(firestoreTemplate, adminUids)
const storageRendered = renderRules(storageTemplate, adminUids)

// eslint-disable-next-line no-console
console.log('=== Firestore Rules ===\n')
// eslint-disable-next-line no-console
console.log(firestoreRendered)
// eslint-disable-next-line no-console
console.log('\n=== Storage Rules ===\n')
// eslint-disable-next-line no-console
console.log(storageRendered)


