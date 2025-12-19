/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string

  readonly VITE_ADMIN_UID?: string
  readonly VITE_ADMIN_UIDS?: string

  readonly VITE_SITE_URL?: string
  readonly VITE_SITE_NAME?: string
  readonly VITE_SITE_DESCRIPTION?: string

  readonly VITE_CONTACT_PHONE?: string
  readonly VITE_CONTACT_EMAIL?: string
  readonly VITE_CONTACT_ADDRESS?: string
  readonly VITE_CONTACT_WORKING_HOURS?: string

  readonly VITE_SOCIAL_INSTAGRAM?: string
  readonly VITE_SOCIAL_VK?: string
  readonly VITE_SOCIAL_TELEGRAM?: string
  readonly VITE_SOCIAL_WHATSAPP?: string

  readonly VITE_MAP_EMBED_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

