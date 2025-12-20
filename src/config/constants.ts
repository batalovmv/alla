export const CONTACT_INFO = {
  // Fallback: используется если Firestore contactInfo/main ещё не заполнен админом
  phone: '+7 (XXX) XXX-XX-XX',
  email: 'info@example.com',
  address: 'г. [Название города], ул. [Название улицы], д. [Номер]',
  workingHours: 'Пн-Пт: 9:00 - 18:00, Сб: 10:00 - 16:00',
  socialMedia: {
    instagram: '',
    vk: '',
    telegram: '',
    whatsapp: '',
  },
}

export const SITE_NAME = (import.meta.env.VITE_SITE_NAME as string | undefined) || 'A.K.beauty'
export const SITE_DESCRIPTION =
  (import.meta.env.VITE_SITE_DESCRIPTION as string | undefined) ||
  'Профессиональные косметологические процедуры'

