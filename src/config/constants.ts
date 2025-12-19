export const CONTACT_INFO = {
  phone: (import.meta.env.VITE_CONTACT_PHONE as string | undefined) || '+7 (XXX) XXX-XX-XX',
  email: (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) || 'info@example.com',
  address: (import.meta.env.VITE_CONTACT_ADDRESS as string | undefined) || 'г. [Название города], ул. [Название улицы], д. [Номер]',
  workingHours:
    (import.meta.env.VITE_CONTACT_WORKING_HOURS as string | undefined) ||
    'Пн-Пт: 9:00 - 18:00, Сб: 10:00 - 16:00',
  socialMedia: {
    instagram: (import.meta.env.VITE_SOCIAL_INSTAGRAM as string | undefined) || '',
    vk: (import.meta.env.VITE_SOCIAL_VK as string | undefined) || '',
    telegram: (import.meta.env.VITE_SOCIAL_TELEGRAM as string | undefined) || '',
    whatsapp: (import.meta.env.VITE_SOCIAL_WHATSAPP as string | undefined) || '',
  },
}

export const SITE_NAME = (import.meta.env.VITE_SITE_NAME as string | undefined) || 'Косметология'
export const SITE_DESCRIPTION =
  (import.meta.env.VITE_SITE_DESCRIPTION as string | undefined) ||
  'Профессиональные косметологические процедуры'

